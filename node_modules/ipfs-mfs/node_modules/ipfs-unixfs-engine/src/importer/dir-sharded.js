'use strict'

const leftPad = require('left-pad')
const whilst = require('async/whilst')
const waterfall = require('async/waterfall')
const CID = require('cids')
const dagPB = require('ipld-dag-pb')
const UnixFS = require('ipfs-unixfs')
const DAGLink = dagPB.DAGLink
const DAGNode = dagPB.DAGNode
const multihashing = require('multihashing-async')
const Dir = require('./dir')

const Bucket = require('../hamt')

const hashFn = function (value, callback) {
  multihashing(value, 'murmur3-128', (err, hash) => {
    if (err) {
      callback(err)
    } else {
      // Multihashing inserts preamble of 2 bytes. Remove it.
      // Also, murmur3 outputs 128 bit but, accidently, IPFS Go's
      // implementation only uses the first 64, so we must do the same
      // for parity..
      const justHash = hash.slice(2, 10)
      const length = justHash.length
      const result = Buffer.alloc(length)
      // TODO: invert buffer because that's how Go impl does it
      for (let i = 0; i < length; i++) {
        result[length - i - 1] = justHash[i]
      }
      callback(null, result)
    }
  })
}
hashFn.code = 0x22 // TODO: get this from multihashing-async?

const defaultOptions = {
  hashFn: hashFn
}

class DirSharded extends Dir {
  constructor (props, _options) {
    const options = Object.assign({}, defaultOptions, _options)
    super(props, options)
    this._bucket = Bucket(options)
  }

  put (name, value, callback) {
    this._bucket.put(name, value, callback)
  }

  get (name, callback) {
    this._bucket.get(name, callback)
  }

  childCount () {
    return this._bucket.leafCount()
  }

  directChildrenCount () {
    return this._bucket.childrenCount()
  }

  onlyChild (callback) {
    this._bucket.onlyChild(callback)
  }

  eachChildSeries (iterator, callback) {
    this._bucket.eachLeafSeries(iterator, callback)
  }

  flush (path, ipld, source, callback) {
    flush(this._options, this._bucket, path, ipld, source, (err, node) => {
      if (err) {
        callback(err)
      } else {
        this.multihash = node.multihash
        this.size = node.size
      }
      callback(null, node)
    })
  }
}

module.exports = createDirSharded

function createDirSharded (props, _options) {
  return new DirSharded(props, _options)
}

function flush (options, bucket, path, ipld, source, callback) {
  const children = bucket._children // TODO: intromission
  let index = 0
  const links = []
  whilst(
    () => index < children.length,
    (callback) => {
      const child = children.get(index)
      if (child) {
        collectChild(child, index, (err) => {
          index++
          callback(err)
        })
      } else {
        index++
        callback()
      }
    },
    (err) => {
      if (err) {
        callback(err)
        return // early
      }
      haveLinks(links)
    }
  )

  function collectChild (child, index, callback) {
    const labelPrefix = leftPad(index.toString(16).toUpperCase(), 2, '0')
    if (Bucket.isBucket(child)) {
      flush(options, child, path, ipld, null, (err, node) => {
        if (err) {
          callback(err)
          return // early
        }
        links.push(new DAGLink(labelPrefix, node.size, node.multihash))
        callback()
      })
    } else {
      const value = child.value
      const label = labelPrefix + child.key
      links.push(new DAGLink(label, value.size, value.multihash))
      callback()
    }
  }

  function haveLinks (links) {
    // go-ipfs uses little endian, that's why we have to
    // reverse the bit field before storing it
    const data = Buffer.from(children.bitField().reverse())
    const dir = new UnixFS('hamt-sharded-directory', data)
    dir.fanout = bucket.tableSize()
    dir.hashType = options.hashFn.code
    waterfall(
      [
        (callback) => DAGNode.create(dir.marshal(), links, options.hashAlg, callback),
        (node, callback) => {
          if (options.onlyHash) return callback(null, node)

          let cid = new CID(node.multihash)

          if (options.cidVersion === 1) {
            cid = cid.toV1()
          }

          ipld.put(node, { cid }, (err) => callback(err, node))
        },
        (node, callback) => {
          const pushable = {
            path: path,
            multihash: node.multihash,
            size: node.size
          }
          if (source) {
            source.push(pushable)
          }
          callback(null, node)
        }
      ],
      callback)
  }
}
