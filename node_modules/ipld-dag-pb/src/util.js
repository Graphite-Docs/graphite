'use strict'

const CID = require('cids')
const protons = require('protons')
const proto = protons(require('./dag.proto.js'))
const resolver = require('./resolver')
const DAGLink = require('./dag-link')
const DAGNode = require('./dag-node')
const multihashing = require('multihashing-async')
const waterfall = require('async/waterfall')

exports = module.exports

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
 * @param {number} [options.version] - CID version number. Defaults to zero if hashAlg == 'sha2-256'; otherwise, 1.
 * @param {string} [options.hashAlg] - Defaults to hashAlg for the resolver
 * @param {CidCallback} callback - Callback that handles the return value
 * @returns {void}
 */
function cid (dagNode, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  options = options || {}
  const hashAlg = options.hashAlg || resolver.defaultHashAlg
  let version = options.version
  if (typeof version === 'undefined') {
    version = hashAlg === 'sha2-256' ? 0 : 1
  }
  waterfall([
    (cb) => serialize(dagNode, cb),
    (serialized, cb) => multihashing(serialized, hashAlg, cb),
    (mh, cb) => cb(null, new CID(version, resolver.multicodec, mh))
  ], callback)
}

function serialize (node, callback) {
  let serialized

  // If the node is not an instance of a DAGNode, the link.hash might be a Base58 encoded string; decode it
  if (!DAGNode.isDAGNode(node) && node.links) {
    node.links = node.links.map((link) => {
      return DAGLink.isDAGLink(link) ? link : DAGLink.util.createDagLinkFromB58EncodedHash(link)
    })
  }

  try {
    serialized = proto.PBNode.encode(toProtoBuf(node))
  } catch (err) {
    return callback(err)
  }

  callback(null, serialized)
}

function deserialize (data, callback) {
  const pbn = proto.PBNode.decode(data)

  const links = pbn.Links.map((link) => {
    return new DAGLink(link.Name, link.Tsize, link.Hash)
  })

  const buf = pbn.Data == null ? Buffer.alloc(0) : Buffer.from(pbn.Data)

  DAGNode.create(buf, links, callback)
}

function toProtoBuf (node) {
  const pbn = {}

  if (node.data && node.data.length > 0) {
    pbn.Data = node.data
  } else {
    // NOTE: this has to be null in order to match go-ipfs serialization `null !== new Buffer(0)`
    pbn.Data = null
  }

  if (node.links && node.links.length > 0) {
    pbn.Links = node.links.map((link) => {
      return {
        Hash: link.multihash,
        Name: link.name,
        Tsize: link.size
      }
    })
  } else {
    pbn.Links = null
  }

  return pbn
}

exports.serialize = serialize
exports.deserialize = deserialize
exports.cid = cid
