'use strict'

const errcode = require('err-code')

module.exports.dbOpenFailedError = (err) => {
  err = err || new Error('Cannot open database')
  return errcode(err, 'ERR_DB_OPEN_FAILED')
}

module.exports.dbDeleteFailedError = (err) => {
  err = err || new Error('Delete failed')
  return errcode(err, 'ERR_DB_DELETE_FAILED')
}

module.exports.dbWriteFailedError = (err) => {
  err = err || new Error('Write failed')
  return errcode(err, 'ERR_DB_WRITE_FAILED')
}

module.exports.notFoundError = (err) => {
  err = err || new Error('Not Found')
  return errcode(err, 'ERR_NOT_FOUND')
}
