
//var tape = require('tape')

var pull = require('pull-stream')
var assert = require('assert')
var Abortable = require('../')


require('interleavings').test(function (async) {
  var err = new Error('intentional')

  var i = 2

  var abortable = Abortable(function (_err) {
    assert.equal(_err, err, 'abortable ended correctly')
    if(--i === 0) async.done()
  })
  var o = []

  pull(
    pull.values([1,2,3,4,5]),
    async.through('pre'),
    abortable,
    async.through('post'),
    pull.asyncMap(function (data, cb) {
      async(function () {
        if(data == 3) {
          abortable.abort(err)
          async(function () {
            o.push(data)
            cb(err, data)
          })()
        }
        else {
          o.push(data)
          cb(null, data)
        }
      })()
    }),
    pull.drain(null, function (_err) {
      if(o.length === 3)
        assert.deepEqual(o, [1,2,3])
      else
        assert.deepEqual(o, [1,2])

      assert.equal(_err, err)
    
      if(--i === 0) async.done()
    })
  )
})
