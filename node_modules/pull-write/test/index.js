var tape = require('tape')
var pull = require('pull-stream')
var cat = require('pull-cat')
var createWrite = require('../')

tape('simple', function (t) {

  var output = []

  pull(
    pull.count(3),
    createWrite(function write(data, cb) {
      output = output.concat(data)
      cb()
    }, null, 10, function (err) {
      if(err) throw err
      t.deepEqual(output, [0, 1,2,3])
      t.end()
    })
  )
})

tape('error', function (t) {
  var err = new Error('read error test')
  pull(
    pull.error(err),
    createWrite(function () { throw new Error('should never happen') },
    null, 10,  function (_err) {
      t.strictEqual(_err, err)
      t.end()
    })
  )
})

tape('write error', function (t) {
  t.plan(2)
  var err = new Error('write error test')
  pull(
    pull.values([1], function (_err) {
      t.strictEqual(_err, err)
    }),
    createWrite(function (_, cb) {
      cb(err)
    }, null, 10, function (_err) {
      t.strictEqual(_err, err)
    })
  )
})

tape('end then write error', function (t) {
  t.plan(1)
  var err = new Error('write error test')
  pull(
    pull.values([1]),
    createWrite(function (_, cb) {
      setImmediate(function () { cb(err) })
    }, null, 10, function (_err) {
      t.strictEqual(_err, err)
    })
  )
})

tape('simple, async', function (t) {

  var output = []

  pull(
    pull.count(3),
    createWrite(function write(data, cb) {
      setImmediate(function () {
        output = output.concat(data); cb()
      })
    }, null, 10, function (err) {
      if(err) throw err
      t.deepEqual(output, [0,1,2,3])
      t.end()
    })
  )
})

tape('read then error', function (t) {
  var err = new Error('read test error')
  var output = []
  pull(
    cat([pull.count(3), pull.error(err)]),
    createWrite(function write(data, cb) {
      console.log('write', data)
      setImmediate(function () {
        output = output.concat(data); cb()
      })
    }, null, 10, function (_err) {
      console.log('ended')
      t.strictEqual(_err, err)
      t.deepEqual(output, [0])
      t.end()
    })
  )
})


tape('read to max', function (t) {
  var output = []
  pull(
    pull.count(30),
    createWrite(function write(data, cb) {
      setImmediate(function () {
        output = output.concat(data); cb()
      })
    }, null, 10, function (err) {
      t.notOk(err)
      t.equal(output.length, 31)
      t.end()
    })
  )
})

tape('sometimes reduce to null', function (t) {
  var output = []
  pull(
    pull.count(30),
    createWrite(function write(data, cb) {
      if(data == null) throw new Error('data cannot be null')
      setImmediate(function () {
        output = output.concat(data); cb()
      })
    }, function (a, b) {
      if(!(b%2)) return a
      return (a||[]).concat(b)
    }, 10, function (err) {
      t.notOk(err)
      t.deepEqual(output, [ 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29 ])
      t.end()
    })
  )

})


tape('abort', function (t) {
  t.plan(2)
  var output = [], writer = createWrite(function write(data, cb) {
      if(data == null) throw new Error('data cannot be null')
      setImmediate(function () {
        output = output.concat(data); cb()
      })
    }, function (a, b) {
      if(!(b%2)) return a
      return (a||[]).concat(b)
    }, 10, function (err) {
      t.ok(err)
    })
  pull(
    pull.count(30),
    writer
  )

  writer.abort(function (err) {
    t.notOk(err)
    t.end()
  })

})

tape('abort', function (t) {
  t.plan(2)
  var writer = createWrite(function write(data, cb) {
      if(data == null) throw new Error('data cannot be null')
      setImmediate(function () {
        output = output.concat(data); cb()
      })
    }, function (a, b) {
      if(!(b%2)) return a
      return (a||[]).concat(b)
    }, 10, function (err) {
      t.ok(err)
    })

  writer.abort(function (err) {
    t.notOk(err)
    t.end()
  })

  pull(
    pull.count(30),
    writer
  )

})




tape('range error', function (t) {
  var len = 0
  pull(
    pull.count(10000),
    createWrite(function (data, cb) {
      len += data.length
      cb()
    }, function (a, b) {
      if(!a) return [b]
      return a.concat(b)
    }, 100, function (err) {
      t.equal(len, 10001)
      t.end()
    })
  )
})

