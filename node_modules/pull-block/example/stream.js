'use strict'

var block = require('../')
var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')

pull(
  toPull.source(process.stdin),
  block({ size: 16, zeroPadding: true }),
  pull.through(function (buf) {
    var str = buf.toString().replace(/[\x00-\x1f]/g, chr) // eslint-disable-line
    console.log('buf[' + buf.length + ']=' + str)
  }),
  pull.drain()
)

function chr (s) { return '\\x' + pad(s.charCodeAt(0).toString(16), 2) }
function pad (s, n) { return Array(n - s.length + 1).join('0') + s }
