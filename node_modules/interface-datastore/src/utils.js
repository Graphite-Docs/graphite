'use strict'

const pull = require('pull-stream')
const Source = require('pull-defer/source')
const path = require('path')
const os = require('os')
const uuid = require('uuid/v4')

exports.asyncFilter = function (test) {
  let busy = false
  let abortCb
  let aborted

  return function (read) {
    return function next (abort, cb) {
      if (aborted) return cb(aborted)
      if (abort) {
        aborted = abort
        if (!busy) {
          read(abort, cb)
        } else {
          read(abort, () => {
            // if we are still busy, wait for the test to complete.
            if (busy) abortCb = cb; else cb(abort)
          })
        }
      } else {
        read(null, (end, data) => {
          if (end) cb(end); else if (aborted) cb(aborted); else {
            busy = true
            test(data, (err, valid) => {
              busy = false
              if (aborted) {
                cb(aborted)
                abortCb(aborted)
              } else if (err) {
                next(err, cb)
              } else if (valid) {
                cb(null, data)
              } else {
                next(null, cb)
              }
            })
          }
        })
      }
    }
  }
}

exports.asyncSort = function (sorter) {
  const source = Source()

  const sink = pull.collect((err, ary) => {
    if (err) {
      return source.abort(err)
    }
    sorter(ary, (err, res) => {
      if (err) {
        return source.abort(err)
      }
      source.resolve(pull.values(ary))
    })
  })

  return function (read) {
    sink(read)
    return source
  }
}

exports.replaceStartWith = function (s, r) {
  const matcher = new RegExp('^' + r)
  return s.replace(matcher, '')
}

exports.tmpdir = () => {
  return path.join(os.tmpdir(), uuid())
}
