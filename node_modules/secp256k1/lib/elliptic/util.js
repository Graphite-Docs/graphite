var BN = require('bn.js')

var ec = require('./ec')

/**
 * @param {Buffer} secretKey
 * @return {boolean}
 */
exports.isValidSecretKey = function (secretKey) {
  var bn = new BN(secretKey)
  return !exports.isOverflow(bn) && !bn.isZero()
}

/**
 * @param {Buffer} publicKey
 * @return {boolean}
 */
exports.isValidPublicKey = function (publicKey) {
  var first = publicKey[0]
  if (publicKey.length === 33 && (first === 0x02 || first === 0x03)) {
    var bn = new BN(publicKey.slice(1, 33))

    // overflow
    return bn.cmp(ec.curve.p) === -1
  } else if (publicKey.length === 65 && (first === 0x04 || first === 0x06 || first === 0x07)) {
    var x = new BN(publicKey.slice(1, 33)).toRed(ec.curve.red)
    var y = new BN(publicKey.slice(33, 65)).toRed(ec.curve.red)

    // overflow
    if (x.cmp(ec.curve.p) >= 0 || y.cmp(ec.curve.p) >= 0) {
      return false
    }

    // is odd flag
    if ((first === 0x06 || first === 0x07) && y.isOdd() !== (first === 0x07)) {
      return false
    }

    // x*x*x + 7 = y*y
    var x3 = x.redSqr().redMul(x)
    var b = new BN(7).toRed(ec.curve.red)
    return y.redSqr().redISub(x3.redIAdd(b)).cmpn(0) === 0
  }

  return false
}

/**
 * @param {Buffer} signature
 * @return {boolean}
 */
exports.isValidSignature = function (signature) {
  var r = new BN(signature.slice(0, 32))
  var s = new BN(signature.slice(32, 64))
  return !exports.isOverflow(r) && !exports.isOverflow(s)
}

/**
 * @param {BN} bn
 * @return {boolean}
 */
exports.isOverflow = function (bn) {
  return bn.cmp(ec.curve.n) >= 0
}

/**
 * @param {BN} bn
 * @return {BN}
 */
exports.bnReduce = function (bn) {
  if (bn.cmp(ec.curve.n) < 0) {
    return bn
  }

  return bn.mod(ec.curve.n)
}
