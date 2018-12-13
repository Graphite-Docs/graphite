var test = require('tape');
var WebSocket = require('ws');
var endpoint = require('./helpers/wsurl') + '/echo';
var pull = require('pull-stream');
var ws = require('..');

var server = require('./server')()

test('websocket closed when pull source input ends', function(t) {
  var socket = new WebSocket(endpoint);

  t.plan(1);

  pull(
    ws.source(socket),
    pull.collect(function(err) {
      console.log('END')
      t.ifError(err, 'closed without error');
    })
  );

  pull(
    pull.values(['x', 'y', 'z']),
    ws.sink(socket, { closeOnEnd: true })
  );
});

test('sink has callback for end of stream', function(t) {
  var socket = new WebSocket(endpoint);

  t.plan(2);

  pull(
    ws.source(socket),
    pull.collect(function(err) {
      t.ifError(err, 'closed without error');
    })
  );

  pull(
    pull.values(['x', 'y', 'z']),
    ws.sink(socket, function (err) {
      t.ifError(err, 'closed without error - sink');
    })
  );
});


test('closeOnEnd=false, stream doesn\'t close', function(t) {
  var socket = new WebSocket(endpoint);

  t.plan(3);
  pull(
    ws.source(socket),
    pull.drain(function (item) {
      t.ok(item)
    })
  );

  pull(
    pull.values(['x', 'y', 'z']),
    ws.sink(socket, { closeOnEnd: false })
  );
});

test('close', function (t) {
  server.close()
  t.end()
})
