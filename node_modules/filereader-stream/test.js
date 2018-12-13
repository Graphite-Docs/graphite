var test = require('tape')
var through = require('through2')
var drop = require('drag-and-drop-files')
var frs = require('./')

drop(document.body, function (files) {
  var first = files[0]
  var LEN = 1024 * 512
  var s = frs(first, {chunkSize: LEN})

  test('should read file when one is dropped', function (t) {
    var buffs = []
    var concatter = through(function (ch, enc, cb) {
      buffs.push(ch)
      t.ok(ch.length <= LEN, 'length is <= ' + LEN)
      cb()
    }, function () {
      var all = Buffer.concat(buffs)
      t.ok(all.length > 0, 'got some data')
      t.equal(all.length, s.size, 'size is ' + s.size)
      t.end()
    })
    s.pipe(concatter)
  })
})
