'use strict'

const test = require('tape')
const SparseArray = require('../')

let arr

test('allows to be constructed', (t) => {
  arr = new SparseArray()
  t.end()
})

test('get an index that is not set returns undefined', (t) => {
  t.equal(arr.get(9), undefined)
  t.end()
})

test('can set a 9th and 6th positions', (t) => {
  arr.set(9, 'v9')
  arr.set(6, 'v6')
  t.end()
})

test('length is 10', (t) => {
  t.equal(arr.length, 10)
  t.end()
})

test('can get those values', (t) => {
  t.equal(arr.get(9), 'v9')
  t.equal(arr.get(6), 'v6')
  t.end()
})

test('delete 6th position', (t) => {
  arr.unset(6)
  t.end()
})

test('length is still 10', (t) => {
  t.equal(arr.length, 10)
  t.end()
})

test('position 6 is gone', (t) => {
  t.equal(arr.get(6), undefined)
  t.end()
})

test('can still get position 9', (t) => {
  t.equal(arr.get(9), 'v9')
  t.end()
})

test('delete 9th position', (t) => {
  arr.unset(9)
  t.end()
})

test('can not get position 9', (t) => {
  t.equal(arr.get(9), undefined)
  t.end()
})

test('length is now 0', (t) => {
  t.equal(arr.length, 0)
  t.end()
})
