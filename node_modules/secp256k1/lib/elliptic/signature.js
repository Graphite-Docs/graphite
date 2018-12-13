var BN = require('bn.js')

var asserts = require('../asserts')
var messages = require('../messages')
var ec = require('./ec')
var util = require('./util')

/**
 * Convert a signature to a normalized lower-S form.
 * @method signatureNormalize
 * @param {Buffer} signature
 * @return {Buffer}
 */
exports.signatureNormalize = function (signature) {
  asserts.checkTypeBuffer(signature, messages.ECDSA_SIGNATURE_TYPE_INVALID)
  asserts.checkBufferLength(signature, 64, messages.ECDSA_SIGNATURE_LENGTH_INVALID)

  if (!util.isValidSignature(signature)) {
    throw new Error(messages.ECDSA_SIGNATURE_PARSE_FAIL)
  }

  var s = new BN(signature.slice(32, 64))
  if (s.cmp(ec.nh) <= 0) {
    throw new Error(messages.ECDSA_SIGNATURE_NORMALIZE_FAIL)
  }

  var result = new Buffer(signature)
  new Buffer(ec.n.sub(s).toArray(null, 32)).copy(result, 32)
  return result
}

/**
 * Serialize an ECDSA signature in DER format.
 * @method signatureExport
 * @param {Buffer} signature
 * @return {Buffer}
 */
exports.signatureExport = function (signature) {
  asserts.checkTypeBuffer(signature, messages.ECDSA_SIGNATURE_TYPE_INVALID)
  asserts.checkBufferLength(signature, 64, messages.ECDSA_SIGNATURE_LENGTH_INVALID)

  if (!util.isValidSignature(signature)) {
    throw new Error(messages.ECDSA_SIGNATURE_PARSE_FAIL)
  }

  var r = Buffer.concat([new Buffer([0]), signature.slice(0, 32)])
  var s = Buffer.concat([new Buffer([0]), signature.slice(32, 64)])

  var lenR = 33
  var posR = 0
  while (lenR > 1 && r[posR] === 0x00 && r[posR + 1] < 0x80) {
    --lenR
    ++posR
  }

  var lenS = 33
  var posS = 0
  while (lenS > 1 && s[posS] === 0x00 && s[posS + 1] < 0x80) {
    --lenS
    ++posS
  }

  var result = new Buffer(lenR + lenS + 6)
  result[0] = 0x30
  result[1] = 4 + lenR + lenS
  result[2] = 0x02
  result[3] = lenR
  r.copy(result, 4, posR)
  result[lenR + 4] = 0x02
  result[lenR + 5] = lenS
  s.copy(result, lenR + 6, posS)

  return result
}

/**
 * Parse a DER ECDSA signature.
 * @method signatureImport
 * @param {Buffer} signature
 * @return {Buffer}
 */
exports.signatureImport = function (signature) {
  asserts.checkTypeBuffer(signature, messages.ECDSA_SIGNATURE_TYPE_INVALID)

  do {
    var length = signature.length
    var index = 0

    if (length < index || signature[index++] !== 0x30) {
      break
    }

    if (length < index || signature[index] > 0x80) {
      break
    }

    var len = signature[index++]
    if (index + len !== length) {
      break
    }

    if (signature[index++] !== 0x02) {
      break
    }

    var rlen = signature[index++]
    if (rlen === 0 || rlen > 33 ||
        (signature[index] === 0x00 && rlen > 1 && signature[index + 1] < 0x80) ||
        (signature[index] === 0xff && rlen > 1 && signature[index + 1] >= 0x80)) {
      break
    }
    var r = new BN(signature.slice(index, index + rlen))
    if (util.isOverflow(r)) {
      r = new BN(0)
    }
    index += rlen

    if (signature[index++] !== 0x02) {
      break
    }

    var slen = signature[index++]
    if (slen === 0 || slen > 33 ||
        (signature[index] === 0x00 && slen > 1 && signature[index + 1] < 0x80) ||
        (signature[index] === 0xff && slen > 1 && signature[index + 1] >= 0x80)) {
      break
    }
    var s = new BN(signature.slice(index, index + slen))
    if (util.isOverflow(s)) {
      s = new BN(0)
    }

    var result = new Buffer(64)
    new Buffer(r.toArray(null, 32)).copy(result, 0)
    new Buffer(s.toArray(null, 32)).copy(result, 32)
    return result
  } while (false)

  throw new Error(messages.ECDSA_SIGNATURE_PARSE_DER_FAIL)
}
