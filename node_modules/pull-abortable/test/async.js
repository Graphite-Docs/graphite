
//var tape = require('tape')

var pull = require('pull-stream')
var assert = require('assert')
var Abortable = require('../')


require('interleavings').test(function (async) {
  var abortable = Abortable()
  var o = []

  pull(
    pull.values([1,2,3,4,5]),
    async.through('pre'),
    abortable,
    async.through('post'),
    pull.asyncMap(function (data, cb) {
      async(function () {
        if(data == 3) {
          abortable.abort()
          async(function () {
            o.push(data)
            cb(null, data)
          })()
        }
        else {
          o.push(data)
          cb(null, data)
        }
      })()
    }),
    pull.drain(null, function (err) {
      if(o.length === 3)
        assert.deepEqual(o, [1,2,3])
      else
        assert.deepEqual(o, [1,2])

      async.done()
    })
  )
})
