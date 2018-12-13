
var tape = require('tape')
var File = require('../')
var pull = require('pull-stream')
var fs = require('fs')

var path = require('path')

function asset(file) {
  return path.join(__dirname, 'assets', file)
}

function all(stream, cb) {
  pull(stream, pull.collect(function (err, ary) {
    cb(err, Buffer.concat(ary))
  }))
}

tape('can read a file with a provided fd', function (t) {

  var fd = fs.openSync(asset('ipsum.txt'), 'r')

  all(File(null, {fd: fd}), function (err, buf) {
    if(err) throw err
    t.ok(buf)
    t.end()
  })

})


tape('two files can read from one fd if autoClose is disabled', function (t) {
  var fd = fs.openSync(asset('ipsum.txt'), 'r')

  all(File(null, {fd: fd, autoClose: false}), function (err, buf1) {
    if(err) throw err
    t.ok(buf1)
    all(File(null, {fd: fd, autoClose: false}), function (err, buf2) {
      if(err) throw err
      t.ok(buf2)
      t.equal(buf1.toString(), buf2.toString())
      fs.close(fd, function (err) {
        if(err) throw err
        t.end()
      })
    })
  })

})








