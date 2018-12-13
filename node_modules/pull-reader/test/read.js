var tape = require('tape')
var split = require('pull-randomly-split')
var pull = require('pull-stream')
var crypto = require('crypto')
var Reader = require('../')
var Hang = require('pull-hang')

var bytes = crypto.randomBytes(64)


tape('read once a stream', function (t) {

  var reader = Reader()

  pull(
    pull.values([bytes]),
    split(),
    reader
  )

  reader.read(32, function (err, data) {
    t.notOk(err)
    t.deepEqual(data, bytes.slice(0, 32))
    t.end()
  })

})

tape('read twice from a stream', function (t) {

  var reader = Reader()

  pull(
    pull.values([bytes]),
    split(),
    reader
  )

  reader.read(32, function (err, data) {

    console.log('read1', err, data)
    t.notOk(err)
    t.deepEqual(data, bytes.slice(0, 32))

    reader.read(16, function (err, data) {
      console.log('read2')
      t.notOk(err)
      t.deepEqual(data, bytes.slice(32, 48))
      t.end()
    })
  })

})

tape('read whatever is there', function (t) {

  var reader = Reader()

  pull(
    pull.values([bytes]),
    split(),
    reader
  )

  reader.read(null, function (err, data) {
    t.notOk(err)
    console.log(data)
    t.ok(data.length > 0)
    t.end()
  })

})

tape('read a stream', function (t) {

  var reader = Reader()

  pull(
    pull.values([bytes]),
    split(),
    reader
  )

  pull(
    reader.read(),
    pull.collect(function (err, data) {
      t.notOk(err)
      var _data = Buffer.concat(data)
      t.equal(_data.length, bytes.length)
      t.deepEqual(_data, bytes)
      t.end()
    })
  )

})

tape('async read', function (t) {

  var reader = Reader()

  pull(
    pull.values([new Buffer('hello there')]),
    reader
  )

  setTimeout(function () {
    reader.read(6, function (err, hello_) {
      setTimeout(function () {
        reader.read(5, function (err, there) {
        if(err) throw new Error('unexpected end')
          t.deepEqual(Buffer.concat([hello_, there]).toString(), 'hello there')
          t.end()
        })
      })
    })
  })

})

tape('abort the stream', function (t) {

  var reader = Reader()

  pull(
    Hang(function (err) {
      t.end()
    }),
    reader
  )

  reader.abort()

})


tape('abort the stream and a read', function (t) {

  t.plan(4)
  var reader = Reader(), err = new Error('intended')

  pull(
    Hang(function (err) {
      t.end()
    }),
    reader
  )

  reader.read(32, function (_err) {
    t.equal(_err, err)
  })
  reader.read(32, function (_err) {
    t.equal(_err, err)
  })
  reader.read(32, function (_err) {
    t.equal(_err, err)
  })

  reader.abort(err, function (_err) {
    t.equal(_err, err)
  })

})

tape('if streaming, the stream should abort', function (t) {

  var reader = Reader(), err = new Error('intended')

  pull(Hang(), reader)

  pull(
    reader.read(),
    pull.collect(function (_err) {
      t.equal(_err, err)
      t.end()
    })
  )

  reader.abort(err)

})

tape('abort stream once in streaming mode', function (t) {

  var reader = Reader()

  pull(Hang(), reader)

  var read = reader.read()

  read(true, function (err) {
    t.ok(err)
    t.end()
  })

})


tape('configurable timeout', function (t) {

  var reader = Reader(100)
  var start = Date.now()
  pull(Hang(), reader)

  pull(
    reader.read(),
    pull.collect(function (err) {
      t.ok(err)
      t.ok(Date.now() < start + 300)
      t.end()
    })
  )

})


tape('timeout does not apply to the rest of the stream', function (t) {
  var reader = Reader(100)
  var once = false
  pull(
    function (abort, cb) {
      if(!once)
        setTimeout(function () {
          once = true
          cb(null, new Buffer('hello world'))
        }, 200)
      else
        cb(true)
    },
    reader
  )

  pull(
    reader.read(),
    pull.collect(function (err, ary) {
      t.notOk(err)
      t.equal(Buffer.concat(ary).toString(), 'hello world')
      t.end()
    })
  )
})


tape('overreading results in an error', function (t) {
  var corruptedBytes = crypto.randomBytes(10)

  pull(
    pull.values([corruptedBytes]),
    reader = Reader(20e3)
  )

  reader.read(11, function(_err) {
    t.ok(_err)
    t.end()
  })
})


tape('overreading with multiple reads results in an error', function (t) {
  var corruptedBytes = crypto.randomBytes(10)

  pull(
    pull.values([corruptedBytes]),
    reader = Reader()
  )

  reader.read(1, function(err) {
    t.notOk(err)
    reader.read(100, function(_err) {
      t.ok(_err)
      t.end()
    })
  })
})



