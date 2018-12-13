'use strict'

const Key = require('interface-datastore').Key
const sortKeys = require('sort-keys')

const specKey = new Key('datastore_spec')

module.exports = (store) => {
  return {
    /**
     * Check if a datastore spec file exists.
     *
     * @param {function(Error, bool)} callback
     * @returns {void}
     */
    exists (callback) {
      store.has(specKey, callback)
    },
    /**
     * Get the current datastore spec.
     *
     * @param {function(Error, number)} callback
     * @returns {void}
     */
    get (callback) {
      store.get(specKey, (err, buf) => {
        if (err) {
          return callback(err)
        }
        callback(null, JSON.parse(buf.toString()))
      })
    },
    /**
     * Set the datastore spec of the repo, writing it to the underlying store.
     *
     * @param {number} spec
     * @param {function(Error)} callback
     * @returns {void}
     */
    set (spec, callback) {
      store.put(specKey, Buffer.from(JSON.stringify(sortKeys(spec, { deep: true }))), callback)
    }
  }
}
