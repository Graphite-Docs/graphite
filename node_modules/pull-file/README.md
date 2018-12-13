# pull-file

a pull-streaming file reader, build directly on the low level stream functions.
by passing node's fs streams.

[![NPM](https://nodei.co/npm/pull-file.png)](https://nodei.co/npm/pull-file/)

[![Build Status](https://img.shields.io/travis/pull-stream/pull-file.svg?branch=master)](https://travis-ci.org/pull-stream/pull-file)

## Example Usage

```js
var file = require('pull-file');
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
```
## options

this supports all the options that node's [fs.createReadStream](https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_createreadstream_path_options) supports,
and _also_ this supports a `live: true` property which will keep the stream open and wait for appends
when it gets to the end and an explicit `buffer` option where your chunks will be read to.
Note that if your downstream operations are async you may run into concurrency
issues with this option. Use at your own risk!


## License(s)

### MIT

Copyright (c) 2014 Damon Oehlman <damon.oehlman@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
