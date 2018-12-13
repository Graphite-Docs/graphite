'use strict'

const pull = require('pull-stream')
const cat = require('pull-cat')

// Logic to export a unixfs directory.
module.exports = shardedDirExporter

function shardedDirExporter (cid, node, name, path, pathRest, resolve, size, dag, parent, depth) {
  let dir
  if (!parent || (parent.path !== path)) {
    dir = {
      name: name,
      depth: depth,
      path: path,
      hash: cid,
      size: node.size,
      type: 'dir'
    }
  }

  const streams = [
    pull(
      pull.values(node.links),
      pull.map((link) => {
        // remove the link prefix (2 chars for the bucket index)
        const p = link.name.substring(2)
        const pp = p ? path + '/' + p : path
        let accept = true

        if (p && pathRest.length) {
          accept = (p === pathRest[0])
        }
        if (accept) {
          return {
            depth: depth + 1,
            name: p,
            path: pp,
            multihash: link.multihash,
            pathRest: p ? pathRest.slice(1) : pathRest,
            parent: dir || parent
          }
        } else {
          return ''
        }
      }),
      pull.filter(Boolean),
      resolve
    )
  ]

  if (!pathRest.length) {
    streams.unshift(pull.values([dir]))
  }

  return cat(streams)
}
