var pull = require('pull-stream')
var paraMap = require('../')
var ordered = [], unordered = [], unordered2 = []
var test = require('tape')
var Abortable = require('pull-abortable')

test('parallel, output unordered', function (t) {
  t.plan(1)
  var result = []
  pull(pull.count(100),

    paraMap(function (i, cb) {
      setTimeout(function () {
        result.push(i)
        cb(null, i)
      }, (100 - i) * 10)
    }, null, false),

  pull.collect(function (err, data) {
    console.log(err, data)
    console.log(result)
    t.deepEqual(data, result, 'should emit events in the order they arrive')
  }))
})

test('paralell, but output is ordered', function (t) {

  pull(
    pull.count(100),
    pull.through(function (i) {
      ordered.push(i)
    }),
    paraMap(function (i, cb) {
      setTimeout(function () {
        unordered.push(i)
        cb(null, i)
      }, Math.random()*100)
    }),
    paraMap(function (i, cb) {
      setTimeout(function () {
        unordered2.push(i)
        cb(null, i)
      }, Math.random()*100)
    }),
    pull.collect(function (err, ary) {
      function sort (a) {
        return a.slice()
          .sort(function (a,b){
            return a - b
          })
      }
      console.log(unordered)
      t.deepEqual(ordered, ary)
      t.deepEqual(ordered, sort(unordered), 'ordered == sort(unordered)')
      t.deepEqual(ordered, sort(unordered2), 'ordered == sort(unordered2)')
      t.notDeepEqual(ordered, unordered)
      t.notDeepEqual(ordered, unordered2)
      t.end()
    })
  )

})


test('paralell, but output is ordered', function (t) {
  var m = 0
  function breaky (i, cb) {
    if(i !== 33)
      setTimeout(function () {
        unordered.push(i)
        cb(null, i)
      }, Math.random()*100)
    else
      setTimeout(function () {
          cb(new Error('an error'))
      },100)
  }

  pull(
    pull.count(100),
    pull.through(function (i) {
      ordered.push(i)
    }),
    paraMap(breaky),
    pull.collect(function (err, ary) {
      console.log(err, ary)
      t.ok(err)
      t.end()
    })
  )

})


test('parallel, but `max` items at once', function (t) {
  var n = 0, input = []
  pull(
    pull.count(100),
    pull.through(function (i) {
      input.push(i)
    }),
    paraMap(function (data, cb) {
      n++
      t.ok(n <= 10, 'max 10 concurrent calls')
      setTimeout(function () {
        n--
        t.ok(n <= 10, 'max 10 concurrent calls')
        cb(null, data)
      })
    }, 10),
    pull.collect(function (err, output) {
      t.deepEqual(output, input)
      t.end()
    })
  )
})

test('abort a stalled stream', function (t) {

  var abortable = Abortable(), err = new Error('intentional')
  var i = 2
  pull(
    pull.values([1,2,3], function (_err) {
      t.equal(_err, err)
      if(0 == --i) t.end()
    }),
    paraMap(function (data, cb) {
      setTimeout(function () {
        if(data === 1) cb(null, 1)
        //else stall
      })
    }, 10),
    abortable,
    pull.drain(null, function (_) {
      if(0 == --i) t.end()
    })
  )

  setTimeout(function () {
    abortable.abort(err)
  }, 100)

})

test('abort calls back', function (t) {
  var read = pull(
    pull.values([1,2,3]),
    paraMap(function (data, cb) {
      cb(null, data)
    })
  )

  read(true, function (err, data) {
    t.equal(err, true)
    t.end()
  })
})

test('abort calls back', function (t) {
  var read = pull(
    pull.values([1,2,3]),
    paraMap(function (data, cb) {
      cb(null, data)
    }),
    pull.drain(function (e) {
      if(e == 2) return false
    }, function (err, data) {
    t.equal(err, true)
    t.end()
  }))
})

test('abort passes along errors', function (t) {
  var read = pull(
    function read(abort, cb) {
      cb(new Error('Failure'))
    },
    paraMap(function (data, cb) {
      cb(null, data)
    }),
    function sink (read) {
      read(null, function next (err, data) {
        t.equal(err.message, 'Failure')
        t.end()
      })
    }
  )
})

test('range error', function (t) {
  pull(
    pull.count(10000),
    paraMap(function (d, cb) {
      cb(null, d*10000)
    }),
    pull.drain(null, function (err) {
      t.end()
    })
  )

})
