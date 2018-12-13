var util = require('util')
var AbstractIterator  = require('abstract-leveldown').AbstractIterator
var ltgt = require('ltgt')
var idbReadableStream = require('idb-readable-stream')
var stream = require('stream')
var xtend = require('xtend')

var Writable = stream.Writable

module.exports = Iterator

/**
 * Open IndexedDB cursor.
 *
 * @param {Object} db  db instance
 * @param {Object} [options]  options
 *
 * options:
 *   snapshot {Boolean}  Whether to use snapshot mode, that may lead to memory
 *     spikes, or use back pressure, that can't guarantee the same snapshot. This
 *     option is true by default.
 */
function Iterator(db, options) {
  this._db = db._db
  this._idbOpts = db._idbOpts

  AbstractIterator.call(this, db)

  this._options = xtend({
    snapshot: true
  }, this._idbOpts, options)

  this._limit = this._options.limit
  if (this._limit == null || this._limit === -1) {
    this._limit = Infinity
  }
  if (typeof this._limit !== 'number') throw new TypeError('options.limit must be a number')
  if (this._limit === 0) return // skip further processing and wait for first call to _next

  this._count = 0

  this._startCursor(this._options)
}

util.inherits(Iterator, AbstractIterator)

Iterator.prototype._startCursor = function(options) {
  options = xtend(this._options, options)

  var self = this

  var keyRange = null
  var lower = ltgt.lowerBound(options)
  var upper = ltgt.upperBound(options)
  var lowerOpen = ltgt.lowerBoundExclusive(options)
  var upperOpen = ltgt.upperBoundExclusive(options)

  var direction = options.reverse ? 'prev': 'next'

  // support binary keys for any iterable type via array (ArrayBuffers as keys are only supported in IndexedDB Second Edition)
  if (lower)
    if (options.keyEncoding === 'binary' && !Array.isArray(lower)) lower = Array.prototype.slice.call(lower)
  if (upper)
    if (options.keyEncoding === 'binary' && !Array.isArray(upper)) upper = Array.prototype.slice.call(upper)

  if (lower && upper)
    try {
      keyRange = IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen)
    } catch (err) {
      // skip the iterator and return 0 results if IDBKeyRange throws a DataError (if keys overlap)
      this._keyRangeError = true
      return
    }
  else if (lower)
    keyRange = IDBKeyRange.lowerBound(lower, lowerOpen)
  else if (upper)
    keyRange = IDBKeyRange.upperBound(upper, upperOpen)

  this._reader = idbReadableStream(this._db, this._idbOpts.storeName, xtend(options, { range: keyRange, direction: direction }))

  this._reader.on('error', function(err) {
    var cb = self._callback
    self._callback = false

    if (cb)
      cb(err)
    else // else wait for _next
      self._readNext = function(cb) {
        cb(err)
      }
  })

  this._reader.pipe(new Writable({
    objectMode: true,
    write: function(item, enc, cb) {
      if (self._count++ >= self._limit) { // limit reached, finish
        self._reader.pause()
        self._reader.unpipe(this)
        cb()
        this.end()
        return
      }

      var cb2 = self._callback
      self._callback = false

      if (cb2)
        self._processItem(item, function(err, key, value) {
          cb(err) // proceed with next item
          cb2(err, key, value)
        })
      else // else wait for _next
        self._readNext = function(cb2) {
          self._processItem(item, function(err, key, value) {
            cb(err) // proceed with next item
            cb2(err, key, value)
          })
        }

    }
  })).on('finish', function() {
    var cb = self._callback
    self._callback = false

    if (cb)
      cb()
    else // else wait for _next
      self._readNext = function(cb) {
        cb()
      }
  })
}

Iterator.prototype._processItem = function(item, cb) {
  if (typeof cb !== 'function') throw new TypeError('cb must be a function')

  var key = item.key
  var value = item.value

  // automatically convert Uint8Array values to Buffer
  if (value instanceof Uint8Array) value = new Buffer(value)
  if (this._options.keyEncoding === 'binary' && Array.isArray(key)) key = new Buffer(key)
  if (this._options.valueEncoding === 'binary' && !Buffer.isBuffer(value)) value = new Buffer(value)

  if (this._options.keyAsBuffer && !Buffer.isBuffer(key)) {
    if (key == null)                     key = new Buffer(0)
    else if (typeof key === 'string')    key = new Buffer(key) // defaults to utf8, should the encoding be utf16? (DOMString)
    else if (typeof key === 'boolean')   key = new Buffer(String(key)) // compatible with leveldb
    else if (typeof key === 'number')    key = new Buffer(String(key)) // compatible with leveldb
    else if (Array.isArray(key))         key = new Buffer(String(key)) // compatible with leveldb
    else if (key instanceof Uint8Array)  key = new Buffer(key)
    else throw new TypeError('can\'t coerce `' + key.constructor.name + '` into a Buffer')
  }

  if (this._options.valueAsBuffer && !Buffer.isBuffer(value)) {
    if (value == null)                     value = new Buffer(0)
    else if (typeof value === 'string')    value = new Buffer(value) // defaults to utf8, should the encoding be utf16? (DOMString)
    else if (typeof value === 'boolean')   value = new Buffer(String(value)) // compatible with leveldb
    else if (typeof value === 'number')    value = new Buffer(String(value)) // compatible with leveldb
    else if (Array.isArray(value))         value = new Buffer(String(value)) // compatible with leveldb
    else if (value instanceof Uint8Array)  value = new Buffer(value)
    else throw new TypeError('can\'t coerce `' + value.constructor.name + '` into a Buffer')
  }

  cb(null, key, value)
}

// register a callback, only call it directly if a nextHandler is registered
Iterator.prototype._next = function(callback) {
  if (this._callback) throw new Error('callback already exists') // each callback should be invoked exactly once
  if (this._keyRangeError || this._limit === 0) return void callback()

  var readNext = this._readNext
  this._readNext = false

  if (readNext) {
    process.nextTick(function() {
      readNext(callback)
    })
  } else {
    this._callback = callback
  }
}
