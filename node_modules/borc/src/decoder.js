'use strict'

const ieee754 = require('ieee754')
const Bignumber = require('bignumber.js')

const parser = require('./decoder.asm')
const utils = require('./utils')
const c = require('./constants')
const Simple = require('./simple')
const Tagged = require('./tagged')
const url = require('url')

/**
 * Transform binary cbor data into JavaScript objects.
 */
class Decoder {
  /**
   * @param {Object} [opts={}]
   * @param {number} [opts.size=65536] - Size of the allocated heap.
   */
  constructor (opts) {
    opts = opts || {}

    if (!opts.size || opts.size < 0x10000) {
      opts.size = 0x10000
    } else {
      // Ensure the size is a power of 2
      opts.size = utils.nextPowerOf2(opts.size)
    }

    // Heap use to share the input with the parser
    this._heap = new ArrayBuffer(opts.size)
    this._heap8 = new Uint8Array(this._heap)
    this._buffer = Buffer.from(this._heap)

    this._reset()

    // Known tags
    this._knownTags = Object.assign({
      0: (val) => new Date(val),
      1: (val) => new Date(val * 1000),
      2: (val) => utils.arrayBufferToBignumber(val),
      3: (val) => c.NEG_ONE.minus(utils.arrayBufferToBignumber(val)),
      4: (v) => {
        // const v = new Uint8Array(val)
        return c.TEN.pow(v[0]).times(v[1])
      },
      5: (v) => {
        // const v = new Uint8Array(val)
        return c.TWO.pow(v[0]).times(v[1])
      },
      32: (val) => url.parse(val),
      35: (val) => new RegExp(val)
    }, opts.tags)

    // Initialize asm based parser
    this.parser = parser(global, {
      log: console.log.bind(console),
      pushInt: this.pushInt.bind(this),
      pushInt32: this.pushInt32.bind(this),
      pushInt32Neg: this.pushInt32Neg.bind(this),
      pushInt64: this.pushInt64.bind(this),
      pushInt64Neg: this.pushInt64Neg.bind(this),
      pushFloat: this.pushFloat.bind(this),
      pushFloatSingle: this.pushFloatSingle.bind(this),
      pushFloatDouble: this.pushFloatDouble.bind(this),
      pushTrue: this.pushTrue.bind(this),
      pushFalse: this.pushFalse.bind(this),
      pushUndefined: this.pushUndefined.bind(this),
      pushNull: this.pushNull.bind(this),
      pushInfinity: this.pushInfinity.bind(this),
      pushInfinityNeg: this.pushInfinityNeg.bind(this),
      pushNaN: this.pushNaN.bind(this),
      pushNaNNeg: this.pushNaNNeg.bind(this),
      pushArrayStart: this.pushArrayStart.bind(this),
      pushArrayStartFixed: this.pushArrayStartFixed.bind(this),
      pushArrayStartFixed32: this.pushArrayStartFixed32.bind(this),
      pushArrayStartFixed64: this.pushArrayStartFixed64.bind(this),
      pushObjectStart: this.pushObjectStart.bind(this),
      pushObjectStartFixed: this.pushObjectStartFixed.bind(this),
      pushObjectStartFixed32: this.pushObjectStartFixed32.bind(this),
      pushObjectStartFixed64: this.pushObjectStartFixed64.bind(this),
      pushByteString: this.pushByteString.bind(this),
      pushByteStringStart: this.pushByteStringStart.bind(this),
      pushUtf8String: this.pushUtf8String.bind(this),
      pushUtf8StringStart: this.pushUtf8StringStart.bind(this),
      pushSimpleUnassigned: this.pushSimpleUnassigned.bind(this),
      pushTagUnassigned: this.pushTagUnassigned.bind(this),
      pushTagStart: this.pushTagStart.bind(this),
      pushTagStart4: this.pushTagStart4.bind(this),
      pushTagStart8: this.pushTagStart8.bind(this),
      pushBreak: this.pushBreak.bind(this)
    }, this._heap)
  }

