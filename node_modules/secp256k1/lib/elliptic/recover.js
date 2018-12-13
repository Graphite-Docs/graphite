var asserts = require('../asserts')
var messages = require('../messages')
var ec = require('./ec')
var util = require('./util')
var verify = require('./verify.js')

/**
 * Synchronous .recover
 * @method recoverSync
 * @param {Buffer} msg
 * @param {Buffer} signature
 * @param {number} recovery
 * @return {Buffer}
 */
exports.recoverSync = function (msg, signature, recovery) {
  asserts.checkTypeBuffer(msg, messages.MSG32_TYPE_INVALID)
  asserts.checkBufferLength(msg, 32, messages.MSG32_LENGTH_INVALID)

  asserts.checkTypeBuffer(signature, messages.ECDSA_SIGNATURE_TYPE_INVALID)
  asserts.checkBufferLength(signature, 64, messages.ECDSA_SIGNATURE_LENGTH_INVALID)

  asserts.checkTypeNumber(recovery, messages.ECDSA_SIGNATURE_RECOVERY_ID_TYPE_INVALID)
  asserts.checkNumberInInterval(recovery, -1, 4, messages.ECDSA_SIGNATURE_RECOVERY_ID_VALUE_INVALID)

  if (!util.isValidSignature(signature)) {
    throw new Error(messages.ECDSA_SIGNATURE_PARSE_FAIL)
  }

  var sigObj = {r: signature.slice(0, 32), s: signature.slice(32, 64)}
  var pubKey = ec.recoverPubKey(msg, sigObj, recovery)
  var pubKeyBuf = new Buffer(pubKey.encodeCompressed())
  if (!verify.verifySync(msg, signature, pubKeyBuf)) {
    throw new Error(messages.ECDSA_RECOVER_FAIL)
  }
  return pubKeyBuf
}
