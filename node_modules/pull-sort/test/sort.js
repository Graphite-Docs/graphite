var tape = require('tape')
var sort = require('../')
var pull = require('pull-stream')

tape('sort an array', function (t) {
  pull(
    pull.values([3, 2, 1]),
    sort(),
    pull.collect(function (err, values) {
      t.notOk(err)
      t.deepEqual(values, [1, 2, 3])
      t.end()
    })
  )
})

tape('do not swallow errors', function (t) {
  var error = new Error('Something went wrong')

  pull(
    pull.error(error),
    sort(),
    pull.collect(function (err, values) {
      t.deepEqual(err, error)
      t.end()
    })
  )
})
