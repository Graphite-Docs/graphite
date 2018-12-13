'use strict'

const util = require('./util')
const traverse = require('traverse')

exports = module.exports

exports.multicodec = 'git-raw'
exports.defaultHashAlg = 'sha1'

const personInfoPaths = [
  'original',
  'name',
  'email',
  'date'
]

exports.resolve = (binaryBlob, path, callback) => {
  if (typeof path === 'function') {
    callback = path
    path = undefined
  }

  util.deserialize(binaryBlob, (err, node) => {
    if (err) {
      return callback(err)
    }

    if (!path || path === '/') {
      return callback(null, {
        value: node,
        remainderPath: ''
      })
    }

    if (Buffer.isBuffer(node)) { // git blob
      return callback(null, {
        value: node,
        remainderPath: path
      })
    }

    const parts = path.split('/')
    const val = traverse(node).get(parts)

    if (val) {
      return callback(null, {
        value: val,
        remainderPath: ''
      })
    }

    let value
    let len = parts.length

    for (let i = 0; i < len; i++) {
      const partialPath = parts.shift()

      if (Array.isArray(node)) {
        value = node[Number(partialPath)]
      } if (node[partialPath]) {
        value = node[partialPath]
      } else {
        // can't traverse more
        if (!value) {
          return callback(new Error('path not available at root'))
        } else {
          parts.unshift(partialPath)
          return callback(null, {
            value: value,
            remainderPath: parts.join('/')
          })
        }
      }
      node = value
    }
  })
}

exports.tree = (binaryBlob, options, callback) => {
  if (typeof options === 'function') {
    callback = options
    options = undefined
  }

  options = options || {}

  util.deserialize(binaryBlob, (err, node) => {
    if (err) {
      return callback(err)
    }

    if (Buffer.isBuffer(node)) { // git blob
      return callback(null, [])
    }

    let paths = []
    switch (node.gitType) {
      case 'commit':
        paths = [
          'message',
          'tree'
        ]

        paths = paths.concat(personInfoPaths.map((e) => 'author/' + e))
        paths = paths.concat(personInfoPaths.map((e) => 'committer/' + e))
        paths = paths.concat(node.parents.map((_, e) => 'parents/' + e))

        if (node.encoding) {
          paths.push('encoding')
        }
        break
      case 'tag':
        paths = [
          'object',
          'type',
          'tag',
          'message'
        ]

        if (node.tagger) {
          paths = paths.concat(personInfoPaths.map((e) => 'tagger/' + e))
        }

        break
      default: // tree
        Object.keys(node).forEach(dir => {
          paths.push(dir)
          paths.push(dir + '/hash')
          paths.push(dir + '/mode')
        })
    }
    callback(null, paths)
  })
}

exports.isLink = (binaryBlob, path, callback) => {
  exports.resolve(binaryBlob, path, (err, result) => {
    if (err) {
      return callback(err)
    }

    if (result.remainderPath.length > 0) {
      return callback(new Error('path out of scope'))
    }

    if (typeof result.value === 'object' && result.value['/']) {
      callback(null, result.value)
    } else {
      callback(null, false)
    }
  })
}
