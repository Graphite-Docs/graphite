var BN = require('bn.js')

var asserts = require('../asserts')
var messages = require('../messages')
var ec = require('./ec')
var util = require('./util')

/**
 * Compute the public key for a secret key.
 * @method publicKeyCreate
 * @param {Buffer} secretKey a 32-byte private key
 * @return {Buffer} a 33-byte public key
 */
exports.publicKeyCreate = function (secretKey) {
  asserts.checkTypeBuffer(secretKey, messages.EC_PRIVKEY_TYPE_INVALID)
  asserts.checkBufferLength(secretKey, 32, messages.EC_PRIVKEY_LENGTH_INVALID)

  if (!util.isValidSecretKey(secretKey)) {
    throw new Error(messages.EC_PUBKEY_CREATE_FAIL)
  }

  var key = ec.keyFromPrivate(secretKey)
  return new Buffer(key.getPublic().encodeCompressed())
}

/**
 * Convert a publicKey to compressed or uncompressed form.
 * @method publicKeyConvert
 * @param {Buffer} publicKey a 33-byte or 65-byte public key
 * @param {boolean} [compressed=true]
 * @return {Buffer} a 33-byte or 65-byte public key
 */
exports.publicKeyConvert = function (publicKey, compressed) {
  if (compressed === undefined) {
    compressed = true
  }

  asserts.checkTypeBuffer(publicKey, messages.EC_PUBKEY_TYPE_INVALID)
  asserts.checkBufferLength2(publicKey, 33, 65, messages.EC_PUBKEY_LENGTH_INVALID)

  asserts.checkTypeBoolean(compressed, messages.COMPRESSED_TYPE_INVALID)

  if (!util.isValidPublicKey(publicKey)) {
    throw new Error(messages.EC_PUBKEY_PARSE_FAIL)
  }

  var pub = ec.keyFromPublic(publicKey).getPublic()
  return new Buffer(pub.encode(undefined, compressed))
}

/**
 * Verify an ECDSA public key.
 * @method publicKeyVerify
 * @param {Buffer} publicKey the public key to verify
 * @return {Boolean}
 */
exports.publicKeyVerify = function (publicKey) {
  asserts.checkTypeBuffer(publicKey, messages.EC_PUBKEY_TYPE_INVALID)

  return util.isValidPublicKey(publicKey)
}

/**
 * Tweak a public key by adding tweak times the generator to it.
 * @method publicKeyTweakAdd
 * @param {Buffer} publicKey
 * @param {Buffer} tweak
 * @return {Buffer}
 */
exports.publicKeyTweakAdd = function (publicKey, tweak) {
  asserts.checkTypeBuffer(publicKey, messages.EC_PUBKEY_TYPE_INVALID)
  asserts.checkBufferLength2(publicKey, 33, 65, messages.EC_PUBKEY_LENGTH_INVALID)

  asserts.checkTypeBuffer(tweak, messages.TWEAK_TYPE_INVALID)
  asserts.checkBufferLength(tweak, 32, messages.TWEAK_LENGTH_INVALID)

  if (!util.isValidPublicKey(publicKey)) {
    throw new Error(messages.EC_PUBKEY_PARSE_FAIL)
  }

  tweak = new BN(tweak)
  if (util.isOverflow(tweak)) {
    throw new Error(messages.EC_PUBKEY_TWEAK_ADD_FAIL)
  }

  var point = ec.g.mul(tweak).add(ec.keyFromPublic(publicKey).pub)
  return new Buffer(point.encode(undefined, 32))
}

/**
 * Tweak a public key by multiplying tweak to it.
 * @method publicKeyTweakMul
 * @param {Buffer} publicKey
 * @param {Buffer} tweak
 * @return {Buffer}
 */
exports.publicKeyTweakMul = function (publicKey, tweak) {
  asserts.checkTypeBuffer(publicKey, messages.EC_PUBKEY_TYPE_INVALID)
  asserts.checkBufferLength2(publicKey, 33, 65, messages.EC_PUBKEY_LENGTH_INVALID)

  asserts.checkTypeBuffer(tweak, messages.TWEAK_TYPE_INVALID)
  asserts.checkBufferLength(tweak, 32, messages.TWEAK_LENGTH_INVALID)

  if (!util.isValidPublicKey(publicKey)) {
    throw new Error(messages.EC_PUBKEY_PARSE_FAIL)
  }

  tweak = new BN(tweak)
  if (util.isOverflow(tweak) || tweak.isZero()) {
    throw new Error(messages.EC_PUBKEY_TWEAK_MUL_FAIL)
  }

  var key = ec.keyFromPublic(publicKey)
  var byteArray = key.getPublic().mul(tweak).encode(undefined, true)
  return new Buffer(byteArray)
}

/**
 * Add a given public keys together.
 * @method publicKeyCombine
 * @param {Buffer[]} publicKeys
 * @return {Buffer}
 */
exports.publicKeyCombine = function (publicKeys) {
  asserts.checkTypeArray(publicKeys, messages.EC_PUBKEYS_TYPE_INVALID)
  asserts.checkLengthGTZero(publicKeys, messages.EC_PUBKEYS_LENGTH_INVALID)

  for (var i = 0; i < publicKeys.length; ++i) {
    asserts.checkTypeBuffer(publicKeys[i], messages.EC_PUBKEY_TYPE_INVALID)
    asserts.checkBufferLength2(publicKeys[i], 33, 65, messages.EC_PUBKEY_LENGTH_INVALID)

    if (!util.isValidPublicKey(publicKeys[i])) {
      throw new Error(messages.EC_PUBKEY_PARSE_FAIL)
    }
  }

  var point = ec.curve.decodePoint(publicKeys[0])
  for (var j = 1; j < publicKeys.length; ++j) {
    point = point.add(ec.curve.decodePoint(publicKeys[j]))
  }

  return new Buffer(point.encode(undefined, true))
}
