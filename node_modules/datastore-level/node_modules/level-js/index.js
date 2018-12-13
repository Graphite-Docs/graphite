module.exports = Level

var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
var util = require('util')
var Iterator = require('./iterator')
var xtend = require('xtend')

function Level(location) {
  if (!(this instanceof Level)) return new Level(location)

  AbstractLevelDOWN.call(this, location)
}

util.inherits(Level, AbstractLevelDOWN)

/**
 * Open a database and optionally create if missing.
 *
 * @param {Object} [options]  storeName and other options passed to indexedDB
 *                            open and createObjectStore.
 * @param {Function} callback  First parameter will be an error object or null.
 */
Level.prototype._open = function(options, callback) {
  var self = this

  // assume createIfMissing and errorIfExists are initialized by abstract-leveldown
  this._idbOpts = xtend({
    storeName: this.location,
    keyEncoding: 'none',
    valueEncoding: 'none'
  }, options)

  // support passing an open database
  if (this._idbOpts.idb) {
    onsuccess(this._idbOpts.idb)
  } else {
    var req = indexedDB.open(this.location) // use the databases current version
    req.onerror = onerror
    req.onsuccess = function() {
      onsuccess(req.result)
    }
  }

  function onerror(ev) {
    callback(ev.target.error)
  }

  // if the store does not exist and createIfMissing is true, create the object store
  function onsuccess(db) {
    self._db = db

    var exists = self._db.objectStoreNames.contains(self._idbOpts.storeName)

    if (options.errorIfExists && exists) {
      self._db.close()
      callback(new Error('store already exists'))
      return
    }

    if (!options.createIfMissing && !exists) {
      self._db.close()
      callback(new Error('store does not exist'))
      return
    }

    if (options.createIfMissing && !exists) {
      self._db.close()

      var req2 = indexedDB.open(self.location, self._db.version + 1)

      req2.onerror = function(ev) {
        callback(ev.target.error)
      }

      req2.onupgradeneeded = function() {
        var db = req2.result
        db.createObjectStore(self._idbOpts.storeName, self._idbOpts)
      }

      req2.onsuccess = function() {
        self._db = req2.result
        callback(null, self)
      }

      return
    }

    callback(null, self)
  }
}

Level.prototype._get = function(key, options, callback) {
  options = xtend(this._idbOpts, options)

  var origKey = key

  // support binary keys for any iterable type via array (ArrayBuffers as keys are only supported in IndexedDB Second Edition)
  if (options.keyEncoding === 'binary' && !Array.isArray(key)) key = Array.prototype.slice.call(key)

  var tx = this._db.transaction(this._idbOpts.storeName)
  var req = tx.objectStore(this._idbOpts.storeName).openCursor(IDBKeyRange.only(key))

  tx.onabort = function() {
    callback(tx.error)
  }

  req.onsuccess = function() {
    var cursor = req.result
    if (cursor) {
      var value = cursor.value

      // automatically convert Uint8Array values to Buffer
      if (value instanceof Uint8Array) value = new Buffer(value)
      if (options.valueEncoding === 'binary' && !Buffer.isBuffer(value)) value = new Buffer(value)

      if (options.asBuffer && !Buffer.isBuffer(value)) {
        if (value == null)                     value = new Buffer(0)
        else if (typeof value === 'string')    value = new Buffer(value) // defaults to utf8, should the encoding be utf16? (DOMString)
        else if (typeof value === 'boolean')   value = new Buffer(String(value)) // compatible with leveldb
        else if (typeof value === 'number')    value = new Buffer(String(value)) // compatible with leveldb
        else if (Array.isArray(value))         value = new Buffer(String(value)) // compatible with leveldb
        else if (value instanceof Uint8Array)  value = new Buffer(value)
        else return void callback(new TypeError('can\'t coerce `' + value.constructor.name + '` into a Buffer'))
      }
      return void callback(null, value, origKey)
    } else {
      // 'NotFound' error, consistent with LevelDOWN API
      return void callback(new Error('NotFound'))
    }
  }
}

Level.prototype._del = function(key, options, callback) {
  options = xtend(this._idbOpts, options)

  // support binary keys for any iterable type via array (ArrayBuffers as keys are only supported in IndexedDB Second Edition)
  if (options.keyEncoding === 'binary' && !Array.isArray(key)) key = Array.prototype.slice.call(key)

  var mode = 'readwrite'
  if (options.sync === true) {
    mode = 'readwriteflush' // only supported in Firefox (with "dom.indexedDB.experimental" pref set to true)
  }
  var tx = this._db.transaction(this._idbOpts.storeName, mode)
  var req = tx.objectStore(this._idbOpts.storeName).delete(key)

  tx.onabort = function() {
    callback(tx.error)
  }

  tx.oncomplete = function() {
    callback()
  }
}

