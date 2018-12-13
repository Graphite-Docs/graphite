# pull-block

[![build status](https://secure.travis-ci.org/dignifiedquire/pull-stream.png)](http://travis-ci.org/dignifiedquire/pull-block)[![Dependency Status](https://david-dm.org/dignifiedquire/pull-stream.svg?style=flat-square)](https://david-dm.org/dignifiedquire/pull-stream) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> transform input into equally-sized chunks as output

[pull-stream](https://pull-stream.github.io/) version of [block-stream](https://npmjs.org/package/block-stream).


# Installation

With [npm](https://npmjs.org) do:

```bash
> npm install pull-block
```

## Example

```js
var block = require('pull-block')
var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')

pull(
  toPull.source(process.stdin),
  block({ size: 16, zeroPadding: true }),
  pull.through(function (buf) {
    var str = buf.toString().replace(/[\x00-\x1f]/g, chr)
    console.log('buf[' + buf.length + ']=' + str)
  }),
  pull.drain()
)

function chr (s) { return '\\x' + pad(s.charCodeAt(0).toString(16), 2) }
function pad (s, n) { return Array(n - s.length + 1).join('0') + s }
```

```
$ echo {c,d,f}{a,e,i,o,u}{t,g,r} | node example/stream.js
buf[16]=cat cag car cet
buf[16]=ceg cer cit cig
buf[16]=cir cot cog cor
buf[16]=cut cug cur dat
buf[16]=dag dar det deg
buf[16]=der dit dig dir
buf[16]=dot dog dor dut
buf[16]=dug dur fat fag
buf[16]=far fet feg fer
buf[16]=fit fig fir fot
buf[16]=fog for fut fug
buf[16]=fur\x0a\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00
```

# Methods

``` js
var block = require('pull-block')
```

## var b = block(opts)
## var b = block(size, opts)

Create a new through stream `b` that outputs chunks of length `size` or
`opts.size`.

When `opts.zeroPadding` is false, do not zero-pad the last chunk.

When `opts.emitEmpty` is true (default is `false`), emit a zero-sized buffer when the source is empty or only feeds in zero-length buffers.

# License

MIT
