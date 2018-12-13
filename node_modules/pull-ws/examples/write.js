var pull = require('pull-stream');
var ws = require('..');

// connect to the echo endpoint for test/server.js
var socket = new WebSocket('wss://echo.websocket.org');

// write values to the socket
pull(
  pull.infinite(function() {
    return 'hello @ ' + Date.now()
  }),
  // throttle so it doesn't go nuts
  pull.asyncMap(function(value, cb) {
    setTimeout(function() {
      cb(null, value);
    }, 100);
  }),
  ws.sink(socket)
);

socket.addEventListener('message', function(evt) {
  console.log('received: ' + evt.data);
});
