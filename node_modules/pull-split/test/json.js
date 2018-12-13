var tape = require('tape')
var pull = require('pull-stream')
var Split = require('../')

var input = [
  1, 2, {okay: true}, 'whatever'
]


tape('split into json lines', function (t) {

  pull(
    pull.values([input.map(JSON.stringify).join('\n')]
),
    Split(null, JSON.parse),
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, input)
      t.end()
    })
  )

})

tape('split into json lines', function (t) {

  pull(
    pull.values([input.map(function (d) {
      return JSON.stringify(d, null, 2)
    }).join('\n\n')]
),
    Split('\n\n', JSON.parse),
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, input)
      t.end()
    })
  )
})


tape('split into json lines', function (t) {

  pull(
    pull.values([input.map(function (d) {
      return JSON.stringify(d, null, 2) + '\n'
    }).join('\n')]
),
    Split('\n\n', JSON.parse),
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, input)
      t.end()
    })
  )
})
