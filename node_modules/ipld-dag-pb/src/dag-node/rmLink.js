'use strict'

const dagNodeUtil = require('./util')
const cloneLinks = dagNodeUtil.cloneLinks
const cloneData = dagNodeUtil.cloneData
const create = require('./create')

function rmLink (dagNode, nameOrMultihash, callback) {
  const data = cloneData(dagNode)
  let links = cloneLinks(dagNode)

  if (typeof nameOrMultihash === 'string') {
    links = links.filter((link) => link.name !== nameOrMultihash)
  } else if (Buffer.isBuffer(nameOrMultihash)) {
    links = links.filter((link) => !link.multihash.equals(nameOrMultihash))
  } else {
    return callback(new Error('second arg needs to be a name or multihash'), null)
  }

  create(data, links, callback)
}

module.exports = rmLink
