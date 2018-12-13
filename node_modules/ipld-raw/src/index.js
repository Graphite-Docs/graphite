'use strict'
const CID = require('cids')
const multihash = require('multihashing-async')

// binary resolver
module.exports = {
  resolver: {
    multicodec: 'raw',
    defaultHashAlg: 'sha2-256',
    resolve: (binaryBlob, path, callback) => {
      callback(null, {
        value: binaryBlob,
        remainderPath: ''
      })
    },
    tree: (binaryBlob, options, callback) => {
      if (typeof options === 'function') {
        callback = options
      }
      callback(null, [])
    }
  },
  util: {
    deserialize: (data, cb) => {
      cb(null, data)
    },
    serialize: (data, cb) => {
      cb(null, data)
    },
    cid: (data, options, cb) => {
      if (typeof options === 'function') {
        cb = options
        options = {}
      }
      options = options || {}
      const hashAlg = options.hashAlg || 'sha2-256'
      const version = typeof options.version === 'undefined' ? 1 : options.version
      multihash(data, hashAlg, (err, mh) => {
        if (err) return cb(err)
        cb(null, new CID(version, 'raw', mh))
      })
    }
  }
}
