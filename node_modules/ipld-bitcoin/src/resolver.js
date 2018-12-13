'use strict'

const util = require('./util')

/**
 * @callback ResolveCallback
 * @param {?Error} error - Error if path can't be resolved
 * @param {Object} result - Result of the path it it was resolved successfully
 * @param {*} result.value - Value the path resolves to
 * @param {string} result.remainderPath - If the path resolves half-way to a
 *   link, then the `remainderPath` is the part after the link that can be used
 *   for further resolving.
 */
/**
 * Resolves a path in a Bitcoin block.
 *
 * Returns the value or a link and the partial mising path. This way the
 * IPLD Resolver can fetch the link and continue to resolve.
 *
 * @param {Buffer} binaryBlob - Binary representation of a Bitcoin block
 * @param {string} [path='/'] - Path that should be resolved
 * @param {ResolveCallback} callback - Callback that handles the return value
 * @returns {void}
 */
const resolve = (binaryBlob, path, callback) => {
  if (typeof path === 'function') {
    callback = path
    path = undefined
  }

  util.deserialize(binaryBlob, (err, dagNode) => {
    if (err) {
      return callback(err)
    }

    // Return the deserialized block if no path is given
    if (!path) {
      return callback(null, {
        value: dagNode,
        remainderPath: ''
      })
    }

    const pathArray = path.split('/')
    const value = resolveField(dagNode, pathArray[0])
    if (value === null) {
      return callback(new Error('No such path'), null)
    }

    let remainderPath = pathArray.slice(1).join('/')
    // It is a link, hence it may have a remainder
    if (value['/'] !== undefined) {
      return callback(null, {
        value: value,
        remainderPath: remainderPath
      })
    } else {
      if (remainderPath.length > 0) {
        return callback(new Error('No such path'), null)
      } else {
        return callback(null, {
          value: value,
          remainderPath: ''
        })
      }
    }
  })
}

/**
 * @callback TreeCallback
 * @param {?Error} error - Error if paths can't be retreived
 * @param {string[] | Object.<string, *>[]} result - The result depends on
 *   `options.values`, whether it returns only the paths, or the paths with
 *   the corresponding values
 */
/**
 * Return all available paths of a block.
 *
 * @param {Buffer} binaryBlob - Binary representation of a Bitcoin block
 * @param {Object} [options] - Possible options
 * @param {boolean} [options.values=false] - Retun only the paths by default.
 *   If it is `true` also return the values
 * @param {TreeCallback} callback - Callback that handles the return value
 * @returns {void}
 */
const tree = (binaryBlob, options, callback) => {
  if (typeof options === 'function') {
    callback = options
    options = undefined
  }
  options = options || {}

  util.deserialize(binaryBlob, (err, dagNode) => {
    if (err) {
      return callback(err)
    }

    const paths = ['version', 'timestamp', 'difficulty', 'nonce',
      'parent', 'tx']

    if (options.values === true) {
      const pathValues = {}
      for (let path of paths) {
        pathValues[path] = resolveField(dagNode, path)
      }
      return callback(null, pathValues)
    } else {
      return callback(null, paths)
    }
  })
}

// Return top-level fields. Returns `null` if field doesn't exist
const resolveField = (dagNode, field) => {
  switch (field) {
    case 'version':
      return dagNode.version
    case 'timestamp':
      return dagNode.timestamp
    case 'difficulty':
      return dagNode.bits
    case 'nonce':
      return dagNode.nonce
    case 'parent':
      return {'/': util.hashToCid(dagNode.prevHash)}
    case 'tx':
      return {'/': util.hashToCid(dagNode.merkleRoot)}
    default:
      return null
  }
}

module.exports = {
  multicodec: 'bitcoin-block',
  defaultHashAlg: 'dbl-sha2-256',
  resolve: resolve,
  tree: tree
}
