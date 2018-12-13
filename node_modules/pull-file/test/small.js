var path = require('path');
var test = require('tape');
var pull = require('pull-stream');
var file = require('..');

test('small text', function(t) {
  t.plan(1);

  pull(
    file(path.resolve(__dirname, 'assets', 'test.txt')),
    pull.map(function(data) {
      return data.toString();
    }),
    pull.collect(function(err, items) {
      t.equal(items.join(''), 'hello');
    })
  );
});

test('buffer size respected', function(t) {
  var expected = ['he', 'll', 'o'];

  t.plan(3);

  pull(
    file(path.resolve(__dirname, 'assets', 'test.txt'), { bufferSize: 2 }),
    pull.drain(function(data) {
      t.equal(data.toString(), expected.shift());
    })
  );
});