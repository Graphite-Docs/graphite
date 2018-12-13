
var tape = require('tape')
var WS = require('../')

tape('error when connecting to nowhere', function (t) {

  WS.connect('ws://localhost:34059', function (err, stream) {
    t.ok(err)
    t.notOk(stream)
    t.end()
  })

})