  get _depth () {
    return this._parents.length
  }

  get _currentParent () {
    return this._parents[this._depth - 1]
  }

  get _ref () {
    return this._currentParent.ref
  }

  // Finish the current parent
  _closeParent () {
    var p = this._parents.pop()

    if (p.length > 0) {
      throw new Error(`Missing ${p.length} elements`)
    }

    switch (p.type) {
      case c.PARENT.TAG:
        this._push(
          this.createTag(p.ref[0], p.ref[1])
        )
        break
      case c.PARENT.BYTE_STRING:
        this._push(this.createByteString(p.ref, p.length))
        break
      case c.PARENT.UTF8_STRING:
        this._push(this.createUtf8String(p.ref, p.length))
        break
      case c.PARENT.MAP:
        if (p.values % 2 > 0) {
          throw new Error('Odd number of elements in the map')
        }
        this._push(this.createMap(p.ref, p.length))
        break
      case c.PARENT.OBJECT:
        if (p.values % 2 > 0) {
          throw new Error('Odd number of elements in the map')
        }
        this._push(this.createObject(p.ref, p.length))
        break
      case c.PARENT.ARRAY:
        this._push(this.createArray(p.ref, p.length))
        break
      default:
        break
    }

    if (this._currentParent && this._currentParent.type === c.PARENT.TAG) {
      this._dec()
    }
  }

  // Reduce the expected length of the current parent by one
  _dec () {
    const p = this._currentParent
    // The current parent does not know the epxected child length

    if (p.length < 0) {
      return
    }

    p.length--

    // All children were seen, we can close the current parent
    if (p.length === 0) {
      this._closeParent()
    }
  }

  // Push any value to the current parent
  _push (val, hasChildren) {
    const p = this._currentParent
    p.values++

    switch (p.type) {
      case c.PARENT.ARRAY:
      case c.PARENT.BYTE_STRING:
      case c.PARENT.UTF8_STRING:
        if (p.length > -1) {
          this._ref[this._ref.length - p.length] = val
        } else {
          this._ref.push(val)
        }
        this._dec()
        break
      case c.PARENT.OBJECT:
        if (p.tmpKey != null) {
          this._ref[p.tmpKey] = val
          p.tmpKey = null
          this._dec()
        } else {
          p.tmpKey = val

          if (typeof p.tmpKey !== 'string') {
            // too bad, convert to a Map
            p.type = c.PARENT.MAP
            p.ref = utils.buildMap(p.ref)
          }
        }
        break
      case c.PARENT.MAP:
        if (p.tmpKey != null) {
          this._ref.set(p.tmpKey, val)
          p.tmpKey = null
          this._dec()
        } else {
          p.tmpKey = val
        }
        break
      case c.PARENT.TAG:
        this._ref.push(val)
        if (!hasChildren) {
          this._dec()
        }
        break
      default:
        throw new Error('Unknown parent type')
    }
  }

  // Create a new parent in the parents list
  _createParent (obj, type, len) {
    this._parents[this._depth] = {
      type: type,
      length: len,
      ref: obj,
      values: 0,
      tmpKey: null
    }
  }

  // Reset all state back to the beginning, also used for initiatlization
  _reset () {
    this._res = []
    this._parents = [{
      type: c.PARENT.ARRAY,
      length: -1,
      ref: this._res,
      values: 0,
      tmpKey: null
    }]
  }

  // -- Interface to customize deoding behaviour
  createTag (tagNumber, value) {
    const typ = this._knownTags[tagNumber]

    if (!typ) {
      return new Tagged(tagNumber, value)
    }

    return typ(value)
  }

  createMap (obj, len) {
    return obj
  }

  createObject (obj, len) {
    return obj
  }

  createArray (arr, len) {
    return arr
  }

  createByteString (raw, len) {
    return Buffer.concat(raw)
  }

