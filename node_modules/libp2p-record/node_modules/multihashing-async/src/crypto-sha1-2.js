'use strict'

const crypto = require('crypto')
const toCallback = require('./utils').toCallback

const sha1 = toCallback(
  (buf) => crypto.createHash('sha1').update(buf).digest()
)

const sha2256 = toCallback(
  (buf) => crypto.createHash('sha256').update(buf).digest()
)

const sha2512 = toCallback(
  (buf) => crypto.createHash('sha512').update(buf).digest()
)

module.exports = {
  sha1: sha1,
  sha2256: sha2256,
  sha2512: sha2512
}
