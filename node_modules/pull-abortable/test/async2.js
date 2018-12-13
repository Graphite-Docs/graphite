
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
    function (read) {
      return function (abort, cb) {

        if(o.length < 3)
          read(abort, function (end, data) {
            o.push(data)
            cb(end, data)
          })
        else {
          abortable.abort()
          async(function () {
            read(abort, cb)
          })()
        }
      }
    },
//    pull.asyncMap(function (data, cb) {
//      async(function () {
//        if(data == 3) {
//          cb(null, data)
//          async(function () {
//            abortable.abort()
//          })()
//        }
//        else {
//          o.push(data)
//          cb(null, data)
//        }
//      })()
//    }),
    pull.drain(null, function (err) {
      assert.deepEqual(o, [1,2,3])
      async.done()
    })
  )
})
