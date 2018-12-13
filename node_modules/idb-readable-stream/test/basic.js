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

'use strict';

var stream = require('stream')

var Writable = stream.Writable

var idb;

function setup(test, idbTools) {
  // create some stores
  var opts = {
    stores: {
      adb: {}
    },
    data: {
      adb: {
        akey: 'aval',
        bkey: 'bval',
        ckey: 'cval'
      }
    }
  };

  test('recreate db', function(t) {
    idbTools.recreateDb('idbreader', opts, function(err, db) {
      t.error(err);
      idb = db;
      t.end();
    });
  });
}

function all(test, idbTools, idbReadableStream) {
  test('should not reopen a cursor when snapshot = true', function(t) {
    var reader = idbReadableStream(idb, 'adb', { snapshot: true, highWaterMark: 1 })

    // use a slow reader
    var i = 0
    reader.pipe(new Writable({
      objectMode: true,
      highWaterMark: 1,
      write: function(item, enc, cb) {
        switch (++i) {
        case 1:
          t.equal(item.key, 'akey', 'key a')
          t.equal(item.value, 'aval', 'value a')
          break;
        case 2:
          t.equal(item.key, 'bkey', 'key b')
          t.equal(item.value, 'bval', 'value b')
          break;
        case 3:
          t.equal(item.key, 'ckey', 'key c')
          t.equal(item.value, 'cval', 'value c')
          break;
        default:
          throw new Error('unexpected')
        }
        setTimeout(cb, 10);
      }
    })).on('finish', () => {
      t.equal(i, 3)
      t.equal(reader._cursorsOpened, 1);
      t.end()
    })
  })

  test('should reopen a cursor when snapshot = false and a slow reader is used', function(t) {
    var reader = idbReadableStream(idb, 'adb', { snapshot: false, highWaterMark: 1 })

    // use a slow reader
    var i = 0
    reader.pipe(new Writable({
      objectMode: true,
      highWaterMark: 1,
      write: function(item, enc, cb) {
        switch (++i) {
        case 1:
          t.equal(item.key, 'akey', 'key a')
          t.equal(item.value, 'aval', 'value a')
          break;
        case 2:
          t.equal(item.key, 'bkey', 'key b')
          t.equal(item.value, 'bval', 'value b')
          break;
        case 3:
          t.equal(item.key, 'ckey', 'key c')
          t.equal(item.value, 'cval', 'value c')
          break;
        default:
          throw new Error('unexpected')
        }
        setTimeout(cb, 10);
      }
    })).on('finish', () => {
      t.equal(i, 3)
      t.equal(reader._cursorsOpened, 4);
      t.end()
    })
  })
}

function teardown(test, idbTools) {
  test('close and drop idb', function(t) {
    idb.close();
    idbTools.dropDb('idbreader', function(err) {
      t.error(err);
      t.end();
    });
  });
}

function run(test, idbTools, idbReadableStream) {
  setup(test, idbTools);
  all(test, idbTools, idbReadableStream);
  teardown(test, idbTools);
}

module.exports = { run };
