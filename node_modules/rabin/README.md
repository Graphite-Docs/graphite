# rabin

Node native addon module (C/C++) for [Rabin fingerprinting](https://en.wikipedia.org/wiki/Rabin_fingerprint) data streams.

[![Build Status](https://travis-ci.org/datproject/rabin.svg?branch=master)](https://travis-ci.org/datproject/rabin)
[![Build status](https://ci.appveyor.com/api/projects/status/u00ajj4hu7oy9cwv/branch/master?svg=true)](https://ci.appveyor.com/project/maxogden/rabin/branch/master)

Uses the implementation of Rabin fingerprinting from [LBFS](https://github.com/fd0/lbfs/tree/bdf4f17d23b68536e7805c88e269026c74c32d59/liblbfs).

Rabin fingerprinting is useful for finding the chunks of a file that differ from a previous version. It's one implementation of a technique called "Content-defined chunking", meaning the chunk boundaries are determinstic to the content (as opposed to "fixed-sized chunking").

Theres a JavaScript API and an accompanying command-line tool.

## JavaScript API

### `var createRabin = require('rabin')`

`createRabin` can be used to create multiple fingerprinting streams

### `var rabin = createRabin()`

`rabin` is a duplex stream. You write raw data in, and buffers chunked by rabin fingerprints will be written out.

## JavaScript Example

```js
// require and create an instance
var rabin = require('rabin')()

// pipe some data in
var rs = fs.createReadStream('somefile.dat')
rs.pipe(rabin)

// handle output chunks
rabin.on('data', function (chunk) {
  // chunks are created by taking your input data
  // and splitting on each rabin fingerprint found
})
```

## CLI API

```
$ npm install rabin -g
$ rabin myfile.txt --bits=14 --min=8192 --max=32768 # defaults
{"length":12182,"offset":0,"hash":"5df6245b5897336ebf611d7f10fb90eea2d63c5b9ec9ad76dfb1ac72b8249dcb"}
{"length":13190,"offset":12182,"hash":"67d5aaac9cf7b8432cb3c8071d726dc38f1138957c30719f8b166116a90950a1"}
{"length":11609,"offset":25372,"hash":"976a0e3dc43de3abdf50b984a102c5fb7c2550e3dc5e44e4a8f7d4241276683b"}
{"length":10010,"offset":36981,"hash":"7145d10f93ea03e6c8b4dd5ab148e2c3c08f9c71bf71c7559dffdfcef48112c1"}
{"length":13623,"offset":46991,"hash":"76470d5047f9fb31bd75364d90355fdbf913aaa1df934251f43c894f01381f1b"}
{"length":8197,"offset":60614,"hash":"88abce05bc75f72cdafeabd5125eb46fa8f73eab2d75a29076aeb3f99ef35548"}
{"length":16242,"offset":68811,"hash":"08d60789c1e901d6a8e474aeb5de4746af1648e7f3a4ac7a3dba87d9e73fca56"}
{"length":14947,"offset":85053,"hash":"4224e6f4361fa8bdefb9d8e10ebd046e2869af2c44ea7e84c7efaeedd5423b30"}
average 12500
```

