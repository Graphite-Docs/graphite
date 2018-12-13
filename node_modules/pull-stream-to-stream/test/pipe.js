var pull     = require('pull-stream')
var defer    = require('pull-defer')
var Readable = require('stream').Readable
var duplex   = require('../')

var test = require('tape')

test('pipe - resume', function (t) {

  var s = duplex(null, pull(pull.infinite(), pull.take(10)))
  s.pause()

  s.pipe(duplex(pull.collect(function (err, values) {
    t.equal(values.length, 10)
    t.end()
  }), null))

})
