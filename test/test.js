var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var app = require('../src/app');

describe('POST /create_p2sh', function() {
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
    .send({ public_key: "03b3931eec7cf5357b3405c7127fd827f985d0ee2a7779a63fb06605626536d6ca" })
    .end(function(err, res) {
      if (err) return done(err);
      expect(res.body.p2sh_address).to.be.a('string');
      expect(res.body.p2sh_address).to.have.lengthOf(34);
      expect(res.body.redeem_script).to.be.a('string');
      expect(res.body.redeem_script).to.have.lengthOf(142);
      done();
    });
  });
});
