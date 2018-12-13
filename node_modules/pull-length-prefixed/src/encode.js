'use strict'

const Buffer = require('safe-buffer').Buffer

module.exports = encode

const poolSize = 10 * 1024

function encode (opts) {
  opts = Object.assign({
    fixed: false
  }, opts || {})

  // Only needed for varint
  const varint = require('varint')
  let pool = opts.fixed ? null : createPool()
  let used = 0

  let ended = false

  return (read) => (end, cb) => {
    if (end) ended = end
    if (ended) return cb(ended)

    read(null, (end, data) => {
      if (end) ended = end
      if (ended) return cb(ended)

      if (!Buffer.isBuffer(data)) {
        ended = new Error('data must be a buffer')
        return cb(ended)
      }

      let encodedLength
      if (opts.fixed) {
        encodedLength = Buffer.alloc(4)
        encodedLength.writeInt32BE(data.length, 0) // writes exactly 4 bytes
      } else {
        varint.encode(data.length, pool, used)
        used += varint.encode.bytes
        encodedLength = pool.slice(used - varint.encode.bytes, used)

        if (pool.length - used < 100) {
          pool = createPool()
          used = 0
        }
      }

      cb(null, Buffer.concat([
        encodedLength,
        data
      ]))
    })
  }
}

function createPool () {
  return Buffer.alloc(poolSize)
}
