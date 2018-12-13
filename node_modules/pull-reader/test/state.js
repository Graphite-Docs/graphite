
var crypto = require('crypto')
var State = require('../state')
var tape = require('tape')

var bytes = crypto.randomBytes(64)

tape('read everything', function (t) {

  var state = State()
  t.notOk(state.has(1))
  state.add(bytes.slice(0, 32))
  t.ok(state.has(1))
  t.ok(state.has(32))
  t.notOk(state.has(33))
  state.add(bytes.slice(32, 64))

  t.deepEqual(state.get(64), bytes)
  t.end()
})


tape('read overlapping sections', function (t) {
  var state = State()
  t.notOk(state.has(1))
  state.add(bytes)
  t.ok(state.has(1))

  t.deepEqual(state.get(48), bytes.slice(0, 48))
  t.deepEqual(state.get(16), bytes.slice(48, 64))
  t.end()

})

tape('read multiple sections', function (t) {
  var state = State()
  t.notOk(state.has(1))
  state.add(bytes)
  t.ok(state.has(1))

  t.deepEqual(state.get(20), bytes.slice(0, 20))
  t.deepEqual(state.get(16), bytes.slice(20, 36))
  t.deepEqual(state.get(28), bytes.slice(36, 64))
  t.end()
})

tape('read overlaping sections', function (t) {
  var state = State()
  t.notOk(state.has(1))
  state.add(bytes.slice(0, 32))
  state.add(bytes.slice(32, 64))
  t.ok(state.has(1))

  t.deepEqual(state.get(31), bytes.slice(0, 31))
  t.deepEqual(state.get(33), bytes.slice(31, 64))
  t.end()
})

tape('read overlaping sections', function (t) {
  var state = State()
  t.notOk(state.has(1))
  state.add(bytes.slice(0, 32))
  state.add(bytes.slice(32, 64))
  t.ok(state.has(1))

  t.deepEqual(state.get(33), bytes.slice(0, 33))
  t.deepEqual(state.get(31), bytes.slice(33, 64))
  t.end()
})




tape('get whatever is left', function (t) {
  var state = State()
  t.notOk(state.has(1))
  state.add(bytes)
  t.ok(state.has(bytes.length))
  var b = state.get()
  t.deepEqual(b, bytes)
  t.end()
})
