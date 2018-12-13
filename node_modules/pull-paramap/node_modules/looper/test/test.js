
var tape = require('tape')
var looper = require('../')

tape('n=1000000, with no RangeError', function (t) {
  var N = 1000000
  var n = N, c = 0
  var start = Date.now()
  var next = looper(function () {
    c ++
    if(--n) return next()
    var ms = Date.now() - start
    console.log('time for 1m loop', ms)
    console.log('loops per ms', N/ms)
    t.equal(c, 1000000)
    t.end()
  })

  next()
})

tape('compare to setImmediate', function (t) {
  var N = 100000
  var n = N, c = 0, start = Date.now()
  ;(function next () {
    c ++
    if(--n) return setImmediate(next)
    var ms = Date.now() - start
    console.log('time for 1m loop', ms)
    console.log('loops per ms', N/ms)
    t.equal(c, 100000)
    t.end()
  })()
})


tape('async is okay', function (t) {

  var n = 100, c = 0
  var next = looper(function () {
    c ++
    if(--n) return setTimeout(next)
    t.equal(c, 100)
    t.end()
  })

  next() //start looping
})

tape('sometimes async is okay', function (t) {
  var i = 1000; c = 0
  var next = looper(function () {
    c++
    if(--i) return Math.random() < 0.1 ? setTimeout(next) : next()
    t.equal(c, 1000)
    t.end()
  })
  next()
})





