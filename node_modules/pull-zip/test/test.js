var zip = require('../')
var pull = require('pull-stream')

var test = require('tape')

test('zip same length arrays', function (t) {

  pull(
    zip(
      pull.values([1, 2, 3]),
      pull.values('ABC'.split(''))
    ),
    pull.collect(function (err, zipped) {
      console.log(zipped)
      t.deepEqual([[1, 'A'], [2, 'B'], [3, 'C']], zipped)
      t.end()
    })
  )

})

test('zip different length arrays', function (t) {

  pull(
    zip(
      pull.values([1, 2, 3]),
      pull.values('ABCx'.split(''))
    ),
    pull.collect(function (err, zipped) {
      console.log(zipped)
      t.deepEqual([[1, 'A'], [2, 'B'], [3, 'C'], [null, 'x']], zipped)
      t.end()
    })
  )

})
