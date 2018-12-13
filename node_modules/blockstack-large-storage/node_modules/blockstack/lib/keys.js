'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEntropy = getEntropy;
exports.makeECPrivateKey = makeECPrivateKey;
exports.publicKeyToAddress = publicKeyToAddress;
exports.getPublicKeyFromPrivate = getPublicKeyFromPrivate;

var _crypto = require('crypto');

var _bitcoinjsLib = require('bitcoinjs-lib');

var _bigi = require('bigi');

var _bigi2 = _interopRequireDefault(_bigi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEntropy(numberOfBytes) {
  if (!numberOfBytes) {
    numberOfBytes = 32;
  }
  return (0, _crypto.randomBytes)(numberOfBytes);
}
function makeECPrivateKey() {
  var keyPair = new _bitcoinjsLib.ECPair.makeRandom({ rng: getEntropy });
  return keyPair.d.toBuffer(32).toString('hex');
}

function publicKeyToAddress(publicKey) {
  var publicKeyBuffer = new Buffer(publicKey, 'hex');
  var publicKeyHash160 = _bitcoinjsLib.crypto.hash160(publicKeyBuffer);
  var address = _bitcoinjsLib.address.toBase58Check(publicKeyHash160, 0x00);
  return address;
}

function getPublicKeyFromPrivate(privateKey) {
  var keyPair = new _bitcoinjsLib.ECPair(_bigi2.default.fromHex(privateKey));
  return keyPair.getPublicKeyBuffer().toString('hex');
}