var tape = require('tape')
var pull = require('pull-stream')
var through = require('../')

tape('emit error', function (t) {
  var err = new Error('expected error')
  pull(
    pull.values([1,2,3]),
    through(function (data) {
      this.emit('error', err)
    }),
    pull.drain(null, function (_err) {
      t.equal(_err, err)
      t.end()
    })
  )
})

tape('through', function (t) {
  pull(
    pull.values([1,2,3]),
    through(function (data) {
      this.queue(data * 10)
    }),
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, [10, 20, 30])
      t.end()
    })
  )
})

tape('through + end', function (t) {
  pull(
    pull.values([1,2,3]),
    through(function (data) {
      this.queue(data * 10)
    }, function () {
      this.queue(40)
      this.queue(null)
    }),
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, [10, 20, 30, 40])
      t.end()
    })
  )
})

tape('through + end, falsey values', function (t) {
  pull(
    pull.values([0, 1,2,3]),
    through(function (data) {
      this.queue(data * 10)
    }, function () {
      this.queue(40)
      this.queue(null)
    }),
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, [0, 10, 20, 30, 40])
      t.end()
    })
  )
})



tape('range error', function (t) {

  var n = 0
  pull(
    pull.count(1000000),
    through(function (data) {
      n += data
    }),
    pull.drain(null, function () {
      console.log(n)
      t.equal(500000500000, n)
      t.end()
    })
  )

})

tape('pass error through', function (t) {

  var err = new Error('testing errors')

  pull(
    pull.error(err),
    through(console.log),
    pull.drain(null, function (_err) {
      t.equal(_err, err)
      t.end()
    })
  )

})

tape('pass abort back to source', function (t) {
  pull(
    pull.values([1,2,3], function () { t.end() }),
    through(function (data) {
      this.queue(data)
    }),
    pull.take(1),
    pull.collect(function (err, ary) {
      t.deepEqual(ary, [1])
    })
  )

})

tape('pass abort back to source in stalled stream', function (t) {
  var read = pull(
    pull.values([1,2,3], function () { t.end() }),
    pull.asyncMap(function (d, cb) {
      setImmediate(function () {
        cb(null, d)
      })
    }),
    through(function (data) {
      //do nothing. this will make through read ahead some more.
    })
  )

  var c = 0, d = 0

  read(null, function (err, data) {
    t.equal(d, 1, 'unsatified read cb after abort called')
    t.equal(c++, 0, 'unsatified read cb before abort cb')
  })

  d++
  read(true, function (err) {
    t.equal(c++, 1)
  })
})

tape('abort source on error', function (t) {
  var err = new Error('intentional')

  var read = pull(
    pull.values([1,2,3], function (_err) {
      t.equal(_err, err)
      t.end()
    }),
    through(function (data) {
      //do nothing. this will make through read ahead some more.
      this.emit('error', err)
    }),
    pull.drain(null, function (_err) {
      t.equal(_err, err)
    })
  )
})


tape('abort source on end within writer', function (t) {
  var err = new Error('intentional')

  var read = pull(
    pull.values([1,2,3], function () {
      t.end()
    }),
    through(function (data) {
      //do nothing. this will make through read ahead some more.
      this.emit('end', err)
    }),
    pull.drain(null, function (_err) {
      t.equal(_err, null)
    })
  )
})
