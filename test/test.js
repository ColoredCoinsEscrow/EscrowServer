var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var app = require('../src/app');
var KeyStorage = require('../src/lib/key_storage')

var publicKey = '03b3931eec7cf5357b3405c7127fd827f985d0ee2a7779a63fb06605626536d6ca';
var p2shAddress = '2MtTdqqodWoXKkoNtvTKGb2NoPbZdTLDizD';
var wif = 'cNRtPuxr4iWGMPxch2LUC7fzEuZKjUyHNok85UKtpt3omDmGf5ta';
var tx = '01000000010541e698f0681f89cf06e8b05997a9c1e8f85fc91ee6df369ddb70d4ae650e6e0000000000ffffffff01204e00000000000017a914cd7b44d0b03f2d026d1e586d7ae18903b0d385f68700000000';
var index = 0;

var expected_tx = '01000000010541e698f0681f89cf06e8b05997a9c1e8f85fc91ee6df369ddb70d4ae650e6e0000000092000047304402205d4d15a387eaad6f568adedb478a9d02fe84a79787f3891fd47b77ad66056e89022068656464a61d1bb7f232daffb27baff57c9a042334a8d10d7b6539f87dc0fbbb0147522103b3931eec7cf5357b3405c7127fd827f985d0ee2a7779a63fb06605626536d6ca2102236919c606bce80134eaff2bb988e3a274527f6084dc90cef56ee6438532d5f952aeffffffff01204e00000000000017a914cd7b44d0b03f2d026d1e586d7ae18903b0d385f68700000000';

describe('POST /create_p2sh', function() {
  before(function() {
    this.storage = new KeyStorage();
  });

  afterEach(function() {
    this.storage.clear();
  });

  it('should require a public key', function(done) {
    request(app)
    .post('/create_p2sh')
    .type('form')
    .expect(422, done);
  });

  it('should require a valid public key', function(done) {
    request(app)
    .post('/create_p2sh')
    .type('form')
    .send({ public_key: "invalid" })
    .expect(422, done);
  });

  it('should respond with a P2SH Address and redeem script', function(done) {
    request(app)
    .post('/create_p2sh')
    .set('Accept', 'application/json')
    .type('form')
    .send({ public_key: publicKey })
    .end(function(err, res) {
      if (err) return done(err);
      expect(res.body.p2sh_address).to.be.a('string');
      expect(res.body.p2sh_address).to.have.lengthOf(35);
      expect(res.body.redeem_script).to.be.a('string');
      expect(res.body.redeem_script).to.have.lengthOf(142);
      done();
    });
  });

  it('should persist address, public key, and wif', function(done) {
    var self = this;
    request(app)
    .post('/create_p2sh')
    .set('Accept', 'application/json')
    .type('form')
    .send({ public_key: publicKey })
    .end(function(err, res) {
      if (err) return done(err);
      var keys = self.storage.getKeys(res.body.p2sh_address);
      expect(keys.publicKey).to.equal(publicKey);
      expect(keys.wif).to.be.a('string');
      expect(keys.wif).to.have.lengthOf(52);
      done();
    });
  });

  describe('POST /sign', function() {
    before(function() {
      this.storage = new KeyStorage();
    });

    afterEach(function() {
      this.storage.clear();
    });

    context('without generating address first', function() {
      it('should fail', function(done) {
        request(app)
        .post('/sign')
        .set('Accept', 'application/json')
        .type('form')
        .send({
          tx_hex: tx,
          input_index: index,
          p2sh_address: p2shAddress
        }).
        expect(422, done);
      });
    });

    context('when generated address first', function() {
      beforeEach(function() {
        this.storage.setKeys(p2shAddress, publicKey, wif);
      });

      context('with non-numeric input_index', function() {
        it('should fail', function(done) {
          request(app)
          .post('/sign')
          .set('Accept', 'application/json')
          .type('form')
          .send({
            tx_hex: tx,
            input_index: 'string',
            p2sh_address: p2shAddress
          }).
          expect(422, done);
        });
      });

      context('with invalid transaction hex', function() {
        it('should fail', function(done) {
          request(app)
          .post('/sign')
          .set('Accept', 'application/json')
          .type('form')
          .send({
            tx_hex: 'invalid',
            input_index: index,
            p2sh_address: p2shAddress
          }).
          expect(422, done);
        });
      });

      context('with out-of-bounds index', function() {
        it('should fail', function(done) {
          request(app)
          .post('/sign')
          .set('Accept', 'application/json')
          .type('form')
          .send({
            tx_hex: tx,
            input_index: 7,
            p2sh_address: p2shAddress
          }).
          expect(422, done);
        });
      });

      context('with correct parameters', function() {
        it('should return signed transaction', function(done) {
          request(app)
          .post('/sign')
          .set('Accept', 'application/json')
          .type('form')
          .send({
            tx_hex: tx,
            input_index: index,
            p2sh_address: p2shAddress
          }).
          expect({ "signed_tx": expected_tx }, done);
        });
      });
    });
  });
});
