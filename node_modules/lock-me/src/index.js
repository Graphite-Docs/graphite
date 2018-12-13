'use strict'

const path = require('path')
const series = require('async/series')
const once = require('once')
const fs = require('fs')
const portableLock = require('./portable')

let unixLock
if (process.platform !== 'win32') {
  try {
    unixLock = require('./unix')
  } catch (err) {}
}

module.exports = function Lock (isPortable) {
  const locked = {}
  let lockFn

  if (isPortable || !unixLock) {
    lockFn = portableLock
    isPortable = true
  } else {
    lockFn = unixLock
    isPortable = false
  }

  function createCloser (unlocker) {
    return once((cb) => {
      locked[unlocker.abs] = null

      if (isPortable) {
        return series([
          (cb) => fs.close(unlocker.fd, cb),
          (cb) => fs.unlink(unlocker.abs, cb)
        ], cb)
      }

      series([
        (cb) => fs.unlink(unlocker.abs, cb),
        (cb) => fs.close(unlocker.fd, cb)
      ], cb)
    })
  }

  return function lock (name, callback) {
    const abs = path.resolve(name)

    if (locked[abs]) {
      return callback(new Error(`file ${abs} is already locked`))
    }

    lockFn(abs, (err, unlocker) => {
      if (err) {
        return callback(err)
      }

      locked[abs] = true

      callback(null, {
        portable: isPortable,
        abs: abs,
        close: createCloser(unlocker)
      })
    })
  }
}
