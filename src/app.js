var express = require('express');
var EscrowWallet = require('escrowwallet');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/create_p2sh', function(req, res, next){
  var publicKey = req.body.public_key;

  try {
    var wallet = new EscrowWallet(publicKey)
  } catch(e) {
    return res.status(422).end("You must specify a valid public key");
  }

  return res.json({
    "p2sh_address": wallet.getP2SHAddress(),
    "redeem_script": wallet.getRedeemScript()
  });
});

app.listen(6382, function(){
  console.log('Escrow Server is now listening on port 6382');
});
module.exports = app;

module.exports = app;
