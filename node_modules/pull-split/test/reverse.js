var test = require('tape')
var pull = require('pull-stream')
var split = require('../')

test('read this file', function (t) {

  var fs = require('fs')
  var file = fs.readFileSync(__filename).toString()
  var lines = file.split('\n').reverse()
  var i = file.length, block = 300

  pull(
    function (end, cb) {
      if (i <= 0)
        cb(true)
      else {
        var _i = i
        i -= block
        _i = Math.max(_i, 0)
        var line = file.substring(_i - block, _i)
        cb(null, line)
      }
    },
    split('\n', null, true),
    pull.collect(function (err, array){
      t.equal(array.length, lines.length)
      t.deepEqual(array, lines)
      t.end()
    })
  )
})

//haoeunhoeu


