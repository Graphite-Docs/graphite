
var tape = require('tape')
var many = require('../')
var pull = require('pull-stream')

tape('add after stream creation', function (t) {

  var m = many()

  pull(
    m,
    pull.collect(function (err, ary) {
      t.notOk(err)
      t.deepEqual(ary.sort(), [1,2,3,4,5,6])
      t.end()
    })
  )

  m.add(pull.values([1,2,3]))
  m.add(pull.values([4,5,6]))
  m.add()

})

tape('add after stream creation', function (t) {

  var m = many()

  pull(
    m,
    pull.collect(function (err, ary) {
      t.notOk(err)
      t.deepEqual(ary.sort(), [])
      t.end()
    })
  )

  m.add()

})

tape('do not close inputs until the last minute', function (t) {

  var m = many()
  var seen = []

  pull(
    m,
    pull.through(function (data) {
      //wait until the last message to end inputs.
      console.log('seen', data)
      seen.push(data)
      if(data >= 6) m.cap()
    }),
    pull.collect(function (err, ary) {
      t.notOk(err)
      t.deepEqual(ary.sort(), [1,2,3,4,5,6])
      t.deepEqual(seen.sort(), [1,2,3,4,5,6])
      t.end()
    })
  )

  m.add(pull.values([1,2,3]))
  m.add(pull.values([4,5,6]))

})

