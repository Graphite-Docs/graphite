'use strict'

const test = require('tape')
const SparseArray = require('../')

const max = 100
let arr

test('allows to be constructed', (t) => {
  arr = new SparseArray()
  t.end()
})

test('get an index that is not set returns undefined', (t) => {
  t.equal(arr.get(0), undefined)
  t.end()
})

test('can set a determined place', (t) => {
  arr.set(0, 'v0')
  t.end()
})

test('can get a value', (t) => {
  t.equal(arr.get(0), 'v0')
  t.end()
})

test('getting an unset value yields undefined', (t) => {
  t.equal(arr.get(1), undefined)
  t.end()
})

test('can set a bunch of values', (t) => {
  for(let i = 0; i < max; i++) {
    arr.set(i, i.toString())
  }
  t.end()
})

test('can get that bunch of values', (t) => {
  for(let i = 0; i < max; i++) {
    t.equal(arr.get(i), i.toString())
  }
  t.end()
})

test('can unset a bunch of values and still get the rest', (t) => {
  for(let i = 0; i < max; i++) {
    arr.unset(i)
    t.equal(arr.get(i), undefined)
    for(let j = i + 1; j < max; j++) {
      t.equal(arr.get(j), j.toString())
    }
  }
  t.end()
})
