timed-tape
==========

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

timed-tape extends [tape](https://github.com/substack/tape) so that each test prints the time taken.

## API

Pass the `tape` module into `timed-tape`:

```js
var tape = require('timed-tape')(require('tape'))
```

This will return a tape instance that prints the time that each test took.

## Example

```js
var test = require('timed-tape')(require('tape'));

test('Check addition', t => {
  t.equal(1 + 1, 2, 'one plus one is two');
  t.end();
});

test('Check multiplication', t => {
  t.equal(1 * 1, 1, 'one times one is one');
  t.end();
});
```

Resulting output:

```bash
$ node mytest.js
TAP version 13
# Check addition
ok 1 one plus one is two
# time: 17 ms
# Check multiplication
ok 2 one times one is one
# time: 17 ms

1..2
# tests 2
# pass  2

# ok
```
