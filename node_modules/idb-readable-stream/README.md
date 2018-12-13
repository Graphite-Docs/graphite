# idbReadableStream

Iterate over an IndexedDB object store with a readable stream. This module
should be used in the browser with browserify.


## Example

Read each object in the *employees* object store:

```js
const idbReadableStream = require('idb-readable-stream')

// open an IndexedDB instance as usual
const req = indexedDB.open('MyDB')

req.onsuccess = (ev) => {
  const db = ev.target.result

  const reader = idbReadableStream(db, 'employees')
  reader.on('data', item => {
    console.log(item)
  })
  reader.on('end', () => {
    console.log('done')
  })
})
```


## Installation

    $ npm install idb-readable-stream

Use [browserify](https://www.npmjs.com/package/browserify) to require this module in your code.


## API

### idbReadableStream(db, storeName, opts)
* @param {IDBDatabase} db - IndexedDB instance
* @param {String} storeName - name of the object store to iterate over
* @param {Object} [opts]

Options:
* @param {IDBKeyRange} opts.range - a valid IndexedDB key range
* @param {IDBCursorDirection} opts.direction - one of "next", "nextunique",
    "prev", "prevunique"
* @param {Boolean} opts.snapshot=false - Iterate over a snapshot of the database
    by opening only one cursor. This disables any form of back pressure to
    prevent cursor timeout issues.


## License

ISC

Copyright (c) 2016 Tim Kuijsten

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
