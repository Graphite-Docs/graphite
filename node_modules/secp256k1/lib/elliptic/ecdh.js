var createHash = require('crypto').createHash

var asserts = require('../asserts')
var messages = require('../messages')
var ec = require('./ec')
var util = require('./util')

/**
 * Synchronous .ecdh
 * @method recoverSync
 * @param {Buffer} publicKey
 * @param {Buffer} secretKey
 * @return {Buffer}
 */
exports.ecdhSync = function (publicKey, secretKey) {
  asserts.checkTypeBuffer(publicKey, messages.EC_PUBKEY_TYPE_INVALID)
  asserts.checkBufferLength2(publicKey, 33, 65, messages.EC_PUBKEY_LENGTH_INVALID)

  asserts.checkTypeBuffer(secretKey, messages.EC_PRIVKEY_TYPE_INVALID)
  asserts.checkBufferLength(secretKey, 32, messages.EC_PRIVKEY_LENGTH_INVALID)

  if (!util.isValidPublicKey(publicKey)) {
    throw new Error(messages.EC_PUBKEY_PARSE_FAIL)
  }

  if (!util.isValidSecretKey(secretKey)) {
    throw new Error(messages.ECDH_FAIL)
  }

  var point = ec.keyFromPublic(publicKey).pub.mul(ec.keyFromPrivate(secretKey).priv)
  var buf = new Buffer(point.encode(null, 32))
  return createHash('sha256').update(buf).digest()
}
