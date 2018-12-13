/**
 * Copyright (c) 2016 Tim Kuijsten
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

'use strict'

var stream = require('stream')

var xtend = require('xtend')

/**
 * Iterate over an IndexedDB object store with a readable stream.
 *
 * @param {IDBDatabase} db - IndexedDB instance
 * @param {String} storeName - name of the object store to iterate over
 * @param {Object} [opts]
 *
 * Options:
 * @param {IDBKeyRange} opts.range - a valid IndexedDB key range
 * @param {IDBCursorDirection} opts.direction - one of "next", "nextunique",
 *   "prev", "prevunique"
 * @param {Boolean} opts.snapshot=false - Iterate over a snapshot of the database
 *   by opening only one cursor. This disables any form of back pressure to prevent
 *   cursor timeout issues.
 */
function idbReadableStream(db, storeName, opts) {
  if (typeof db !== 'object') throw new TypeError('db must be an object')
  if (typeof storeName !== 'string') throw new TypeError('storeName must be a string')
  if (opts == null) opts = {}
  if (typeof opts !== 'object') throw new TypeError('opts must be an object')

  // use transform stream for buffering and back pressure
  var transformer = new stream.Transform(xtend(opts, {
    objectMode: true,
    transform: function(obj, enc, cb) {
      cb(null, obj)
    }
  }))

  opts = xtend({
    snapshot: false
  }, opts)

  var lastIteratedKey = null
  transformer._cursorsOpened = 0

  function startCursor() {
    var lower, upper, lowerOpen, upperOpen

    var direction = opts.direction || 'next'
    var range = opts.range || {}

    lower = range.lower
    upper = range.upper
    lowerOpen = !!range.lowerOpen
    upperOpen = !!range.upperOpen

    // if this is not the first iteration, use lastIteratedKey
    if (lastIteratedKey) {
      if (direction === 'next') {
        lowerOpen = true // exclude the last iterated key itself
        lower = lastIteratedKey
      } else {
        upperOpen = true // exclude the last iterated key itself
        upper = lastIteratedKey
      }
    }

    var keyRange
    if (lower && upper)
      keyRange = IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen)
    else if (lower)
      keyRange = IDBKeyRange.lowerBound(lower, lowerOpen)
    else if (upper)
      keyRange = IDBKeyRange.upperBound(upper, upperOpen)

    var tx = db.transaction(storeName, 'readonly')
    var store = tx.objectStore(storeName)

    transformer._cursorsOpened++
    var req = store.openCursor(keyRange, opts.direction)

    function proceed(cursor) {
      try {
        cursor.continue() // throws a TransactionInactiveError if the cursor timed out
      } catch(err) {
        // either reopen a cursor or propagate the error
        if (err.name === 'TransactionInactiveError' && !opts.snapshot)
          startCursor() // IndexedDB timed out the cursor
        else
          transformer.emit('error', err)
      }
    }

    req.onsuccess = function() {
      var cursor = req.result
      if (cursor) {
        lastIteratedKey = cursor.key

        var go = transformer.write({ key: cursor.key, value: cursor.value })
        if (opts.snapshot || go)
          proceed(cursor)
        else
          transformer.once('drain', function() {
            proceed(cursor)
          })
      } else
        transformer.end()
    }

    tx.onabort = function() {
      transformer.emit('error', tx.error)
    }
    tx.onerror = function() {
      transformer.emit('error', tx.error)
    }
  }

  startCursor()

  return transformer
}

module.exports = idbReadableStream
