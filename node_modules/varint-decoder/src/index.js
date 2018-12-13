'use strict'

const varint = require('varint')

module.exports = (buf) => {
  if (!Buffer.isBuffer(buf)) {
    throw new Error('arg needs to be a buffer')
  }

  let result = []

  while (buf.length > 0) {
    const num = varint.decode(buf)
    result.push(num)
    buf = buf.slice(varint.decode.bytes)
  }

  return result
}
