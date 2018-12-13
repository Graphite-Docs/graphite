'use strict'

const sha3 = require('js-sha3')
const murmur3 = require('murmurhash3js')

const utils = require('./utils')
const sha = require('./crypto-sha1-2')

const toCallback = utils.toCallback
const toBuf = utils.toBuf
const fromString = utils.fromString
const fromNumberTo32BitBuf = utils.fromNumberTo32BitBuf

const dblSha2256 = (buf, cb) => {
  sha.sha2256(buf, (err, firstHash) => {
    if (err) {
      cb(err)
    }
    sha.sha2256((Buffer.from(firstHash)), cb)
  })
}

module.exports = {
  sha1: sha.sha1,
  sha2256: sha.sha2256,
  sha2512: sha.sha2512,
  sha3512: toCallback(toBuf(sha3.sha3_512)),
  sha3384: toCallback(toBuf(sha3.sha3_384)),
  sha3256: toCallback(toBuf(sha3.sha3_256)),
  sha3224: toCallback(toBuf(sha3.sha3_224)),
  shake128: toCallback(toBuf(sha3.shake_128, 256)),
  shake256: toCallback(toBuf(sha3.shake_256, 512)),
  keccak224: toCallback(toBuf(sha3.keccak_224)),
  keccak256: toCallback(toBuf(sha3.keccak_256)),
  keccak384: toCallback(toBuf(sha3.keccak_384)),
  keccak512: toCallback(toBuf(sha3.keccak_512)),
  murmur3128: toCallback(toBuf(fromString(murmur3.x64.hash128))),
  murmur332: toCallback(fromNumberTo32BitBuf(fromString(murmur3.x86.hash32))),
  addBlake: require('./blake'),
  dblSha2256: dblSha2256
}
