'use strict'
const waterfall = require('async/waterfall')
const createIsLink = require('../util/createIsLink')
const createUtil = require('../util/createUtil')

module.exports = createResolver

function createResolver (multicodec, EthObjClass, mapFromEthObject) {
  const util = createUtil(multicodec, EthObjClass)
  const resolver = {
    multicodec: multicodec,
    defaultHashAlg: 'keccak-256',
    resolve: resolve,
    tree: tree,
    isLink: createIsLink(resolve),
    _resolveFromEthObject: resolveFromEthObject,
    _treeFromEthObject: treeFromEthObject,
    _mapFromEthObject: mapFromEthObject
  }

  return {
    resolver: resolver,
    util: util,
  }

  /*
   * tree: returns a flattened array with paths: values of the project. options
   * are option (i.e. nestness)
   */

  function tree (binaryBlob, options, callback) {
    // parse arguments
    if (typeof options === 'function') {
      callback = options
      options = undefined
    }
    if (!options) {
      options = {}
    }

    waterfall([
      (cb) => util.deserialize(binaryBlob, cb),
      (ethObj, cb) => treeFromEthObject(ethObj, options, cb)
    ], callback)
  }

  function treeFromEthObject (ethObj, options, callback) {
    waterfall([
      (cb) => mapFromEthObject(ethObj, options, cb),
      (tuples, cb) => cb(null, tuples.map((tuple) => tuple.path))
    ], callback)
  }

  /*
   * resolve: receives a path and a binary blob and returns the value on path,
   * throw if not possible. `binaryBlob`` is an Ethereum binary block.
   */

  function resolve (binaryBlob, path, callback) {
    waterfall([
      (cb) => util.deserialize(binaryBlob, cb),
      (ethObj, cb) => resolveFromEthObject(ethObj, path, cb)
    ], callback)
  }

  function resolveFromEthObject (ethObj, path, callback) {
    // root
    if (!path || path === '/') {
      const result = { value: ethObj, remainderPath: '' }
      return callback(null, result)
    }

    // check tree results
    mapFromEthObject(ethObj, {}, (err, paths) => {
      if (err) return callback(err)

      // parse path
      const pathParts = path.split('/')
      // find potential matches
      let matches = paths.filter((child) => child.path === path.slice(0, child.path.length))
      // only match whole path chunks
      matches = matches.filter((child) => child.path.split('/').every((part, index) => part === pathParts[index]))
      // take longest match
      const sortedMatches = matches.sort((a, b) => b.path.length - a.path.length)
      const treeResult = sortedMatches[0]

      if (!treeResult) {
        let err = new Error('Path not found ("' + path + '").')
        return callback(err)
      }

      // slice off remaining path (after match and following slash)
      const remainderPath = path.slice(treeResult.path.length + 1)

      const result = {
        value: treeResult.value,
        remainderPath: remainderPath
      }

      return callback(null, result)
    })
  }
}
