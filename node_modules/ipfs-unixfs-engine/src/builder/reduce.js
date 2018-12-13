'use strict'

const waterfall = require('async/waterfall')
const dagPB = require('ipld-dag-pb')
const UnixFS = require('ipfs-unixfs')
const CID = require('cids')

const DAGLink = dagPB.DAGLink
const DAGNode = dagPB.DAGNode

module.exports = function reduce (file, ipld, options) {
  return function (leaves, callback) {
    if (leaves.length === 1 && leaves[0].single && options.reduceSingleLeafToSelf) {
      const leaf = leaves[0]

      return callback(null, {
        path: file.path,
        multihash: leaf.multihash,
        size: leaf.size,
        leafSize: leaf.leafSize,
        name: leaf.name
      })
    }

    // create a parent node and add all the leaves
    const f = new UnixFS('file')

    const links = leaves.map((leaf) => {
      f.addBlockSize(leaf.leafSize)

      let cid = leaf.cid

      if (!cid) {
        // we are an intermediate node
        cid = new CID(options.cidVersion, 'dag-pb', leaf.multihash)
      }

      return new DAGLink(leaf.name, leaf.size, cid.buffer)
    })

    waterfall([
      (cb) => DAGNode.create(f.marshal(), links, options.hashAlg, cb),
      (node, cb) => {
        const cid = new CID(options.cidVersion, 'dag-pb', node.multihash)

        if (options.onlyHash) {
          return cb(null, {
            node, cid
          })
        }

        ipld.put(node, {
          cid
        }, (error) => cb(error, {
          node, cid
        }))
      }
    ], (error, result) => {
      if (error) {
        return callback(error)
      }

      callback(null, {
        name: '',
        path: file.path,
        multihash: result.cid.buffer,
        size: result.node.size,
        leafSize: f.fileSize()
      })
    })
  }
}
