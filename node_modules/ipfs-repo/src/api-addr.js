'use strict'

const Key = require('interface-datastore').Key
const Buffer = require('safe-buffer').Buffer

const apiFile = new Key('api')

module.exports = (store) => {
  return {
    /**
     * Get the current configuration from the repo.
     *
     * @param {function(Error, Object)} callback
     * @returns {void}
     */
    get (callback) {
      store.get(apiFile, (err, value) => callback(err, value && value.toString()))
    },
    /**
     * Set the current configuration for this repo.
     *
     * @param {Object} value - the api address to be written
     * @param {function(Error)} callback
     * @returns {void}
     */
    set (value, callback) {
      store.put(apiFile, Buffer.from(value.toString()), callback)
    },
    /**
     * Deletes api file
     *
     * @param {function(Error, bool)} callback
     * @returns {void}
     */
    delete (callback) {
      store.delete(apiFile, callback)
    }
  }
}
