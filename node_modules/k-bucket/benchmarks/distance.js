'use strict'
var KBucket = require('../index')

var _0000000100100100 = Buffer.from('0124', 'hex')
var _0100000000100100 = Buffer.from('4024', 'hex')

var hrtime = process.hrtime()
for (var i = 0; i < 1e7; i++) {
  KBucket.distance(_0000000100100100, _0100000000100100)
}
var diff = process.hrtime(hrtime)
console.log(diff[0] * 1e9 + diff[1])
