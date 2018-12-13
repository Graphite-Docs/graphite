'use strict'
const each = require('async/each')
const waterfall = require('async/waterfall')
const asyncify = require('async/asyncify')
const rlp = require('rlp')
const EthTrieNode = require('merkle-patricia-tree/trieNode')
const cidFromHash = require('./cidFromHash')
// const createBaseTrieResolver = require('./createBaseTrieResolver.js')
const createResolver = require('./createResolver')
const isExternalLink = require('./isExternalLink')
const createUtil = require('./createUtil')
const createIsLink = require('./createIsLink')
const cidFromEthObj = require('./cidFromEthObj')


module.exports = createTrieResolver

function createTrieResolver(multicodec, leafResolver){
  const baseTrie = createResolver(multicodec, EthTrieNode, mapFromEthObj)
  baseTrie.util.deserialize = asyncify((serialized) => {
    const rawNode = rlp.decode(serialized)
    const trieNode = new EthTrieNode(rawNode)
    return trieNode
  })

  return baseTrie

  // create map using both baseTrie and leafResolver
  function mapFromEthObj (trieNode, options, callback) {
    // expand from merkle-patricia-tree using leafResolver
    mapFromBaseTrie(trieNode, options, (err, basePaths) => {
      if (err) return callback(err)
      if (!leafResolver) return callback(null, basePaths)
      // expand children
      let paths = basePaths.slice()
      const leafTerminatingPaths = basePaths.filter(child => Buffer.isBuffer(child.value))
      each(leafTerminatingPaths, (child, cb) => {
        return waterfall([
          (cb) => leafResolver.util.deserialize(child.value, cb),
          (ethObj, cb) => leafResolver.resolver._mapFromEthObject(ethObj, options, cb)
        ], (err, grandChildren) => {
          if (err) return cb(err)
          // add prefix to grandchildren
          grandChildren.forEach((grandChild) => {
            paths.push({
              path: child.path + '/' + grandChild.path,
              value: grandChild.value,
            })
          })
          cb()
        })
      }, (err) => {
        if (err) return callback(err)
        callback(null, paths)
      })
    })
  }

  // create map from merkle-patricia-tree nodes
  function mapFromBaseTrie (trieNode, options, callback) {
    let paths = []

    if (trieNode.type === 'leaf') {
      // leaf nodes resolve to their actual value
      paths.push({
        path: nibbleToPath(trieNode.getKey()),
        value: trieNode.getValue()
      })
    }

    each(trieNode.getChildren(), (childData, next) => {
      const key = nibbleToPath(childData[0])
      const value = childData[1]
      if (EthTrieNode.isRawNode(value)) {
        // inline child root
        const childNode = new EthTrieNode(value)
        paths.push({
          path: key,
          value: childNode
        })
        // inline child non-leaf subpaths
        mapFromBaseTrie(childNode, options, (err, subtree) => {
          if (err) return next(err)
          subtree.forEach((path) => {
            path.path = key + '/' + path.path
          })
          paths = paths.concat(subtree)
          next()
        })
      } else {
        // other nodes link by hash
        let link = { '/': cidFromHash(multicodec, value).toBaseEncodedString() }
        paths.push({
          path: key,
          value: link
        })
        next()
      }
    }, (err) => {
      if (err) return callback(err)
      callback(null, paths)
    })
  }
}

function nibbleToPath (data) {
  return data.map((num) => num.toString(16)).join('/')
}
