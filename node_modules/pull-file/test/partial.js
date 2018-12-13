
var tape = require('tape')
var path = require('path')
var pull = require('pull-stream')
var File = require('../')
var cont = require('cont')
var fs = require('fs')

var crypto = require('crypto')
var osenv = require('osenv')

var tmpfile = path.join(osenv.tmpdir(), 'test_pull-file_big')
var crypto = require('crypto')

var big = crypto.pseudoRandomBytes(10*1024*1024)
fs.writeFileSync(tmpfile, big)

function hash (data) {
  return crypto.createHash('sha256').update(data).digest('hex')
}

function asset(file) {
  return path.join(__dirname, 'assets', file)
}

var MB = 1024*1024

tape('read files partially', function (t) {

  function test (file, start, end) {
    return function (cb) {
      var opts = {start: start, end: end}
      var expected
      var _expected = fs.readFileSync(file, opts)

      expected = _expected
        .slice(
          start || 0,
          end || _expected.length
        )

      pull(
        File(file, opts),
        pull.collect(function (err, ary) {
          var actual = Buffer.concat(ary)
          t.equal(actual.length, expected.length)
          t.equal(hash(actual), hash(expected))
          cb()
        })
      )
    }

  }

  cont.para([
    test(tmpfile, 0, 9*MB),
    test(tmpfile, 5*MB, 10*MB),
    test(tmpfile, 5*MB, 6*MB),
    test(asset('ipsum.txt')),
    test(asset('test.txt'), 1, 4)
  ])(function (err) {
    t.end()
  })

})









