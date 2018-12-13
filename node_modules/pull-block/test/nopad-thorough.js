'use strict'

var test = require('tape')
var pull = require('pull-stream')

var block = require('../')

var blockSizes = [16]//, 25]//, 1024]
var writeSizes = [4, 15, 16, 17, 64]//, 64, 100]
var writeCounts = [1, 10]//, 100]

writeCounts.forEach(function (writeCount) {
  blockSizes.forEach(function (blockSize) {
    writeSizes.forEach(function (writeSize) {
      test('writeSize=' + writeSize +
           ' blockSize=' + blockSize +
           ' writeCount=' + writeCount, function (t) {
        var actualChunks = 0
        var actualBytes = 0
        var timeouts = 0

        var input = []
        for (var i = 0; i < writeCount; i++) {
          var a = Buffer.alloc(writeSize)
          var j
          for (j = 0; j < writeSize; j++) a[j] = 'a'.charCodeAt(0)
          var b = Buffer.alloc(writeSize)
          for (j = 0; j < writeSize; j++) b[j] = 'b'.charCodeAt(0)

          input.push(a)
          input.push(b)
        }

        pull(
          pull.values(input),
          block(blockSize, {nopad: true}),
          pull.through(function (c) {
            timeouts++

            actualChunks++
            actualBytes += c.length

            // make sure that no data gets corrupted, and basic sanity
            var before = c.toString()
            // simulate a slow write operation
            setTimeout(function () {
              timeouts--

              var after = c.toString()
              t.equal(after, before, 'should not change data')

              // now corrupt it, to find leaks.
              for (var i = 0; i < c.length; i++) {
                c[i] = 'x'.charCodeAt(0)
              }
            }, 100)
          }),
          pull.onEnd(function (err) {
            t.error(err)
            // round up to the nearest block size
            var expectChunks = Math.ceil(writeSize * writeCount * 2 / blockSize)
            var expectBytes = writeSize * writeCount * 2
            t.equal(actualBytes, expectBytes,
                    'bytes=' + expectBytes + ' writeSize=' + writeSize)
            t.equal(actualChunks, expectChunks,
                    'chunks=' + expectChunks + ' writeSize=' + writeSize)

            // wait for all the timeout checks to finish, then end the test
            setTimeout(function WAIT () {
              if (timeouts > 0) return setTimeout(WAIT)
              t.end()
            }, 100)
          })
        )
      })
    })
  })
})
