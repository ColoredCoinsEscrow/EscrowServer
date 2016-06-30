var KeyStorage = require('../src/lib/key_storage');
var chai = require('chai');
var expect = chai.expect;

var mockP2shAddress = 'mockP2shAddress';
var mockPublicKey = 'mockPublicKey';
var mockWif = 'mockWif';

describe('key_storage', function() {
  beforeEach(function() {
    this.storage = new KeyStorage()
  });

  afterEach(function() {
    this.storage.clear();
  });

  it('should allow getting keys after setting them', function() {
    this.storage.setKeys(mockP2shAddress, mockPublicKey, mockWif);
    var fetched = this.storage.getKeys(mockP2shAddress);
    expect(fetched.publicKey).to.equal(mockPublicKey);
    expect(fetched.wif).to.equal(mockWif);
  });

  it('should be empty after clearing', function() {
    this.storage.setKeys(mockP2shAddress, mockPublicKey, mockWif);
    this.storage.clear()
    expect(this.storage.getKeys(mockP2shAddress)).to.be.undefined;
  });

});
