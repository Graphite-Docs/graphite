/* global suite, bench */

const obj = {
  a: {
    a: {a: 1, b: 2, c: 3},
    b: {a: 1, b: 2, c: 3},
    c: {a: 1, b: 2, c: 3}
  },
  b: {
    a: {a: 1, b: 2, c: 3},
    b: {a: 1, b: 2, c: 3},
    c: {a: 1, b: 2, c: 3}
  },
  c: {
    a: {a: 1, b: 2, c: 3},
    b: {a: 1, b: 2, c: 3},
    c: {a: 1, b: 2, c: 3}
  }
}

suite('Current', function () {
  const isCircular = require('../index')

  bench('isCircular', function () {
    isCircular(obj)
  })
})

suite('Old', function () {
  const isCircular = require('is-circular')

  bench('isCircular', function () {
    isCircular(obj)
  })
})
