'use strict'

var test = require('tape')
var pull = require('pull-stream')

var block = require('../')

test('does not emit on empty buffers', function (t) {
  t.plan(2)

  pull(
    pull.values([
      Buffer.alloc(0),
      Buffer.alloc(0),
      Buffer.alloc(0)
    ]),
    block(),
    pull.collect(function (err, buffers) {
      t.error(err)
      t.equal(buffers.length, 0)
    })
  )
})

test('respects noEmpty option and nopad on empty stream', function (t) {
  t.plan(3)

  pull(
    pull.empty(),
    block({ emitEmpty: true, nopad: true }),
    pull.collect(function (err, buffers) {
      t.error(err)
      t.equal(buffers.length, 1)
      t.equal(buffers[0].length, 0)
    })
  )
})

test('respects noEmpty option and nopad on empty buffers', function (t) {
  t.plan(3)

  pull(
    pull.values([
      Buffer.alloc(0),
      Buffer.alloc(0),
      Buffer.alloc(0)
    ]),
    block({ emitEmpty: true, nopad: true }),
    pull.collect(function (err, buffers) {
      t.error(err)
      t.equal(buffers.length, 1)
      t.equal(buffers[0].length, 0)
    })
  )
})

test('respects noEmpty option on empty stream', function (t) {
  t.plan(4)

  pull(
    pull.empty(),
    block({ emitEmpty: true }),
    pull.collect(function (err, buffers) {
      t.error(err)
      t.equal(buffers.length, 1)
      t.equal(buffers[0].length, 512)
      t.deepEqual(buffers[0], Buffer.alloc(512))
    })
  )
})

test('respects noEmpty option on empty buffers', function (t) {
  t.plan(4)

  pull(
    pull.values([
      Buffer.alloc(0),
      Buffer.alloc(0),
      Buffer.alloc(0)
    ]),
    block({ emitEmpty: true }),
    pull.collect(function (err, buffers) {
      t.error(err)
      t.equal(buffers.length, 1)
      t.equal(buffers[0].length, 512)
      t.deepEqual(buffers[0], Buffer.alloc(512))
    })
  )
})

test('does not emit extra buffer if noEmpty and nopad is present', function (t) {
  t.plan(3)

  pull(
    pull.values([
      Buffer.alloc(0),
      Buffer.from('hey'),
      Buffer.alloc(0)
    ]),
    block({ emitEmpty: true, nopad: true }),
    pull.collect(function (err, buffers) {
      t.error(err)
      t.equal(buffers.length, 1)
      t.equal(buffers[0].length, 3)
    })
  )
})

test('does not emit extra buffer if noEmpty is present', function (t) {
  t.plan(4)

  pull(
    pull.values([
      Buffer.alloc(0),
      Buffer.from('hey'),
      Buffer.alloc(0)
    ]),
    block({ emitEmpty: true }),
    pull.collect(function (err, buffers) {
      t.error(err)
      t.equal(buffers.length, 1)
      t.equal(buffers[0].length, 512)
      t.deepEqual(buffers[0], Buffer.concat([Buffer.from('hey'), Buffer.alloc(512 - 3)]))
    })
  )
})
