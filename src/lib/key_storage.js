var KeyStorage = function() {
  this.storage = require('node-persist');
  this.storage.initSync();
}

KeyStorage.prototype.clear = function() {
  this.storage.clearSync();
}

KeyStorage.prototype.setKeys = function(p2shAddress, publicKey, wif) {
  this.storage.setItemSync(p2shAddress, { publicKey: publicKey, wif: wif });
}

KeyStorage.prototype.getKeys = function(p2shAddress) {
  return this.storage.getItemSync(p2shAddress);
}

module.exports = KeyStorage;
