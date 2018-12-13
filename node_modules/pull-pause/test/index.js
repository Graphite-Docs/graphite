var tape = require('tape')
var Pause = require('../')
var pull = require('pull-stream')

tape('simple', function (t) {

  var pause = Pause(function (paused) {
    t.ok(paused)
    t.end()
  })
  var c = 0

  pull(
    pull.count(10),
    pause,
    pull.drain(function (e) {
      c += e

      if(c > 10)
        pause.pause()

    })
  )

})

tape('pause, resume', function (t) {
  var p = false
  var pause = Pause(function (paused) {
    p = true
    if(paused)
      setTimeout(pause.resume)
  })
  var c = 0

  pull(
    pull.count(10),
    pause,
    pull.drain(function (e) {
      c += e
      if(c > 10 && !p) {
        pause.pause()
      }
    }, function () {
      t.equal(c, 55)
      t.end()
    })
  )

})

tape('pause, resume', function (t) {

  var pause = Pause(function (paused) {
    setTimeout(pause.resume, 100)
  })
  var c = 0

  pull(
    pull.count(10),
    pause,
    pull.drain(function (e) {
      c += e
      console.log(c)
      if(c > 5) pause.pause()
    }, function () {
      t.equal(c, 55)
      t.end()
    })
  )

})

tape('without callback', function (t) {
  var pause = Pause()
  var c = 0

  setTimeout(pause.resume, 50)
  pull(
    pull.count(10),
    pause,
    pull.drain(function (e) {
      c += e
      if(c == 5) pause.pause()
    }, function () {
      t.equal(c, 55)
      t.end()
    })
  )
})


