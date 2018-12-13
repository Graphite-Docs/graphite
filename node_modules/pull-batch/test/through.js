'use strict'

const test = require('tape')
const pull = require('pull-stream')
const through = require('pull-through')

const batch = require('../')

const maxLengths = [1, 10, 100]
const writeSizes = [1, 4, 8, 16, 32]

maxLengths.forEach(function (maxLength) {
  writeSizes.forEach(function (writeSize) {
    test('writeSize=' + writeSize + ' maxLength=' + maxLength, function (t) {
      const input = []

      for (let i = 0; i < writeSize; i++) {
        input.push(input.length)
      }

      let gotCount = 0

      pull(
        pull.values(input),
        batch(maxLength),
        through(
          function (arr) {
            const self = this
            t.assert(Array.isArray(arr), 'is array')
            t.assert(arr.length <= maxLength, 'array is bigger than max size')
            arr.forEach(function (elem) {
              t.equal(elem, gotCount, 'individual element has the expected value')
              gotCount++
              self.queue(elem)
            })

            // timers.setTimeout(function () {}, 100)
          },
          function (end) {
            t.equal(gotCount, writeSize, 'got ' + writeSize + ' elements')
            this.queue(null)
          }
        ),
        pull.collect(function (err, collected) {
          t.error(err)
          t.true(Array.isArray(collected))
          t.deepEqual(collected, input, 'collected is equal to input')
          t.end()
        })
      )
    })
  })
})
