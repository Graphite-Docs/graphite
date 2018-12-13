var pull = require('pull-stream')
var pair = require('../')
var Duplex = require('../duplex')
var tape = require('tape')

tape('simple', function (t) {
  var p = pair()
  var input = [1, 2, 3]
  pull(pull.values(input), p.sink)
  pull(p.source, pull.collect(function (err, values) {
    if(err) throw err
    console.log(values) //[1, 2, 3]
    t.deepEqual(values, input)
    t.end()
  }))

})

tape('simple - error', function (t) {
  var p = pair()
  var err = new Error('test errors')
  var input = [1, 2, 3]
  pull(function (abort, cb) { cb(err) }, p.sink)
  pull(p.source, pull.collect(function (_err, values) {
    console.log(_err)
    t.equal(_err, err)
    t.end()
  }))

})
tape('echo duplex', function (t) {
  var d = Duplex()
  pull(
    pull.values([1,2,3]),
    d[0],
    pull.collect(function (err, ary) {
      t.deepEqual(ary, [1,2,3])
      t.end()
    })
  )

  //pipe the second duplex stream back to itself.
  pull(d[1], pull.through(console.log), d[1])

})
