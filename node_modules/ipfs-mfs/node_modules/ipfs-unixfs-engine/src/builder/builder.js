'use strict'

const extend = require('deep-extend')
const UnixFS = require('ipfs-unixfs')
const pull = require('pull-stream')
const through = require('pull-through')
const parallel = require('async/parallel')
const waterfall = require('async/waterfall')
const dagPB = require('ipld-dag-pb')
const CID = require('cids')
const multihash = require('multihashing-async')

const reduce = require('./reduce')

const DAGNode = dagPB.DAGNode

const defaultOptions = {
  chunkerOptions: {
    maxChunkSize: 262144,
    avgChunkSize: 262144
  },
  rawLeaves: false,
  hashAlg: 'sha2-256',
  leafType: 'file',
  cidVersion: 0
}

module.exports = function builder (createChunker, ipld, createReducer, _options) {
  const options = extend({}, defaultOptions, _options)
  options.cidVersion = options.cidVersion || options.cidVersion
  options.hashAlg = options.hashAlg || defaultOptions.hashAlg

  if (options.hashAlg !== 'sha2-256') {
    options.cidVersion = 1
  }

  return function (source) {
    return function (items, cb) {
      parallel(items.map((item) => (cb) => {
        if (!item.content) {
          // item is a directory
          return createAndStoreDir(item, (err, node) => {
            if (err) {
              return cb(err)
            }
            if (node) {
              source.push(node)
            }
            cb()
          })
        }

        // item is a file
        createAndStoreFile(item, (err, node) => {
          if (err) {
            return cb(err)
          }
          if (node) {
            source.push(node)
          }
          cb()
        })
      }), cb)
    }
  }

  function createAndStoreDir (item, callback) {
    // 1. create the empty dir dag node
    // 2. write it to the dag store

    const d = new UnixFS('directory')

    waterfall([
      (cb) => DAGNode.create(d.marshal(), [], options.hashAlg, cb),
      (node, cb) => {
        if (options.onlyHash) {
          return cb(null, node)
        }

        const cid = new CID(options.cidVersion, 'dag-pb', node.multihash)

        node = new DAGNode(
          node.data,
          node.links,
          node.serialized,
          cid
        )

        ipld.put(node, {
          cid
        }, (err) => cb(err, node))
      }
    ], (err, node) => {
      if (err) {
        return callback(err)
      }
      callback(null, {
        path: item.path,
        multihash: node.multihash,
        size: node.size
      })
    })
  }

  function createAndStoreFile (file, callback) {
    if (Buffer.isBuffer(file.content)) {
      file.content = pull.values([file.content])
    }

    if (typeof file.content !== 'function') {
      return callback(new Error('invalid content'))
    }

    const reducer = createReducer(reduce(file, ipld, options), options)
    let chunker

    try {
      chunker = createChunker(options.chunkerOptions)
    } catch (error) {
      return callback(error)
    }

    let previous
    let count = 0

    pull(
      file.content,
      chunker,
      pull.map(chunk => {
        if (options.progress && typeof options.progress === 'function') {
          options.progress(chunk.byteLength)
        }
        return Buffer.from(chunk)
      }),
      pull.asyncMap((buffer, callback) => {
        if (options.rawLeaves) {
          return multihash(buffer, options.hashAlg, (error, hash) => {
            if (error) {
              return callback(error)
            }

            return callback(null, {
              multihash: hash,
              size: buffer.length,
              leafSize: buffer.length,
              cid: new CID(1, 'raw', hash),
              data: buffer
            })
          })
        }

        const file = new UnixFS(options.leafType, buffer)

        DAGNode.create(file.marshal(), [], options.hashAlg, (err, node) => {
          if (err) {
            return callback(err)
          }

          callback(null, {
            multihash: node.multihash,
            size: node.size,
            leafSize: file.fileSize(),
            cid: new CID(options.cidVersion, 'dag-pb', node.multihash),
            data: node
          })
        })
      }),
      pull.asyncMap((leaf, callback) => {
        if (options.onlyHash) {
          return callback(null, leaf)
        }

        ipld.put(leaf.data, {
          cid: leaf.cid
        }, (error) => callback(error, leaf))
      }),
      pull.map((leaf) => {
        return {
          path: file.path,
          multihash: leaf.cid.buffer,
          size: leaf.size,
          leafSize: leaf.leafSize,
          name: '',
          cid: leaf.cid
        }
      }),
      through( // mark as single node if only one single node
        function onData (data) {
          count++
          if (previous) {
            this.queue(previous)
          }
          previous = data
        },
        function ended () {
          if (previous) {
            if (count === 1) {
              previous.single = true
            }
            this.queue(previous)
          }
          this.queue(null)
        }
      ),
      reducer,
      pull.collect((err, roots) => {
        if (err) {
          callback(err)
        } else {
          callback(null, roots[0])
        }
      })
    )
  }
}
