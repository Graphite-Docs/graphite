const BN = require('bn.js')
const EC = require('elliptic').ec
const secp256k1 = new EC('secp256k1')
const deterministicGenerateK = require('./rfc6979')

const ZERO32 = Buffer.alloc(32, 0)
const EC_GROUP_ORDER = Buffer.from('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 'hex')
const EC_P = Buffer.from('fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 'hex')

const n = secp256k1.curve.n
const nDiv2 = n.shrn(1)
const G = secp256k1.curve.g

const THROW_BAD_PRIVATE = 'Expected Private'
const THROW_BAD_POINT = 'Expected Point'
const THROW_BAD_TWEAK = 'Expected Tweak'
const THROW_BAD_HASH = 'Expected Hash'
const THROW_BAD_SIGNATURE = 'Expected Signature'

function isScalar (x) {
  return Buffer.isBuffer(x) && x.length === 32
}

function isOrderScalar (x) {
  if (!isScalar(x)) return false
  return x.compare(EC_GROUP_ORDER) < 0 // < G
}

function isPoint (p) {
  if (!Buffer.isBuffer(p)) return false
  if (p.length < 33) return false

  const t = p[0]
  const x = p.slice(1, 33)
  if (x.compare(ZERO32) === 0) return false
  if (x.compare(EC_P) >= 0) return false
  if ((t === 0x02 || t === 0x03) && p.length === 33) return true

  const y = p.slice(33)
  if (y.compare(ZERO32) === 0) return false
  if (y.compare(EC_P) >= 0) return false
  if (t === 0x04 && p.length === 65) return true
  return false
}

function __isPointCompressed (p) {
  return p[0] !== 0x04
}

function isPointCompressed (p) {
  if (!isPoint(p)) return false
  return __isPointCompressed(p)
}

function isPrivate (x) {
  if (!isScalar(x)) return false
  return x.compare(ZERO32) > 0 && // > 0
    x.compare(EC_GROUP_ORDER) < 0 // < G
}

function isSignature (value) {
  const r = value.slice(0, 32)
  const s = value.slice(32, 64)
  return Buffer.isBuffer(value) && value.length === 64 &&
    r.compare(EC_GROUP_ORDER) < 0 &&
    s.compare(EC_GROUP_ORDER) < 0
}

function assumeCompression (value, pubkey) {
  if (value === undefined && pubkey !== undefined) return __isPointCompressed(pubkey)
  if (value === undefined) return true
  return value
}

function fromBuffer (d) { return new BN(d) }
function toBuffer (d) { return d.toArrayLike(Buffer, 'be', 32) }
function decodeFrom (P) { return secp256k1.curve.decodePoint(P) }
function getEncoded (P, compressed) { return Buffer.from(P._encode(compressed)) }

function pointAdd (pA, pB, __compressed) {
  if (!isPoint(pA)) throw new TypeError(THROW_BAD_POINT)
  if (!isPoint(pB)) throw new TypeError(THROW_BAD_POINT)

  const a = decodeFrom(pA)
  const b = decodeFrom(pB)
  const pp = a.add(b)
  if (pp.isInfinity()) return null

  const compressed = assumeCompression(__compressed, pA)
  return getEncoded(pp, compressed)
}

function pointAddScalar (p, tweak, __compressed) {
  if (!isPoint(p)) throw new TypeError(THROW_BAD_POINT)
  if (!isOrderScalar(tweak)) throw new TypeError(THROW_BAD_TWEAK)

  const compressed = assumeCompression(__compressed, p)
  const pp = decodeFrom(p)
  if (tweak.compare(ZERO32) === 0) return getEncoded(pp, compressed)

  const tt = fromBuffer(tweak)
  const qq = G.mul(tt)
  const uu = pp.add(qq)
  if (uu.isInfinity()) return null

  return getEncoded(uu, compressed)
}

function pointCompress (p, compressed) {
  if (!isPoint(p)) throw new TypeError(THROW_BAD_POINT)

  const pp = decodeFrom(p)
  if (pp.isInfinity()) throw new TypeError(THROW_BAD_POINT)

  return getEncoded(pp, compressed)
}

function pointFromScalar (d, __compressed) {
  if (!isPrivate(d)) throw new TypeError(THROW_BAD_PRIVATE)

  const dd = fromBuffer(d)
  const pp = G.mul(dd)
  if (pp.isInfinity()) return null

  const compressed = assumeCompression(__compressed)
  return getEncoded(pp, compressed)
}

function pointMultiply (p, tweak, __compressed) {
  if (!isPoint(p)) throw new TypeError(THROW_BAD_POINT)
  if (!isOrderScalar(tweak)) throw new TypeError(THROW_BAD_TWEAK)

  const compressed = assumeCompression(__compressed, p)
  const pp = decodeFrom(p)
  const tt = fromBuffer(tweak)
  const qq = pp.mul(tt)
  if (qq.isInfinity()) return null

  return getEncoded(qq, compressed)
}

function privateAdd (d, tweak) {
  if (!isPrivate(d)) throw new TypeError(THROW_BAD_PRIVATE)
  if (!isOrderScalar(tweak)) throw new TypeError(THROW_BAD_TWEAK)

  const dd = fromBuffer(d)
  const tt = fromBuffer(tweak)
  const dt = toBuffer(dd.add(tt).umod(n))
  if (!isPrivate(dt)) return null

  return dt
}

function privateSub (d, tweak) {
  if (!isPrivate(d)) throw new TypeError(THROW_BAD_PRIVATE)
  if (!isOrderScalar(tweak)) throw new TypeError(THROW_BAD_TWEAK)

  const dd = fromBuffer(d)
  const tt = fromBuffer(tweak)
  const dt = toBuffer(dd.sub(tt).umod(n))
  if (!isPrivate(dt)) return null

  return dt
}

function sign (hash, x) {
  if (!isScalar(hash)) throw new TypeError(THROW_BAD_HASH)
  if (!isPrivate(x)) throw new TypeError(THROW_BAD_PRIVATE)

  const d = fromBuffer(x)
  const e = fromBuffer(hash)

  let r, s
  deterministicGenerateK(hash, x, function (k) {
    const kI = fromBuffer(k)
    const Q = G.mul(kI)

    if (Q.isInfinity()) return false

    r = Q.x.umod(n)
    if (r.isZero() === 0) return false

    s = kI
      .invm(n)
      .mul(e.add(d.mul(r)))
      .umod(n)
    if (s.isZero() === 0) return false

    return true
  }, isPrivate)

  // enforce low S values, see bip62: 'low s values in signatures'
  if (s.cmp(nDiv2) > 0) {
    s = n.sub(s)
  }

  const buffer = Buffer.allocUnsafe(64)
  toBuffer(r).copy(buffer, 0)
  toBuffer(s).copy(buffer, 32)
  return buffer
}

function verify (hash, q, signature) {
  if (!isScalar(hash)) throw new TypeError(THROW_BAD_HASH)
  if (!isPoint(q)) throw new TypeError(THROW_BAD_POINT)

  // 1.4.1 Enforce r and s are both integers in the interval [1, n − 1] (1, isSignature enforces '< n - 1')
  if (!isSignature(signature)) throw new TypeError(THROW_BAD_SIGNATURE)

  const Q = decodeFrom(q)
  const r = fromBuffer(signature.slice(0, 32))
  const s = fromBuffer(signature.slice(32, 64))

  // 1.4.1 Enforce r and s are both integers in the interval [1, n − 1] (2, enforces '> 0')
  if (r.gtn(0) <= 0 /* || r.compareTo(n) >= 0 */) return false
  if (s.gtn(0) <= 0 /* || s.compareTo(n) >= 0 */) return false

  // 1.4.2 H = Hash(M), already done by the user
  // 1.4.3 e = H
  const e = fromBuffer(hash)

  // Compute s^-1
  const sInv = s.invm(n)

  // 1.4.4 Compute u1 = es^−1 mod n
  //               u2 = rs^−1 mod n
  const u1 = e.mul(sInv).umod(n)
  const u2 = r.mul(sInv).umod(n)

  // 1.4.5 Compute R = (xR, yR)
  //               R = u1G + u2Q
  const R = G.mulAdd(u1, Q, u2)

  // 1.4.5 (cont.) Enforce R is not at infinity
  if (R.isInfinity()) return false

  // 1.4.6 Convert the field element R.x to an integer
  const xR = R.x

  // 1.4.7 Set v = xR mod n
  const v = xR.umod(n)

  // 1.4.8 If v = r, output "valid", and if v != r, output "invalid"
  return v.eq(r)
}

module.exports = {
  isPoint,
  isPointCompressed,
  isPrivate,
  pointAdd,
  pointAddScalar,
  pointCompress,
  pointFromScalar,
  pointMultiply,
  privateAdd,
  privateSub,
  sign,
  verify
}
