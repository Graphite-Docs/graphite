'use strict'

const Bucket = require('./bucket')

module.exports = function createHAMT (options) {
  return new Bucket(options)
}

module.exports.isBucket = Bucket.isBucket
