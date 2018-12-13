'use strict'

const setImmediate = require('async/setImmediate')
const waterfall = require('async/waterfall')
const multihashing = require('multihashing-async')
const CID = require('cids')

const resolver = require('./resolver')
const gitUtil = require('./util/util')

const commit = require('./util/commit')
const tag = require('./util/tag')
const tree = require('./util/tree')

exports = module.exports

exports.serialize = (dagNode, callback) => {
  if (dagNode === null) {
    setImmediate(() => callback(new Error('dagNode passed to serialize was null'), null))
    return
  }

  if (Buffer.isBuffer(dagNode)) {
    if (dagNode.slice(0, 4).toString() === 'blob') {
      setImmediate(() => callback(null, dagNode))
    } else {
      setImmediate(() => callback(new Error('unexpected dagNode passed to serialize'), null))
    }
    return
  }

  switch (dagNode.gitType) {
    case 'commit':
      commit.serialize(dagNode, callback)
      break
    case 'tag':
      tag.serialize(dagNode, callback)
      break
    default:
      // assume tree as a file named 'type' is legal
      tree.serialize(dagNode, callback)
  }
}

exports.deserialize = (data, callback) => {
  let headLen = gitUtil.find(data, 0)
  let head = data.slice(0, headLen).toString()
  let typeLen = head.match(/([^ ]+) (\d+)/)
  if (!typeLen) {
    setImmediate(() => callback(new Error('invalid object header'), null))
    return
  }

  switch (typeLen[1]) {
    case 'blob':
      callback(null, data)
      break
    case 'commit':
      commit.deserialize(data.slice(headLen + 1), callback)
      break
    case 'tag':
      tag.deserialize(data.slice(headLen + 1), callback)
      break
    case 'tree':
      tree.deserialize(data.slice(headLen + 1), callback)
      break
    default:
      setImmediate(() => callback(new Error('unknown object type ' + typeLen[1]), null))
  }
}

/**
 * @callback CidCallback
 * @param {?Error} error - Error if getting the CID failed
 * @param {?CID} cid - CID if call was successful
 */
/**
 * Get the CID of the DAG-Node.
 *
 * @param {Object} dagNode - Internal representation
 * @param {Object} [options] - Options to create the CID
 * @param {number} [options.version=1] - CID version number
 * @param {string} [options.hashAlg='sha1'] - Hashing algorithm
 * @param {CidCallback} callback - Callback that handles the return value
 * @returns {void}
 */
exports.cid = (dagNode, options, callback) => {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  options = options || {}
  const hashAlg = options.hashAlg || resolver.defaultHashAlg
  const version = typeof options.version === 'undefined' ? 1 : options.version
  waterfall([
    (cb) => exports.serialize(dagNode, cb),
    (serialized, cb) => multihashing(serialized, hashAlg, cb),
    (mh, cb) => cb(null, new CID(version, resolver.multicodec, mh))
  ], callback)
}
