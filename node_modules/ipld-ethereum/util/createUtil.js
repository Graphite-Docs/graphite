const cidFromEthObj = require('./cidFromEthObj')
const asyncify = require('async/asyncify')

module.exports = createUtil

function createUtil (multicodec, EthObjClass) {
  return {
    deserialize: asyncify((serialized) => new EthObjClass(serialized)),
    serialize: asyncify((ethObj) => ethObj.serialize()),
    cid: asyncify((ethObj, options) => cidFromEthObj(multicodec, ethObj, options))
  }
}
