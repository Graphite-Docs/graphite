var pull   = require('pull-stream')
var duplex = require('../')

var tape = require('tape')
tape('test that error is emitted', function (t) {
  var error = new Error('error immediately!')
  var s = duplex(null, function (_, cb) {
    cb(error)
  })

  s.on('error', function (err) {
    t.equal(err, error)
    t.end()
  })
})

tape('error when paused', function (t) {
  var error = new Error('error immediately!')
  var s = duplex(null, function (_, cb) {
    console.log('read')
    setTimeout(function () {
      cb(error)
    }, 100)
  })


  s.on('error', function (err) {
    t.equal(err, error)
    t.end()
  })

  process.nextTick(function () {
    s.pause()

  setTimeout(function () { s.resume() }, 200)
  })
})


