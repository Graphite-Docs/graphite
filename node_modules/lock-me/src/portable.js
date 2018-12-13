'use strict'

const waterfall = require('async/waterfall')
const fs = require('fs')
const nodeify = require('nodeify')
const find = require('find-process')

const STATUS = {
  INVALID: 0,
  LOCKED: 1,
  UNLOCKED: 2,
  STALE: 3
}

module.exports = function lockPortable (name, callback) {
  waterfall([
    (cb) => fs.stat(name, (err, stats) => {
      if (!err && stats.size > 0) {
        return processLockfile(name, cb)
      }
      cb()
    }),
    (cb) => fs.open(name, 'w+', (err, fd) => cb(err, fd)),
    (fd, cb) => {
      fs.write(fd, JSON.stringify({
        ownerPID: process.pid
      }), (err) => {
        if (err) {
          return cb(new Error(`failed to create lock file ${name}, ${err.message}`))
        }

        cb(null, fd)
      })
    }
  ], (err, fd) => {
    if (err) {
      return callback(err)
    }

    callback(null, {
      abs: name,
      fd: fd
    })
  })
}

function processLockfile (name, callback) {
  getStatus(name, (err, status) => {
    if (err) {
      return callback(err)
    }

    switch (status) {
      case STATUS.LOCKED:
        return callback(new Error(`file ${name} already locked`))
      case STATUS.STALE:
        return fs.unlink(name, (err) => {
          callback(err)
        })
      case STATUS.INVALID:
        return callback(new Error(`can't lock file ${name}: has invalid content`))
      default:
        callback(new Error(`unkown status: ${status}`))
    }
  })
}

function getStatus (name, callback) {
  waterfall([
    (cb) => fs.readFile(name, cb),
    parseJSON,
    (meta, cb) => {
      if (meta.ownerPID === 0) {
        return cb(null, STATUS.INVALID)
      }

      nodeify(find('pid', meta.ownerPID), (err) => {
        if (err) {
          // e.g. on Windows
          return cb(null, STATUS.STALE)
        }

        // On unix, findProcess always is true, so we have to send
        // it a signal to see if it's alive.
        try {
          process.kill(meta.ownerPID, 0)
        } catch (err) {
          // Process does not exist
          return cb(null, STATUS.STALE)
        }

        cb(null, STATUS.LOCKED)
      })
    }
  ], (err, res) => {
    if (err) {
      return callback(err)
    }

    callback(null, res)
  })
}

function parseJSON (content, cb) {
  try {
    const meta = JSON.parse(content.toString())
    cb(null, meta)
  } catch (err) {
    cb(err)
  }
}
