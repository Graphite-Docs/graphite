'use strict'

var test = require('tape')

var pull = require('pull-stream')

var block = require('../')

test("don't pad, small writes", function (t) {
  t.plan(2)

  pull(
    pull.values([
      Buffer.from('a'),
      Buffer.from('b'),
      Buffer.from('c')
    ]),
    block(16, {nopad: true}),
    pull.through(function (c) {
      t.equal(c.toString(), 'abc', "should get 'abc'")
    }),
    pull.onEnd(function (err) {
      t.error(err)
      t.end()
    })
  )
})

test("don't pad, exact write", function (t) {
  t.plan(2)

  var first = true

  pull(
    pull.values([
      Buffer.from('abcdefghijklmnop')
    ]),
    block(16, {nopad: true}),
    pull.through(function (c) {
      if (first) {
        first = false
        t.equal(c.toString(), 'abcdefghijklmnop', 'first chunk')
      } else {
        t.fail('should only get one')
      }
    }),
    pull.onEnd(function (err) {
      t.error(err)
      t.end()
    })
  )
})

test("don't pad, big write", function (t) {
  t.plan(3)

  var first = true

  pull(
    pull.values([
      Buffer.from('abcdefghijklmnopq')
    ]),
    block(16, {nopad: true}),
    pull.through(function (c) {
      if (first) {
        first = false
        t.equal(c.toString(), 'abcdefghijklmnop', 'first chunk')
      } else {
        t.equal(c.toString(), 'q')
      }
    }),
    pull.onEnd(function (err) {
      t.error(err)
      t.end()
    })
  )
})
