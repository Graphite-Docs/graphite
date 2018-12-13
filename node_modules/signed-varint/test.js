var tape = require('tape')

var svi = require('./')

function encodeDecode (t, v, bytes) {
  var b = svi.encode(v)
  t.equal(b.length, bytes)
  t.equal(svi.decode(b), v)
  t.equal(svi.encode.bytes, bytes)
  t.equal(svi.decode.bytes, bytes)
}

tape('single byte', function (t) {
  encodeDecode(t, 1, 1)
  encodeDecode(t, -1, 1)
  encodeDecode(t, 63, 1)
  encodeDecode(t, -64, 1)
  t.end()
})
tape('double byte', function (t) {
  encodeDecode(t, 64, 2)
  encodeDecode(t, -65, 2)
  encodeDecode(t, 127, 2)
  encodeDecode(t, -128, 2)
  encodeDecode(t, 128, 2)
  encodeDecode(t, -129, 2)
  encodeDecode(t, 255, 2)
  encodeDecode(t, -256, 2)
  t.end()
})
tape('tripple', function (t) {
  encodeDecode(t, 0x4000, 3)
  encodeDecode(t, -0x4001, 3)
  encodeDecode(t, 1048574, 3)
  encodeDecode(t, -1048575, 3)
  t.end()
})

tape('quad', function (t) {
  encodeDecode(t, 134217726, 4)
  encodeDecode(t, -134217727, 4)
  t.end()
})

tape('large int', function (t) {
  encodeDecode(t, 0x80000000000, 7)
  encodeDecode(t, -0x80000000000, 7)
  t.end()
})
