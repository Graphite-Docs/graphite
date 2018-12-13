
var pull = require('pull-stream')
var fs = require('fs')
var File = require('../')

var tape = require('tape')

tape('append to a file', function (t) {

  var filename = '/tmp/test_pull-file_append'+Date.now()

  var n = 10, r = 0, ended = false
  ;(function next () {
    --n
    fs.appendFile(filename, Date.now() +'\n', function (err) {
      if(err) throw err

      if(n) setTimeout(next, 20)
      else { ended = true; }
    })
  })()

  pull(
    File(filename, {live: true}),
    pull.through(function (chunk) {
      r ++
      t.notEqual(chunk.length, 0)
    }),
    pull.take(10),
    pull.drain(null, function (err) {
      if(err) throw err
      t.equal(n, 0, 'writes')
      t.equal(r, 10, 'reads')
      t.end()
    })
  )
})












