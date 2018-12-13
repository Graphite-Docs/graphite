
//var tape = require('tape')

var pull = require('pull-stream')
var assert = require('assert')
var Abortable = require('../')


require('interleavings').test(function (async) {
  var done = 0
  var abortable = Abortable(function () {
    done++
  })
  var o = []

  pull(
    pull.values([1,2,3,4,5]),
    async.through('pre'),
    abortable,
    async.through('post'),
    pull.collect(function (err, o) {
      assert.deepEqual(o, [1,2,3,4,5])
      assert.equal(done, 1)
      async.done()
    })
  )
})
