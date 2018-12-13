var pull = require('pull-stream')
var paraMap = require('../')
var interleavings = require('interleavings')
var assert = require('assert')

interleavings.test(function (async) {
  var m = -1
  pull(
    pull.values([0, 1, 2]),
    async.through('input'),
    paraMap(function (i, cb) {
      console.log(i)
      assert.ok(i > m, 'ordered:' + i + ' > ' + m)
      m = i
      async(cb, 'cb')(null, i)
    }, 2),
    pull.drain(null, function () {
      async.done()
    })
  )
})
