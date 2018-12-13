'use strict'

const debug = require('debug')
const setImmediate = require('async/setImmediate')

const log = debug('repo:lock')

const lockFile = 'repo.lock'

const LOCKS = {}

/**
 * Lock the repo in the given dir.
 *
 * @param {string} dir
 * @param {function(Error, lock)} callback
 * @returns {void}
 */
exports.lock = (dir, callback) => {
  const file = dir + '/' + lockFile
  log('locking %s', file)
  LOCKS[file] = true
  const closer = {
    close (cb) {
      if (LOCKS[file]) {
        delete LOCKS[file]
      }
      setImmediate(cb)
    }
  }
  setImmediate(() => {
    callback(null, closer)
  })
}

/**
 * Check if the repo in the given directory is locked.
 *
 * @param {string} dir
 * @param {function(Error, bool)} callback
 * @returns {void}
 */
exports.locked = (dir, callback) => {
  const file = dir + '/' + lockFile
  log('checking lock: %s')

  const locked = LOCKS[file]
  setImmediate(() => {
    callback(null, locked)
  })
}
