'use strict'

const CID = require('cids')

module.exports = function codecs () {
  return Object.keys(CID.codecs).map(name => {
    const code = parseInt(CID.codecs[name].toString('hex'), 16)
    return { name, code }
  })
}
