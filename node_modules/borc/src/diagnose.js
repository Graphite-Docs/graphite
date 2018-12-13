'use strict'

const Decoder = require('./decoder')
const utils = require('./utils')

/**
 * Output the diagnostic format from a stream of CBOR bytes.
 *
 */
class Diagnose extends Decoder {
  createTag (tagNumber, value) {
    return `${tagNumber}(${value})`
  }

  createInt (val) {
    return super.createInt(val).toString()
  }

  createInt32 (f, g) {
    return super.createInt32(f, g).toString()
  }

  createInt64 (f1, f2, g1, g2) {
    return super.createInt64(f1, f2, g1, g2).toString()
  }

  createInt32Neg (f, g) {
    return super.createInt32Neg(f, g).toString()
  }

  createInt64Neg (f1, f2, g1, g2) {
    return super.createInt64Neg(f1, f2, g1, g2).toString()
  }

  createTrue () {
    return 'true'
  }

  createFalse () {
    return 'false'
  }

  createFloat (val) {
    const fl = super.createFloat(val)
    if (utils.isNegativeZero(val)) {
      return '-0_1'
    }

    return `${fl}_1`
  }

  createFloatSingle (a, b, c, d) {
    const fl = super.createFloatSingle(a, b, c, d)
    return `${fl}_2`
  }

  createFloatDouble (a, b, c, d, e, f, g, h) {
    const fl = super.createFloatDouble(a, b, c, d, e, f, g, h)
    return `${fl}_3`
  }

  createByteString (raw, len) {
    const val = raw.join(', ')

    if (len === -1) {
      return `(_ ${val})`
    }
    return `h'${val}`
  }

  createByteStringFromHeap (start, end) {
    const val = (Buffer.from(
      super.createByteStringFromHeap(start, end)
    )).toString('hex')

    return `h'${val}'`
  }

  createInfinity () {
    return 'Infinity_1'
  }

  createInfinityNeg () {
    return '-Infinity_1'
  }

  createNaN () {
    return 'NaN_1'
  }

  createNaNNeg () {
    return '-NaN_1'
  }

  createNull () {
    return 'null'
  }

  createUndefined () {
    return 'undefined'
  }

  createSimpleUnassigned (val) {
    return `simple(${val})`
  }

  createArray (arr, len) {
    const val = super.createArray(arr, len)

    if (len === -1) {
      // indefinite
      return `[_ ${val.join(', ')}]`
    }

    return `[${val.join(', ')}]`
  }

  createMap (map, len) {
    const val = super.createMap(map)
    const list = Array.from(val.keys())
      .reduce(collectObject(val), '')

    if (len === -1) {
      return `{_ ${list}}`
    }

    return `{${list}}`
  }

  createObject (obj, len) {
    const val = super.createObject(obj)
    const map = Object.keys(val)
      .reduce(collectObject(val), '')

    if (len === -1) {
      return `{_ ${map}}`
    }

    return `{${map}}`
  }

  createUtf8String (raw, len) {
    const val = raw.join(', ')

    if (len === -1) {
      return `(_ ${val})`
    }

    return `"${val}"`
  }

  createUtf8StringFromHeap (start, end) {
    const val = (Buffer.from(
      super.createUtf8StringFromHeap(start, end)
    )).toString('utf8')

    return `"${val}"`
  }

  static diagnose (input, enc) {
    if (typeof input === 'string') {
      input = Buffer.from(input, enc || 'hex')
    }

    const dec = new Diagnose()
    return dec.decodeFirst(input)
  }
}

module.exports = Diagnose

function collectObject (val) {
  return (acc, key) => {
    if (acc) {
      return `${acc}, ${key}: ${val[key]}`
    }
    return `${key}: ${val[key]}`
  }
}
