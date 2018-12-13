var path = require('path');
var test = require('tape');
var pull = require('pull-stream');
var file = require('..');
var fs = require('fs')

var ipsum = path.resolve(__dirname, 'assets', 'ipsum.txt')
var au = path.resolve(__dirname, 'assets', 'AU.txt')

test('can terminate read process', function(t) {

  var expected = [
    'Lorem ipsum dolor sit amet, consectetur ',
    'adipiscing elit. Quisque quis tortor eli',
    't. Donec vulputate lacus at posuere soda',
    'les. Suspendisse cursus, turpis eget dap'
  ];

  pull(
    file(ipsum, { bufferSize: 40 }),
    pull.take(expected.length),
    pull.drain(function(data) {
      t.equal(data.toString(), expected.shift(), 'line ok in drain');
    }, function (err) {
      if(err) throw err
      t.end()
    })
  );
});

test('can terminate file immediately (before open)', function (t) {

  var source = file(ipsum)
  var sync = false
  source(true, function (end) {
    sync = true
    t.equal(end, true)
  })
  t.ok(sync)
  t.end()

})

test('can terminate file immediately (after open)', function (t) {

  var source = file(ipsum)
  var sync1 = false, sync2 = false
  t.plan(6)
  source(null, function (end, data) {
    if(sync1) throw new Error('read1 called twice')
    sync1 = true
    t.equal(end, true, 'read aborted, end=true')
    t.notOk(data, 'read aborted, data = null')
  })
  source(true, function (end) {
    if(sync2) throw new Error('read2 called twice')
    sync2 = true
    t.ok(sync1, 'read cb was first')
    t.equal(end, true)
    t.end()
  })
  t.notOk(sync1)
  t.notOk(sync2)

})

test('can terminate file during a read', function (t) {

  var source = file(ipsum, {bufferSize: 1024})
  var sync1 = false, sync2 = false
  source(null, function (end, data) {
    t.equal(end, null)
    t.ok(data)
    source(null, function (end, data) {
      sync1 = true
      t.equal(end, true)
      t.notOk(data, "data can't have been read")
    })
    source(true, function (end) {
      sync2 = true
      t.equal(end, true, 'valid abort end')
      t.ok(sync1, 'read called back first')
      t.end()
    })
    t.notOk(sync1)
    t.notOk(sync2)
  })

})

//usually the read succeeds before the close does,
//but not always

test('after 10k times, cb order is always correct', function (t) {

  var C = 0, R = 0, T = 0
  ;(function next () {
    T++

    if(T > 10000) {
      t.equal(R, 10000)
      t.equal(C, 0)
      t.equal(R+C, 10000)
      console.log(C, R, T)
      return t.end()
    }

    var fd = fs.openSync(__filename, 'r+', 0666)
    var data, closed

    //create a file stream with a fixed fd,
    //configured to automatically close (as by default)
    var source = file(null, {fd: fd})

    //read.
    source(null, function (err, _data) {
      data = true
      if(!closed) R++
      if(data && closed) next()
    })

    //abort.
    source(true, function (err) {
      closed = true
      if(!data) C ++
      if(data && closed) next()
    })
  })()

})