Level.prototype._put = function(key, value, options, callback) {
  options = xtend(this._idbOpts, options)

  // support binary keys for any iterable type via array (ArrayBuffers as keys are only supported in IndexedDB Second Edition)
  if (options.keyEncoding === 'binary' && !Array.isArray(key)) key = Array.prototype.slice.call(key)

  var mode = 'readwrite'
  if (options.sync === true) {
    mode = 'readwriteflush' // only supported in Firefox (with "dom.indexedDB.experimental" pref set to true)
  }
  var tx = this._db.transaction(this._idbOpts.storeName, mode)
  var req = tx.objectStore(this._idbOpts.storeName).put(value, key)

  tx.onabort = function() {
    callback(tx.error)
  }

  tx.oncomplete = function() {
    callback()
  }
}

Level.prototype._iterator = function(options) {
  return new Iterator(this, options)
}

// only support sync: true on batch level, not operation level
Level.prototype._batch = function(array, options, callback) {
  if (array.length === 0) return process.nextTick(callback)

  var mode = 'readwrite'
  if (options.sync === true) {
    mode = 'readwriteflush' // only supported in Firefox (with "dom.indexedDB.experimental" pref set to true)
  }
  var tx = this._db.transaction(this._idbOpts.storeName, mode)
  var store = tx.objectStore(this._idbOpts.storeName)

  tx.onabort = function() {
    callback(tx.error)
  }

  tx.oncomplete = function() {
    callback()
  }

  array.forEach(function(currentOp) {
    var opts = xtend(options, currentOp)

    // support binary keys for any iterable type via array (ArrayBuffers as keys are only supported in IndexedDB Second Edition)
    if (opts.keyEncoding === 'binary' && !Array.isArray(currentOp.key)) currentOp.key = Array.prototype.slice.call(currentOp.key)

    if (currentOp.type === 'del') {
      store.delete(currentOp.key)
    } else {
      store.put(currentOp.value, currentOp.key)
    }
  })
}

Level.prototype._close = function (callback) {
  this._db.close()
  process.nextTick(callback)
}

Level.prototype._approximateSize = function (start, end, callback) {
  var err = new Error('Not implemented')
  if (callback)
    return void process.nextTick(function() {
      callback(err)
    })

  throw err
}

/**
 * Destroy the object store and the database if no other object stores exist.
 *
 * @param {String|Object} location  Name of the database or a database instance.
 */
Level.destroy = function(db, callback) {
  var idbOpts
  if (db != null && typeof db === 'object') {
    idbOpts = xtend({
      location: db.location,
      storeName: db.location
    }, db._idbOpts)
  } else if (typeof db === 'string') {
    idbOpts = {
      location: db,
      storeName: db
    }
  } else {
    throw new TypeError('location must be a string or an object')
  }

  if (typeof idbOpts.location !== 'string') throw new TypeError('location must be a string')
  if (typeof idbOpts.storeName !== 'string') throw new TypeError('db.storeName must be a string')

  var req = indexedDB.open(idbOpts.location) // use the databases current version

  req.onerror = function(ev) {
    callback(ev.target.error)
  }

  // if the database contains no other stores, delete the database as well
  req.onsuccess = function() {
    var db = req.result

    function deleteDatabase(name) {
      var req2 = indexedDB.deleteDatabase(name)
      req2.onerror = function(ev) {
        callback(ev.target.error)
      }
      req2.onsuccess = function() {
        callback()
      }
    }

    db.close()

    if (db.objectStoreNames.length === 0) return void deleteDatabase(idbOpts.location)
    if (!db.objectStoreNames.contains(idbOpts.storeName)) return void callback()

    // delete object store, and if no object stores remain, delete database
    var req2 = indexedDB.open(idbOpts.location, db.version + 1)

    req2.onerror = function(ev) {
      callback(ev.target.error)
    }

    req2.onupgradeneeded = function() {
      db = req2.result
      db.deleteObjectStore(idbOpts.storeName)
    }

    req2.onsuccess = function() {
      db = req2.result
      db.close()

      if (db.objectStoreNames.length === 0) deleteDatabase(idbOpts.location)
      else callback()
    }
  }
}
