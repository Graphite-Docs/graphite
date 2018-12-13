'use strict'

module.exports = Receptacle
var toMS = require('ms')
var cache = Receptacle.prototype
var counter = new Date() % 1e9

function getUID () { return (Math.random() * 1e9 >>> 0) + (counter++) }

/**
 * Creates a cache with a maximum key size.
 *
 * @constructor
 * @param {Object} options
 * @param {Number} [options.max=Infinity] the maximum number of keys allowed in the cache (lru).
 * @param {Array} [options.items=[]] the default items in the cache.
 */
function Receptacle (options) {
  options = options || {}
  this.id = options.id || getUID()
  this.max = options.max || Infinity
  this.items = options.items || []
  this._lookup = {}
  this.size = this.items.length
  this.lastModified = new Date(options.lastModified || new Date())

  // Setup initial timers and indexes for the cache.
  for (var item, ttl, i = this.items.length; i--;) {
    item = this.items[i]
    ttl = new Date(item.expires) - new Date()
    this._lookup[item.key] = item
    if (ttl > 0) this.expire(item.key, ttl)
    else if (ttl <= 0) this.delete(item.key)
  }
}

/**
 * Tests if a key is currently in the cache.
 * Does not check if slot is empty.
 *
 * @param {String} key - the key to retrieve from the cache.
 * @return {Boolean}
 */
cache.has = function (key) {
  return key in this._lookup
}

/**
 * Retrieves a key from the cache and marks it as recently used.
 *
 * @param {String} key - the key to retrieve from the cache.
 * @return {*}
 */
cache.get = function (key) {
  if (!this.has(key)) return null
  var record = this._lookup[key]
  // Update expiry for "refresh" keys
  if (record.refresh) this.expire(key, record.refresh)
  // Move to front of the line.
  this.items.splice(this.items.indexOf(record), 1)
  this.items.push(record)
  return record.value
}

/**
 * Retrieves user meta data for a cached item.
 *
 * @param {String} key - the key to retrieve meta data from the cache.
 * @return {*}
 */
cache.meta = function (key) {
  if (!this.has(key)) return null
  var record = this._lookup[key]
  if (!('meta' in record)) return null
  return record.meta
}

/**
 * Puts a key into the cache with an optional expiry time.
 *
 * @param {String} key - the key for the value in the cache.
 * @param {*} value - the value to place at the key.
 * @param {Number} [options.ttl] - a time after which the key will be removed.
 * @return {Receptacle}
 */
cache.set = function (key, value, options) {
  var oldRecord = this._lookup[key]
  var record = this._lookup[key] = { key: key, value: value }
  // Mark cache as modified.
  this.lastModified = new Date()

  if (oldRecord) {
    // Replace an old key.
    clearTimeout(oldRecord.timeout)
    this.items.splice(this.items.indexOf(oldRecord), 1, record)
  } else {
    // Remove least used item if needed.
    if (this.size >= this.max) this.delete(this.items[0].key)
    // Add a new key.
    this.items.push(record)
    this.size++
  }

  if (options) {
    // Setup key expiry.
    if ('ttl' in options) this.expire(key, options.ttl)
    // Store user options in the record.
    if ('meta' in options) record.meta = options.meta
    // Mark a auto refresh key.
    if (options.refresh) record.refresh = options.ttl
  }

  return this
}

/**
 * Deletes an item from the cache.
 *
 * @param {String} key - the key to remove.
 * @return {Receptacle}
 */
cache.delete = function (key) {
  var record = this._lookup[key]
  if (!record) return false
  this.lastModified = new Date()
  this.items.splice(this.items.indexOf(record), 1)
  clearTimeout(record.timeout)
  delete this._lookup[key]
  this.size--
  return this
}

/**
 * Utility to register a key that will be removed after some time.
 *
 * @param {String} key - the key to remove.
 * @param {Number} [ms] - the timeout before removal.
 * @return {Receptacle}
 */
cache.expire = function (key, ttl) {
  var ms = ttl || 0
  var record = this._lookup[key]
  if (!record) return this
  if (typeof ms === 'string') ms = toMS(ttl)
  if (typeof ms !== 'number') throw new TypeError('Expiration time must be a string or number.')
  clearTimeout(record.timeout)
  record.timeout = setTimeout(this.delete.bind(this, record.key), ms)
  record.expires = Number(new Date()) + ms
  return this
}

/**
 * Deletes all items from the cache.
 * @return {Receptacle}
 */
cache.clear = function () {
  for (var i = this.items.length; i--;) this.delete(this.items[i].key)
  return this
}

/**
 * Fixes serialization issues in polyfilled environments.
 * Ensures non-cyclical serialized object.
 */
cache.toJSON = function () {
  var items = new Array(this.items.length)
  var item
  for (var i = items.length; i--;) {
    item = this.items[i]
    items[i] = {
      key: item.key,
      meta: item.meta,
      value: item.value,
      expires: item.expires,
      refresh: item.refresh
    }
  }

  return {
    id: this.id,
    max: isFinite(this.max) ? this.max : undefined,
    lastModified: this.lastModified,
    items: items
  }
}
