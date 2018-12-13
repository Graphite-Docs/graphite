var file = require('..');
var pull = require('pull-stream');
var path = require('path');
var inputFile = path.resolve(__dirname, '../test/assets/ipsum.txt');

pull(
  file(inputFile, { bufferSize: 40 }),
  pull.take(4),
  pull.drain(function(buffer) {
    console.log(buffer.toString());
  })
);