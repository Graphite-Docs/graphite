'use strict'

const dagNodeUtil = require('./util')
const cloneLinks = dagNodeUtil.cloneLinks
const cloneData = dagNodeUtil.cloneData
const toDAGLink = dagNodeUtil.toDAGLink
const DAGLink = require('../dag-link')
const DAGNode = require('./index')
const create = require('./create')

function addLink (node, link, callback) {
  const links = cloneLinks(node)
  const data = cloneData(node)

  if (DAGLink.isDAGLink(link)) {
    // It's a DAGLink instance
    // no need to do anything
  } else if (DAGNode.isDAGNode(link)) {
    // It's a DAGNode instance
    // convert to link
    link = toDAGLink(link)
  } else {
    // It's a Object with name, multihash/link and size
    try {
      link = new DAGLink(link.name, link.size, link.multihash || link.hash)
    } catch (err) {
      return callback(err)
    }
  }

  links.push(link)
  create(data, links, callback)
}

module.exports = addLink
