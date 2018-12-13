'use strict'

const multihashing = require('multihashing-async')
const sort = require('stable')
const dagPBUtil = require('../util.js')
const serialize = dagPBUtil.serialize
const dagNodeUtil = require('./util.js')
const linkSort = dagNodeUtil.linkSort
const DAGNode = require('./index.js')
const DAGLink = require('../dag-link')

function create (data, dagLinks, hashAlg, callback) {
  if (typeof data === 'function') {
    callback = data
    data = undefined
  } else if (typeof data === 'string') {
    data = Buffer.from(data)
  }
  if (typeof dagLinks === 'function') {
    callback = dagLinks
    dagLinks = []
  }
  if (typeof hashAlg === 'function') {
    callback = hashAlg
    hashAlg = undefined
  }

  if (!Buffer.isBuffer(data)) {
    return callback(new Error('Passed \'data\' is not a buffer or a string!'))
  }

  if (!hashAlg) {
    hashAlg = 'sha2-256'
  }

  const links = dagLinks.map((link) => {
    return DAGLink.isDAGLink(link) ? link : DAGLink.util.createDagLinkFromB58EncodedHash(link)
  })
  const sortedLinks = sort(links, linkSort)

  serialize({
    data: data,
    links: sortedLinks
  }, (err, serialized) => {
    if (err) {
      return callback(err)
    }
    multihashing(serialized, hashAlg, (err, multihash) => {
      if (err) {
        return callback(err)
      }
      const dagNode = new DAGNode(data, sortedLinks, serialized, multihash)
      callback(null, dagNode)
    })
  })
}

module.exports = create
