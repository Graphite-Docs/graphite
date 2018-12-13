'use strict'

const test = require('tape')
const SparseArray = require('../')

const max = 100
let arr

test('allows creation', (t) => {
  arr = new SparseArray()
  t.end()
})

test('allows pushing', (t) => {
  for(let i = 0; i < max; i++) {
    const pos = arr.push(i.toString())
    t.equal(pos, i + 1)
  }
  t.end()
})

test('find foundable', (t) => {
  const min = Math.floor(max / 2)
  t.equal(arr.find(elem => Number(elem) >= min), min.toString())
  t.end()
})

test('does not find unfoundable', (t) => {
  t.equal(arr.find(elem => Number(elem) > max), undefined)
  t.end()
})
