'use strict'

const test = require('tape')
const SparseArray = require('../')

let arr

test('allows to be constructed', (t) => {
  arr = new SparseArray()
  t.end()
})

test('bit field is empty', (t) => {
  t.deepEqual(arr.bitField(), [])
  t.end()
})

test('one item at 0 position', (t) => {
  arr.set(0, 0)
  t.deepEqual(arr.bitField(), [0b1])
  t.end()
})

test('another item at 1 position', (t) => {
  arr.set(1, 1)
  t.deepEqual(arr.bitField(), [0b11])
  t.end()
})

test('another item at 7th position', (t) => {
  arr.set(6, 6)
  t.deepEqual(arr.bitField(), [0b1000011])
  t.end()
})

test('another item at 8th position', (t) => {
  arr.set(7, 7)
  t.deepEqual(arr.bitField(), [0b11000011])
  t.end()
})

test('another item at 9th position', (t) => {
  arr.set(8, 8)
  t.deepEqual(arr.bitField(), [0b11000011, 0b1])
  t.end()
})

test('another item at 11th position', (t) => {
  arr.set(10, 10)
  t.deepEqual(arr.bitField(), [0b11000011, 0b101])
  t.end()
})

test('another item at 16th position', (t) => {
  arr.set(15, 15)
  t.deepEqual(arr.bitField(), [0b11000011, 0b10000101])
  t.end()
})

test('another item at 17th position', (t) => {
  arr.set(16, 16)
  t.deepEqual(arr.bitField(), [0b11000011, 0b10000101, 0b1])
  t.end()
})
