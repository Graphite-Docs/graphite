'use strict'

const Lock = require('lock-me')
const path = require('path')
const debug = require('debug')
const fs = require('fs')

const log = debug('repo:lock')

const lockFile = 'repo.lock'
const lock = new Lock()

/**
 * Lock the repo in the given dir.
 *
 * @param {string} dir
 * @param {function(Error, lock)} callback
 * @returns {void}
 */
exports.lock = (dir, callback) => {
  const file = path.join(dir, lockFile)
  log('locking %s', file)
  lock(file, callback)
}

/**
 * Check if the repo in the given directory is locked.
 *
 * @param {string} dir
 * @param {function(Error, bool)} callback
 * @returns {void}
 */
exports.locked = (dir, callback) => {
  const file = path.join(dir, lockFile)
  log('checking lock: %s')

  if (!fs.existsSync(file)) {
    log('file does not exist: %s', file)
  }

  lock(file, (err, lck) => {
    if (err) {
      log('already locked: %s', err.message)
      return callback(null, true)
    }

    log('no one has a lock')
    lck.close((err) => {
      if (err) {
        return callback(err)
      }
      callback(null, false)
    })
  })
}
