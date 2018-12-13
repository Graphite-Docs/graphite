'use strict'

const test = require('tape')
const SparseArray = require('../')

let arr

test('allows to be constructed', (t) => {
  arr = new SparseArray()
  t.end()
})

test('compact array is empty', (t) => {
  t.deepEqual(arr.compactArray(), [])
  t.end()
})

test('compact array containing one pos', (t) => {
  arr.set(10, '10')
  t.deepEqual(arr.compactArray(), ['10'])
  t.end()
})

test('compact array containing two positions', (t) => {
  arr.set(5, '5')
  t.deepEqual(arr.compactArray(), ['5', '10'])
  t.end()
})
