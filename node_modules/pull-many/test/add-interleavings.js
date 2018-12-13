
var pull = require('pull-stream')
var async = require('interleavings')
var many = require('../')
var assert = require('assert')

async.test(function (async) {


  var m = many()

  var n = 2, o = 6

  async(function () {
    m.add(async.through('odd')(pull.values([1,3,5])))
  }, 'add-odd') ()

  async(function () {
    m.add(async.through('even')(pull.values([2,4,6])))
  }, 'add-even') ()

  async(function () {

    pull(
      m,
      async.through('collector'),
      pull.through(function (d) {
        console.log('D', d)
        if(!--o) m.add()
      }),
      pull.collect(function (err, ary) {
        var odd  = ary.filter(function (e) { return e % 2 })
        var even = ary.filter(function (e) { return !(e % 2) })

        assert.deepEqual(even, [2,4,6])
        assert.deepEqual(odd, [1,3,5])
        async.done()
      })
    )


  }, 'pipe streams')()


})


//strange(async(54, console.error))

