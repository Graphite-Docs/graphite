var test = require('tape');
var pull = require('pull-stream');
var file = require('..');

var path = require('path');
var crypto = require('crypto')
var osenv = require('osenv')
var fs = require('fs')

var tmpfile = path.join(osenv.tmpdir(), 'test_pull-file_big')

var big = crypto.pseudoRandomBytes(10*1024*1024)
fs.writeFileSync(tmpfile, big)

function hash (data) {
  return crypto.createHash('sha256').update(data).digest('hex')
}

test('large file in explicit buffer', function(t) {
  var buf = new Buffer(65551) // prime close to 1024 * 64
  var h = crypto.createHash('sha256')

  pull(
    file(tmpfile, {buffer: buf}),
    pull.through(function (chunk) {
      h.update(chunk)
    }),
    pull.onEnd(function(err) {
      t.equal(hash(big), h.digest('hex'))
      t.end()
    })
  );
});
