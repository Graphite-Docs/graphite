var test = require('tape');
var WebSocket = require('ws');
var endpoint = require('./helpers/wsurl') + '/read';
var pull = require('pull-stream');
var ws = require('../source');
var socket;

var server = require('./server')()

test('create a websocket connection to the server', function(t) {
  t.plan(1);

  socket = new WebSocket(endpoint);
  socket.onopen = t.pass.bind(t, 'socket ready');
});

test('read values from the socket and end normally', function(t) {
  t.plan(2);

  pull(
    ws(socket),
    pull.collect(function(err, values) {
      t.ifError(err);
      t.deepEqual(values, ['a', 'b', 'c', 'd']);
    })
  );
});

test('read values from a new socket and end normally', function(t) {
  t.plan(2);

  pull(
    ws(new WebSocket(endpoint)),
    pull.collect(function(err, values) {
      t.ifError(err);
      t.deepEqual(values, ['a', 'b', 'c', 'd']);
    })
  );
});

test('close', function (t) {
  server.close()
  t.end()
})
