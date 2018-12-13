var pull = require('pull-stream');

// we just need the source, so cherrypick
var ws = require('../source');

pull(
  // connect to the test/server.js endpoint
  ws(new WebSocket('ws://localhost:3000/read')),
  pull.log()
);
