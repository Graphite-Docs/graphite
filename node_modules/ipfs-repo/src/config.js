'use strict'

const Key = require('interface-datastore').Key
const queue = require('async/queue')
const waterfall = require('async/waterfall')
const _get = require('lodash.get')
const _set = require('lodash.set')
const _has = require('lodash.has')
const Buffer = require('safe-buffer').Buffer

const configKey = new Key('config')

module.exports = (store) => {
  const setQueue = queue(_doSet, 1)

  const configStore = {
    /**
     * Get the current configuration from the repo.
     *
     * @param {String} key - the config key to get
     * @param {function(Error, Object)} callback
     * @returns {void}
     */
    get (key, callback) {
      if (typeof key === 'function') {
        callback = key
        key = undefined
      }
      if (!key) {
        key = undefined
      }
      store.get(configKey, (err, encodedValue) => {
        if (err) { return callback(err) }

        let config
        try {
          config = JSON.parse(encodedValue.toString())
        } catch (err) {
          return callback(err)
        }
        if (key !== undefined && !_has(config, key)) {
          return callback(new Error('Key ' + key + ' does not exist in config'))
        }
        const value = key !== undefined ? _get(config, key) : config
        callback(null, value)
      })
    },
    /**
     * Set the current configuration for this repo.
     *
     * @param {String} key - the config key to be written
     * @param {Object} value - the config value to be written
     * @param {function(Error)} callback
     * @returns {void}
     */
    set (key, value, callback) {
      if (typeof value === 'function') {
        callback = value
        value = key
        key = undefined
      } else if (!key || typeof key !== 'string') {
        return callback(new Error('Invalid key type'))
      }

      if (value === undefined || Buffer.isBuffer(value)) {
        return callback(new Error('Invalid value type'))
      }

      setQueue.push({
        key: key,
        value: value
      }, callback)
    },

    /**
     * Check if a config file exists.
     *
     * @param {function(Error, bool)} callback
     * @returns {void}
     */
    exists (callback) {
      store.has(configKey, callback)
    }
  }

  return configStore

  function _doSet (m, callback) {
    const key = m.key
    const value = m.value
    if (key) {
      waterfall(
        [
          (cb) => configStore.get(cb),
          (config, cb) => cb(null, _set(config, key, value)),
          _saveAll
        ],
        callback)
    } else {
      _saveAll(value, callback)
    }
  }

  function _saveAll (config, callback) {
    const buf = Buffer.from(JSON.stringify(config, null, 2))
    store.put(configKey, buf, callback)
  }
}
