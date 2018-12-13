var test = require('tape');
var WebSocket = require('ws');
var pull = require('pull-stream');
var ws = require('..');
var url = require('./helpers/wsurl') + '/echo';
var goodbye = require('pull-goodbye');

var server = require('./server')()

test('setup echo reading and writing', function(t) {
  var socket = new WebSocket(url);
  var expected = ['x', 'y', 'z'];

  t.plan(expected.length);

  pull(
    ws.source(socket),
    pull.drain(function(value) {
      console.log(value)
      t.equal(value, expected.shift());
    })
  );

  pull(
    pull.values([].concat(expected)),
    ws.sink(socket, {closeOnEnd: false})
  );

});


test('duplex style', function(t) {
  var expected = ['x', 'y', 'z'];
  var socket = new WebSocket(url);

  t.plan(expected.length);

  pull(
    pull.values([].concat(expected)),
    ws(socket, {closeOnEnd: false}),
    pull.drain(function(value) {
      console.log('echo:', value)
      t.equal(value, expected.shift());
    })
  );

});


test('duplex with goodbye handshake', function (t) {

  var expected = ['x', 'y', 'z'];
  var socket = new WebSocket(url);

  var pws = ws(socket)

  pull(
    pws,
    goodbye({
      source: pull.values([].concat(expected)),
      sink: pull.drain(function(value) {
        t.equal(value, expected.shift());
      }, function (err) {
        t.equal(expected.length, 0)
        t.end()
      })
    }),
    pws
  );


})

test('close', function (t) {
  server.close()
  t.end()
})