  createByteStringFromHeap (start, end) {
    if (start === end) {
      return Buffer.alloc(0)
    }

    return Buffer.from(this._heap.slice(start, end))
  }

  createInt (val) {
    return val
  }

  createInt32 (f, g) {
    return utils.buildInt32(f, g)
  }

  createInt64 (f1, f2, g1, g2) {
    return utils.buildInt64(f1, f2, g1, g2)
  }

  createFloat (val) {
    return val
  }

  createFloatSingle (a, b, c, d) {
    return ieee754.read([a, b, c, d], 0, false, 23, 4)
  }

  createFloatDouble (a, b, c, d, e, f, g, h) {
    return ieee754.read([a, b, c, d, e, f, g, h], 0, false, 52, 8)
  }

  createInt32Neg (f, g) {
    return -1 - utils.buildInt32(f, g)
  }

  createInt64Neg (f1, f2, g1, g2) {
    const f = utils.buildInt32(f1, f2)
    const g = utils.buildInt32(g1, g2)

    if (f > c.MAX_SAFE_HIGH) {
      return c.NEG_ONE.minus(new Bignumber(f).times(c.SHIFT32).plus(g))
    }

    return -1 - ((f * c.SHIFT32) + g)
  }

  createTrue () {
    return true
  }

  createFalse () {
    return false
  }

  createNull () {
    return null
  }

  createUndefined () {
    return void 0
  }

  createInfinity () {
    return Infinity
  }

  createInfinityNeg () {
    return -Infinity
  }

  createNaN () {
    return NaN
  }

  createNaNNeg () {
    return -NaN
  }

  createUtf8String (raw, len) {
    return raw.join('')
  }

  createUtf8StringFromHeap (start, end) {
    if (start === end) {
      return ''
    }

    return this._buffer.toString('utf8', start, end)
  }

  createSimpleUnassigned (val) {
    return new Simple(val)
  }

  // -- Interface for decoder.asm.js

  pushInt (val) {
    this._push(this.createInt(val))
  }

  pushInt32 (f, g) {
    this._push(this.createInt32(f, g))
  }

  pushInt64 (f1, f2, g1, g2) {
    this._push(this.createInt64(f1, f2, g1, g2))
  }

  pushFloat (val) {
    this._push(this.createFloat(val))
  }

  pushFloatSingle (a, b, c, d) {
    this._push(this.createFloatSingle(a, b, c, d))
  }

  pushFloatDouble (a, b, c, d, e, f, g, h) {
    this._push(this.createFloatDouble(a, b, c, d, e, f, g, h))
  }

  pushInt32Neg (f, g) {
    this._push(this.createInt32Neg(f, g))
  }

  pushInt64Neg (f1, f2, g1, g2) {
    this._push(this.createInt64Neg(f1, f2, g1, g2))
  }

  pushTrue () {
    this._push(this.createTrue())
  }

  pushFalse () {
    this._push(this.createFalse())
  }

  pushNull () {
    this._push(this.createNull())
  }

  pushUndefined () {
    this._push(this.createUndefined())
  }

  pushInfinity () {
    this._push(this.createInfinity())
  }

  pushInfinityNeg () {
    this._push(this.createInfinityNeg())
  }

  pushNaN () {
    this._push(this.createNaN())
  }

  pushNaNNeg () {
    this._push(this.createNaNNeg())
  }

  pushArrayStart () {
    this._createParent([], c.PARENT.ARRAY, -1)
  }

  pushArrayStartFixed (len) {
    this._createArrayStartFixed(len)
  }

  pushArrayStartFixed32 (len1, len2) {
    const len = utils.buildInt32(len1, len2)
    this._createArrayStartFixed(len)
  }

  pushArrayStartFixed64 (len1, len2, len3, len4) {
    const len = utils.buildInt64(len1, len2, len3, len4)
    this._createArrayStartFixed(len)
  }

