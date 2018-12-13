'use strict'
const cidFromHash = require('./cidFromHash')

module.exports = cidFromEthObj

function cidFromEthObj (multicodec, ethObj, options) {
  const hashBuffer = ethObj.hash()
  const cid = cidFromHash(multicodec, hashBuffer, options)
  return cid
}
