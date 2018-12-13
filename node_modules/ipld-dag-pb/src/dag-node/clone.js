'use strict'

const dagNodeUtil = require('./util')
const cloneLinks = dagNodeUtil.cloneLinks
const cloneData = dagNodeUtil.cloneData
const create = require('./create')

function clone (dagNode, callback) {
  const data = cloneData(dagNode)
  const links = cloneLinks(dagNode)
  create(data, links, callback)
}

module.exports = clone
