
var assert = require('assert')
var Abortable = require('../')

  var _err = new Error('test error'), ended
  var a = Abortable(function (err) {
    assert.equal(err, _err)
    ended = true
  })

  a.abort(_err)

if(!ended) throw new Error('expected onEnd to be called')


console.log('# pre-abort, passed')
