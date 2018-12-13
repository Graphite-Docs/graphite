var BN = require('bn.js')

var asserts = require('../asserts')
var messages = require('../messages')
var ec = require('./ec')
var util = require('./util')

var EC_PRIVKEY_EXPORT_DER_COMPRESSED_BEGIN = new Buffer(
  '3081d30201010420', 'hex')
var EC_PRIVKEY_EXPORT_DER_COMPRESSED_MIDDLE = new Buffer(
  'a08185308182020101302c06072a8648ce3d0101022100fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f300604010004010704210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798022100fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141020101a124032200', 'hex')
var EC_PRIVKEY_EXPORT_DER_UNCOMPRESSED_BEGIN = new Buffer(
  '308201130201010420', 'hex')
var EC_PRIVKEY_EXPORT_DER_UNCOMPRESSED_MIDDLE = new Buffer(
  'a081a53081a2020101302c06072a8648ce3d0101022100fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f300604010004010704410479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8022100fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141020101a144034200', 'hex')

/**
 * Verify an ECDSA secret key.
 * @method verifySecetKey
 * @param {Buffer} secretKey the secret Key to verify
 * @return {boolean} `true` if secret key is valid, `false` otherwise
 */
exports.secretKeyVerify = function (secretKey) {
  asserts.checkTypeBuffer(secretKey, messages.EC_PRIVKEY_TYPE_INVALID)

  return secretKey.length === 32 && util.isValidSecretKey(secretKey)
}

/**
 * Export a secret key in DER format.
 * @method secretKeyExport
 * @param {Buffer} secretKey the secret key to export
 * @param {boolean} [compressed=true]
 * @return {Buffer}
 */
exports.secretKeyExport = function (secretKey, compressed) {
  if (compressed === undefined) {
    compressed = true
  }

  asserts.checkTypeBuffer(secretKey, messages.EC_PRIVKEY_TYPE_INVALID)
  asserts.checkBufferLength(secretKey, 32, messages.EC_PRIVKEY_LENGTH_INVALID)

  asserts.checkTypeBoolean(compressed, messages.COMPRESSED_TYPE_INVALID)

  if (!util.isValidSecretKey(secretKey)) {
    throw new Error(messages.EC_PRIVKEY_EXPORT_DER_FAIL)
  }

  var key = ec.keyFromPrivate(secretKey)
  var publicKey = new Buffer(key.getPublic(compressed, true))

  var result = new Buffer(compressed ? 214 : 279)
  var targetStart = 0
  if (compressed) {
    EC_PRIVKEY_EXPORT_DER_COMPRESSED_BEGIN.copy(result, targetStart)
    targetStart += EC_PRIVKEY_EXPORT_DER_COMPRESSED_BEGIN.length

    secretKey.copy(result, targetStart)
    targetStart += secretKey.length

    EC_PRIVKEY_EXPORT_DER_COMPRESSED_MIDDLE.copy(result, targetStart)
    targetStart += EC_PRIVKEY_EXPORT_DER_COMPRESSED_MIDDLE.length

    publicKey.copy(result, targetStart)
  } else {
    EC_PRIVKEY_EXPORT_DER_UNCOMPRESSED_BEGIN.copy(result, targetStart)
    targetStart += EC_PRIVKEY_EXPORT_DER_UNCOMPRESSED_BEGIN.length

    secretKey.copy(result, targetStart)
    targetStart += secretKey.length

    EC_PRIVKEY_EXPORT_DER_UNCOMPRESSED_MIDDLE.copy(result, targetStart)
    targetStart += EC_PRIVKEY_EXPORT_DER_UNCOMPRESSED_MIDDLE.length

    publicKey.copy(result, targetStart)
  }

  return result
}

/**
 * Import a secret key in DER format.
 * @method secretKeyImport
 * @param {Buffer} secretKey the secret key to import
 * @return {Buffer}
 */
exports.secretKeyImport = function (secretKey) {
  asserts.checkTypeBuffer(secretKey, messages.EC_PRIVKEY_TYPE_INVALID)

  do {
    var length = secretKey.length

    // sequence header
    var index = 0
    if (length < index + 1 || secretKey[index] !== 0x30) {
      break
    }
    index += 1

    // sequence length constructor
    if (length < index + 1 || !(secretKey[index] & 0x80)) {
      break
    }

    var lenb = secretKey[index] & 0x7f
    index += 1
    if (lenb < 1 || lenb > 2) {
      break
    }
    if (length < index + lenb) {
      break
    }

    // sequence length
    var len = secretKey[index + lenb - 1] | (lenb > 1 ? secretKey[index + lenb - 2] << 8 : 0)
    index += lenb
    if (length < index + len) {
      break
    }

    // sequence element 0: version number (=1)
    if (length < index + 3 ||
        secretKey[index] !== 0x02 ||
        secretKey[index + 1] !== 0x01 ||
        secretKey[index + 2] !== 0x01) {
      break
    }
    index += 3

    // sequence element 1: octet string, up to 32 bytes
    if (length < index + 2 ||
        secretKey[index] !== 0x04 ||
        secretKey[index + 1] > 0x20 ||
        length < index + 2 + secretKey[index + 1]) {
      break
    }

    secretKey = secretKey.slice(index + 2, index + 2 + secretKey[index + 1])
    if (util.isValidSecretKey(secretKey)) {
      return secretKey
    }
  } while (false)

  throw new Error(messages.EC_PRIVKEY_IMPORT_DER_FAIL)
}

/**
 * Tweak a secret key by adding tweak to it.
 * @method secretKeyTweakAdd
 * @param {Buffer} secretKey
 * @param {Buffer} tweak
 * @return {Buffer}
 */
exports.secretKeyTweakAdd = function (secretKey, tweak) {
  asserts.checkTypeBuffer(secretKey, messages.EC_PRIVKEY_TYPE_INVALID)
  asserts.checkBufferLength(secretKey, 32, messages.EC_PRIVKEY_LENGTH_INVALID)

  asserts.checkTypeBuffer(tweak, messages.TWEAK_TYPE_INVALID)
  asserts.checkBufferLength(tweak, 32, messages.TWEAK_LENGTH_INVALID)

  var bn = new BN(tweak)
  if (util.isOverflow(bn)) {
    throw new Error(messages.EC_PRIVKEY_TWEAK_ADD_FAIL)
  }

  bn = util.bnReduce(bn.iadd(new BN(secretKey)))
  if (bn.isZero()) {
    throw new Error(messages.EC_PRIVKEY_TWEAK_ADD_FAIL)
  }

  return new Buffer(bn.toArray(null, 32))
}

/**
 * Tweak a secret key by multiplying tweak to it.
 * @method secretKeyTweakMul
 * @param {Buffer} secretKey
 * @param {Buffer} tweak
 * @return {Buffer}
 */
exports.secretKeyTweakMul = function (secretKey, tweak) {
  asserts.checkTypeBuffer(secretKey, messages.EC_PRIVKEY_TYPE_INVALID)
  asserts.checkBufferLength(secretKey, 32, messages.EC_PRIVKEY_LENGTH_INVALID)

  asserts.checkTypeBuffer(tweak, messages.TWEAK_TYPE_INVALID)
  asserts.checkBufferLength(tweak, 32, messages.TWEAK_LENGTH_INVALID)

  var bn = new BN(tweak)
  if (util.isOverflow(bn) || bn.isZero()) {
    throw new Error(messages.EC_PRIVKEY_TWEAK_MUL_FAIL)
  }

  bn = util.bnReduce(bn.imul(new BN(secretKey)))
  return new Buffer(bn.toArray(null, 32))
}
