'use strict'

const DAGLink = require('./index.js')

function create (name, size, multihash, callback) {
  const link = new DAGLink(name, size, multihash)
  callback(null, link)
}

module.exports = create
