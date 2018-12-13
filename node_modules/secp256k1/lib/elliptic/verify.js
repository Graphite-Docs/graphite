var asserts = require('../asserts')
var messages = require('../messages')
var ec = require('./ec')
var util = require('./util')

/**
 * Synchronous .verify
 * @method verifySync
 * @param {Buffer} msg
 * @param {Buffer} signature
 * @param {Buffer} publicKey
 * @return {boolean}
 */
exports.verifySync = function (msg, signature, publicKey) {
  asserts.checkTypeBuffer(msg, messages.MSG32_TYPE_INVALID)
  asserts.checkBufferLength(msg, 32, messages.MSG32_LENGTH_INVALID)

  asserts.checkTypeBuffer(signature, messages.ECDSA_SIGNATURE_TYPE_INVALID)
  asserts.checkBufferLength(signature, 64, messages.ECDSA_SIGNATURE_LENGTH_INVALID)

  asserts.checkTypeBuffer(publicKey, messages.EC_PUBKEY_TYPE_INVALID)
  asserts.checkBufferLength2(publicKey, 33, 65, messages.EC_PUBKEY_LENGTH_INVALID)

  if (!util.isValidSignature(signature)) {
    throw new Error(messages.ECDSA_SIGNATURE_PARSE_FAIL)
  }

  if (!util.isValidPublicKey(publicKey)) {
    throw new Error(messages.EC_PUBKEY_PARSE_FAIL)
  }

  var sigObj = {r: signature.slice(0, 32), s: signature.slice(32, 64)}
  return ec.verify(msg, sigObj, publicKey)
}
