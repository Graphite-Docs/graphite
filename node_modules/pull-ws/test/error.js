var test = require('tape');
var WebSocket = require('ws');
var endpoint = require('./helpers/wsurl') + '/read';
var pull = require('pull-stream');
var ws = require('../');

var server = require('./server')()

//connect to a server that does not exist, and check that it errors.
//should pass the error to both sides of the stream.
test('test error', function (t) {
  var _err
  pull(
    pull.values(['x', 'y', 'z']),
    pull.through(null, function (err) {
      if(_err) {
        t.strictEqual(err, _err);
        t.end();
      }
      _err = err
    }),
    ws(new WebSocket('ws://localhost:34897/' + Math.random())),
    pull.collect(function (err) {
      if(_err) {
        t.strictEqual(err, _err);
        t.end();
      }
      _err = err
    })
  )

})

//connect to a server that does not exist, and check that it errors.
//should pass the error to both sides of the stream.
test('test error', function (t) {
  var _err

  ws(new WebSocket('ws://localhost:34897/' + Math.random()),
    {onConnect: function (err) {
      t.ok(err)
      t.end()
    }})

})


test('close', function (t) {
  server.close()
  t.end()
})
