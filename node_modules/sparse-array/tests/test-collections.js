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

test('has length', (t) => {
  t.equal(arr.length, 100)
  t.end()
})

test('can iterate', (t) => {
  let next = 0
  arr.forEach((elem, index, arr) => {
    t.equal(elem, next.toString())
    t.equal(index, next)
    t.equal(arr, arr)
    next ++
  })
  t.equal(next, max)
  t.end()
})

test('can map', (t) => {
  let next = 0
  const result = arr.map((elem, index, arr) => {
    t.equal(elem, next.toString())
    t.equal(index, next)
    t.equal(arr, arr)
    next ++
    return Number(elem) + 1
  })
  t.equal(next, max)
  t.equal(result.length, arr.length)

  next = 0
  result.forEach((elem) => {
    t.equal(elem, next + 1)
    next ++
  })
  t.equal(next, max)
  t.end()
})

test('can reduce', (t) => {
  let next = 0
  arr.reduce((acc, elem, index) => {
    t.equal(elem, next.toString())
    t.equal(index, next)
    next ++
    return acc + Number(elem)
  }, 0)
  t.equal(next, max)
  t.end()
})
