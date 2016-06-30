var express = require('express');
var EscrowWallet = require('escrowwallet');
var bodyParser = require('body-parser');
var KeyStorage = require('./lib/key_storage');

var storage = new KeyStorage();
var app = express();

var network = 'testnet';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/create_p2sh', function(req, res, next) {
  var publicKey = req.body.public_key;

  try {
    var wallet = new EscrowWallet(publicKey, { network: network });
  } catch(e) {
    return res.status(422).end("You must specify a valid public key");
  }

  storage.setKeys(wallet.getP2SHAddress(), publicKey, wallet.getWIF());

  return res.json({
    "p2sh_address": wallet.getP2SHAddress(),
    "redeem_script": wallet.getRedeemScript()
  });
});

app.post('/sign', function(req, res, next) {
  var keys = storage.getKeys(req.body.p2sh_address);
  if (!keys) {
    return res.status(422).end("Specified p2sh address isn't valid or wasn't generated on this server");
  }

  var index = parseInt(req.body.input_index);
  if (typeof index != 'number' || isNaN(index)) {
    return res.status(422).end("you must specify a numeric input_index");
  }

  var wallet = new EscrowWallet(keys.publicKey, { wif: keys.wif, network: network });
  try {
    var signed = wallet.signTransaction(req.body.tx_hex, index);
  } catch(e) {
    return res.status(422).end("Can't sign transaction. Check that the transaction hex is valid, and that you supplied the matching p2sh address and index");
  }

  return res.json({ "signed_tx": signed });
});

app.listen(6382, function(){
  console.log('Escrow Server is now listening on port 6382');
});
module.exports = app;
