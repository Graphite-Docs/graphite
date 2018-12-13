'use strict'

var test = require('tape')

var pull = require('pull-stream')
var file = require('pull-file')
var fs = require('fs')

var block = require('../')

test('basic test', function (t) {
  var totalBytes = 0
  var stat
  t.doesNotThrow(function () {
    stat = fs.statSync(__filename)
  }, 'stat should not throw')

  pull(
    file(__filename),
    block(16),
    pull.through(function (c) {
      t.equal(c.length, 16, 'chunks should be 16 bytes long')
      t.ok(Buffer.isBuffer(c), 'chunks should be buffer objects')
      totalBytes += c.length
    }),
    pull.onEnd(function (err) {
      t.error(err)
      var expectedBytes = stat.size + (16 - stat.size % 16)
      t.equal(totalBytes, expectedBytes, 'Should be multiple of 16')
      t.end()
    })
  )
})
