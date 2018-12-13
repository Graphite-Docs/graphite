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

/**
 * Get an item from store by key.
 *
 * @param {IDBDatabase} db - opened indexedDB
 * @param {String} storeName - name of the object store
 * @param {key} key - key of the object in the store
 * @param {Function} cb - first paramter will be an error or null, second paramter
 *  will be the item.
 */
function get(db, storeName, key, cb) {
  if (db == null || typeof db !== 'object') { throw new TypeError('db must be an object'); }
  if (typeof storeName !== 'string') { throw new TypeError('storeName must be a string'); }
  if (typeof cb !== 'function') { throw new TypeError('cb must be a function'); }

  var tx = db.transaction(storeName);
  var req = tx.objectStore(storeName).get(key);

  tx.onabort = () => cb(tx.error);
  tx.onerror = () => cb(tx.error);
  tx.oncomplete = () => cb(null, req.result);
}

/**
 * Insert an item in store by key and value.
 *
 * @param {IDBDatabase} db - opened indexedDB
 * @param {String} storeName - name of the object store
 * @param {mixed} value - value to store
 * @param {key} [key] - key of the object in the store
 * @param {Function} cb - first paramter will be an error or null, second paramter
 *  will be the item.
 */
function put(db, storeName, value, key, cb) {
  if (typeof key === 'function') {
    cb = key;
    key = null;
  }
  if (db == null || typeof db !== 'object') { throw new TypeError('db must be an object'); }
  if (typeof storeName !== 'string') { throw new TypeError('storeName must be a string'); }
  // value can be anything
  // key is optional
  if (typeof cb !== 'function') { throw new TypeError('cb must be a function'); }

  var tx = db.transaction(storeName);
  var req = tx.objectStore(storeName).put(value, key);

  tx.onabort = () => cb(tx.error);
  tx.onerror = () => cb(tx.error);
  tx.oncomplete = () => cb(null, req.result);
}

/**
 * Delete an item from store by key.
 *
 * @param {IDBDatabase} db - opened indexedDB
 * @param {String} storeName - name of the object store
 * @param {key} key - key of the object in the store
 * @param {mixed} value - value to store
 * @param {Function} cb - first paramter will be an error or null, second paramter
 *  will be the item.
 */
function del(db, storeName, key, cb) {
  if (db == null || typeof db !== 'object') { throw new TypeError('db must be an object'); }
  if (typeof storeName !== 'string') { throw new TypeError('storeName must be a string'); }
  if (typeof cb !== 'function') { throw new TypeError('cb must be a function'); }

  var tx = db.transaction(storeName);
  var req = tx.objectStore(storeName).delete(key);

  tx.onabort = () => cb(tx.error);
  tx.onerror = () => cb(tx.error);
  tx.oncomplete = () => cb(null, req.result);
}

function dropDb(name, cb) {
  if (typeof name !== 'string') { throw new TypeError('name must be a string'); }
  if (typeof cb !== 'function') { throw new TypeError('cb must be a function'); }

  var req = indexedDB.deleteDatabase(name);

  req.onsuccess = () => cb();
  req.onerror = () => cb(req.error);
}

// opts.stores => { storeName: storeCreationOpts } }
// opts.data => { storeName: []|{} } }
// cb(err, db)
function createDb(name, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = opts || {};
  if (typeof name !== 'string') { throw new TypeError('name must be a string'); }
  if (opts == null || typeof opts !== 'object') { throw new TypeError('opts must be an object'); }
  if (typeof cb !== 'function') { throw new TypeError('cb must be a function'); }

  var req = indexedDB.open(name);

  // create stores if any
  var stores = Object.keys(opts.stores || {});
  if (stores.length) {
    req.onupgradeneeded = () => {
      var db = req.result;

      stores.forEach(function(storeName) {
        db.createObjectStore(storeName, opts.stores[storeName]);
      });
    }
  }

  req.onsuccess = () => {
    var db = req.result;

    // load data if any
    var data = Object.keys(opts.data || {});
    if (data.length) {
      var tx = db.transaction(data, 'readwrite');

      data.forEach(function(storeName) {
        var store = tx.objectStore(storeName);
        if (Array.isArray(opts.data[storeName])) {
          opts.data[storeName].forEach(function(obj) {
            store.put(obj);
          });
        } else { // assume this is an object, use the object keys
          Object.keys(opts.data[storeName]).forEach(function(key) {
            var obj = opts.data[storeName][key];
            store.put(obj, key);
          });
        }
      });

      tx.onabort = () => cb(tx.error);
      tx.onerror = () => cb(tx.error);
      tx.oncomplete = () => cb(null, db);
    } else {
      cb(null, db);
    }
  };
  req.onerror = () => cb(req.error);
}

// opts.stores => { storeName: storeCreationOpts } }
// cb(err, db)
function recreateDb(name, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = null;
  }
  if (typeof name !== 'string') { throw new TypeError('name must be a string'); }
  if (typeof cb !== 'function') { throw new TypeError('cb must be a function'); }

  dropDb(name, function(err) {
    if (err) { cb(err); return; }
    createDb(name, opts, cb);
  });
}

module.exports = { dropDb, createDb, recreateDb, get, put, del };
