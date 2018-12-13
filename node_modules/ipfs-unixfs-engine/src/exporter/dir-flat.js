'use strict'

const pull = require('pull-stream')
const cat = require('pull-cat')

// Logic to export a unixfs directory.
module.exports = dirExporter

function dirExporter (cid, node, name, path, pathRest, resolve, size, dag, parent, depth) {
  const accepts = pathRest[0]

  const dir = {
    name: name,
    depth: depth,
    path: path,
    hash: cid,
    size: node.size,
    type: 'dir'
  }

  const streams = [
    pull(
      pull.values(node.links),
      pull.map((link) => ({
        depth: depth + 1,
        size: link.size,
        name: link.name,
        path: path + '/' + link.name,
        multihash: link.multihash,
        linkName: link.name,
        pathRest: pathRest.slice(1),
        type: 'dir'
      })),
      pull.filter((item) => accepts === undefined || item.linkName === accepts),
      resolve
    )
  ]

  // place dir before if not specifying subtree
  if (!pathRest.length) {
    streams.unshift(pull.values([dir]))
  }

  return cat(streams)
}
