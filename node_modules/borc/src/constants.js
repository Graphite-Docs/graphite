'use strict'

const Bignumber = require('bignumber.js')

exports.MT = {
  POS_INT: 0,
  NEG_INT: 1,
  BYTE_STRING: 2,
  UTF8_STRING: 3,
  ARRAY: 4,
  MAP: 5,
  TAG: 6,
  SIMPLE_FLOAT: 7
}

exports.TAG = {
  DATE_STRING: 0,
  DATE_EPOCH: 1,
  POS_BIGINT: 2,
  NEG_BIGINT: 3,
  DECIMAL_FRAC: 4,
  BIGFLOAT: 5,
  BASE64URL_EXPECTED: 21,
  BASE64_EXPECTED: 22,
  BASE16_EXPECTED: 23,
  CBOR: 24,
  URI: 32,
  BASE64URL: 33,
  BASE64: 34,
  REGEXP: 35,
  MIME: 36
}

exports.NUMBYTES = {
  ZERO: 0,
  ONE: 24,
  TWO: 25,
  FOUR: 26,
  EIGHT: 27,
  INDEFINITE: 31
}

exports.SIMPLE = {
  FALSE: 20,
  TRUE: 21,
  NULL: 22,
  UNDEFINED: 23
}

exports.SYMS = {
  NULL: Symbol('null'),
  UNDEFINED: Symbol('undef'),
  PARENT: Symbol('parent'),
  BREAK: Symbol('break'),
  STREAM: Symbol('stream')
}

exports.SHIFT32 = Math.pow(2, 32)
exports.SHIFT16 = Math.pow(2, 16)

exports.MAX_SAFE_HIGH = 0x1fffff
exports.NEG_ONE = new Bignumber(-1)
exports.TEN = new Bignumber(10)
exports.TWO = new Bignumber(2)

exports.PARENT = {
  ARRAY: 0,
  OBJECT: 1,
  MAP: 2,
  TAG: 3,
  BYTE_STRING: 4,
  UTF8_STRING: 5
}
