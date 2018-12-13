'use strict'

const fs = require('fs-ext')
const c = require('constants') // eslint-disable-line
const waterfall = require('async/waterfall')

module.exports = function unixLock (name, callback) {
  waterfall([
    (cb) => fs.stat(name, (err, stats) => {
      if (!err && stats.size > 0) {
        return cb(new Error(`can't lock file ${name}: has non-zero size`))
      }

      cb()
    }),
    (cb) => fs.open(name, 'w', cb),
    (fd, cb) => fs.fcntl(fd, 'setlk', c.F_WRLCK, (err, res) => {
      if (err) {
        return fs.close(fd, () => {
          cb(new Error(`Lock FcntlFlock of ${name} failed: ${err.message}`))
        })
      }

      cb(null, fd)
    })
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
