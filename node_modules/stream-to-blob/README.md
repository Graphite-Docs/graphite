# stream-to-blob [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/stream-to-blob/master.svg
[travis-url]: https://travis-ci.org/feross/stream-to-blob
[npm-image]: https://img.shields.io/npm/v/stream-to-blob.svg
[npm-url]: https://npmjs.org/package/stream-to-blob
[downloads-image]: https://img.shields.io/npm/dm/stream-to-blob.svg
[downloads-url]: https://npmjs.org/package/stream-to-blob
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com
#### Convert a Readable Stream to a Blob

[![Sauce Test Status](https://saucelabs.com/browser-matrix/stream-to-blob.svg)](https://saucelabs.com/u/stream-to-blob)

This package converts a Readable Stream into a Blob.

This package is used by [WebTorrent](https://webtorrent.io).

## install

```
npm install stream-to-blob
```

## usage

```js
var toBlob = require('stream-to-blob')

toBlob(fs.createReadStream('file.txt'), function (err, blob) {
  if (err) return console.error(err.message)
  console.log(blob)
})
```

## api

### toBlob(stream, [mimeType], callback)

Convert the Readable `stream` into a W3C `Blob`, optionally, with the given
`mimeType`. The `callback` will be called with two arguments:

- An `Error` object, or `null`
- A `Blob` object

## license

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).
