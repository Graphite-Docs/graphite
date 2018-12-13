var stream = require('readable-stream')
var encode = require('./encode')
var decode = require('./decode')
var bufferAlloc = require('buffer-alloc')

var buf = bufferAlloc(32 * 1024)
var source = new stream.Readable()
var sent = 0

source._read = function () {
  if (sent > 5 * 1024 * 1024 * 1024) return source.push(null)
  sent += buf.length
  source.push(buf)
}

// silly benchmark that allows me to look for opts/deopts
var s = source.pipe(encode()).pipe(decode())
var now = Date.now()

s.resume()

s.on('end', function () {
  var delta = Date.now() - now
  console.log('%d b/s (%d)', Math.floor(100000 * sent / delta) / 100, delta)
})