  pushObjectStart () {
    this._createObjectStartFixed(-1)
  }

  pushObjectStartFixed (len) {
    this._createObjectStartFixed(len)
  }

  pushObjectStartFixed32 (len1, len2) {
    const len = utils.buildInt32(len1, len2)
    this._createObjectStartFixed(len)
  }

  pushObjectStartFixed64 (len1, len2, len3, len4) {
    const len = utils.buildInt64(len1, len2, len3, len4)
    this._createObjectStartFixed(len)
  }

  pushByteStringStart () {
    this._parents[this._depth] = {
      type: c.PARENT.BYTE_STRING,
      length: -1,
      ref: [],
      values: 0,
      tmpKey: null
    }
  }

  pushByteString (start, end) {
    this._push(this.createByteStringFromHeap(start, end))
  }

  pushUtf8StringStart () {
    this._parents[this._depth] = {
      type: c.PARENT.UTF8_STRING,
      length: -1,
      ref: [],
      values: 0,
      tmpKey: null
    }
  }

  pushUtf8String (start, end) {
    this._push(this.createUtf8StringFromHeap(start, end))
  }

  pushSimpleUnassigned (val) {
    this._push(this.createSimpleUnassigned(val))
  }

  pushTagStart (tag) {
    this._parents[this._depth] = {
      type: c.PARENT.TAG,
      length: 1,
      ref: [tag]
    }
  }

  pushTagStart4 (f, g) {
    this.pushTagStart(utils.buildInt32(f, g))
  }

  pushTagStart8 (f1, f2, g1, g2) {
    this.pushTagStart(utils.buildInt64(f1, f2, g1, g2))
  }

  pushTagUnassigned (tagNumber) {
    this._push(this.createTag(tagNumber))
  }

  pushBreak () {
    if (this._currentParent.length > -1) {
      throw new Error('Unexpected break')
    }

    this._closeParent()
  }

  _createObjectStartFixed (len) {
    if (len === 0) {
      this._push(this.createObject({}))
      return
    }

    this._createParent({}, c.PARENT.OBJECT, len)
  }

  _createArrayStartFixed (len) {
    if (len === 0) {
      this._push(this.createArray([]))
      return
    }

    this._createParent(new Array(len), c.PARENT.ARRAY, len)
  }

  _decode (input) {
    if (input.byteLength === 0) {
      throw new Error('Input too short')
    }

    this._reset()
    this._heap8.set(input)
    const code = this.parser.parse(input.byteLength)

    if (this._depth > 1) {
      while (this._currentParent.length === 0) {
        this._closeParent()
      }
      if (this._depth > 1) {
        throw new Error('Undeterminated nesting')
      }
    }

    if (code > 0) {
      throw new Error('Failed to parse')
    }

    if (this._res.length === 0) {
      throw new Error('No valid result')
    }
  }

  // -- Public Interface

  decodeFirst (input) {
    this._decode(input)

    return this._res[0]
  }

  decodeAll (input) {
    this._decode(input)

    return this._res
  }

  /**
   * Decode the first cbor object.
   *
   * @param {Buffer|string} input
   * @param {string} [enc='hex'] - Encoding used if a string is passed.
   * @returns {*}
   */
  static decode (input, enc) {
    if (typeof input === 'string') {
      input = Buffer.from(input, enc || 'hex')
    }

    const dec = new Decoder({size: input.length})
    return dec.decodeFirst(input)
  }

  /**
   * Decode all cbor objects.
   *
   * @param {Buffer|string} input
   * @param {string} [enc='hex'] - Encoding used if a string is passed.
   * @returns {Array<*>}
   */
  static decodeAll (input, enc) {
    if (typeof input === 'string') {
      input = Buffer.from(input, enc || 'hex')
    }

    const dec = new Decoder({size: input.length})
    return dec.decodeAll(input)
  }
}

Decoder.decodeFirst = Decoder.decode

module.exports = Decoder
