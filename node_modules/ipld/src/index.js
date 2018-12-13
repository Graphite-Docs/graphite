'use strict'

const Block = require('ipfs-block')
const pull = require('pull-stream')
const CID = require('cids')
const doUntil = require('async/doUntil')
const IPFSRepo = require('ipfs-repo')
const BlockService = require('ipfs-block-service')
const joinPath = require('path').join
const osPathSep = require('path').sep
const pullDeferSource = require('pull-defer').source
const pullTraverse = require('pull-traverse')
const map = require('async/map')
const series = require('async/series')
const waterfall = require('async/waterfall')
const MemoryStore = require('interface-datastore').MemoryDatastore
const mergeOptions = require('merge-options')
const ipldDagCbor = require('ipld-dag-cbor')
const ipldDagPb = require('ipld-dag-pb')
const ipldRaw = require('ipld-raw')

function noop () {}

class IPLDResolver {
  constructor (userOptions) {
    const options = mergeOptions(IPLDResolver.defaultOptions, userOptions)

    if (!options.blockService) {
      throw new Error('Missing blockservice')
    }
    this.bs = options.blockService

    // Object with current list of active resolvers
    this.resolvers = {}

    // API entry point
    this.support = {}

    // Adds support for an IPLD format
    this.support.add = (multicodec, resolver, util) => {
      if (this.resolvers[multicodec]) {
        throw new Error('Resolver already exists for codec "' + multicodec + '"')
      }

      this.resolvers[multicodec] = {
        resolver: resolver,
        util: util
      }
    }

    this.support.load = options.loadFormat || ((codec, callback) => {
      callback(new Error(`No resolver found for codec "${codec}"`))
    })

    this.support.rm = (multicodec) => {
      if (this.resolvers[multicodec]) {
        delete this.resolvers[multicodec]
      }
    }

    // Enable all supplied formats
    for (const format of options.formats) {
      const {resolver, util} = format
      const multicodec = resolver.multicodec
      this.support.add(multicodec, resolver, util)
    }
  }

  get (cid, path, options, callback) {
    if (typeof path === 'function') {
      callback = path
      path = undefined
    }

    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    // this removes occurrences of ./, //, ../
    // makes sure that path never starts with ./ or /
    // path.join is OS specific. Need to convert back to POSIX format.
    if (typeof path === 'string') {
      path = joinPath('/', path)
        .substr(1)
        .split(osPathSep)
        .join('/')
    }

    if (path === '' || !path) {
      return this._get(cid, (err, node) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          value: node,
          remainderPath: ''
        })
      })
    }

    let value

    doUntil(
      (cb) => {
        this._getFormat(cid.codec, (err, format) => {
          if (err) return cb(err)

          // get block
          // use local resolver
          // update path value
          this.bs.get(cid, (err, block) => {
            if (err) {
              return cb(err)
            }
            format.resolver.resolve(block.data, path, (err, result) => {
              if (err) {
                return cb(err)
              }
              value = result.value
              path = result.remainderPath
              cb()
            })
          })
        })
      },
      () => {
        const endReached = !path || path === '' || path === '/'
        const isTerminal = value && !IPLDResolver._maybeCID(value)

        if ((endReached && isTerminal) || options.localResolve) {
          return true
        } else {
          value = IPLDResolver._maybeCID(value)
          // continue traversing
          if (value) {
            cid = value
          }
          return false
        }
      },
      (err, results) => {
        if (err) {
          return callback(err)
        }
        return callback(null, {
          value: value,
          remainderPath: path
        })
      }
    )
  }

  getStream (cid, path, options) {
    const deferred = pullDeferSource()

    this.get(cid, path, options, (err, result) => {
      if (err) {
        return deferred.resolve(
          pull.error(err)
        )
      }
      deferred.resolve(
        pull.values([result])
      )
    })

    return deferred
  }

  /**
   * Get multiple nodes back from an array of CIDs.
   *
   * @param {Array<CID>} cids
   * @param {function(Error, Array)} callback
   * @returns {void}
   */
  getMany (cids, callback) {
    if (!Array.isArray(cids)) {
      return callback(new Error('Argument must be an array of CIDs'))
    }
    this.bs.getMany(cids, (err, blocks) => {
      if (err) {
        return callback(err)
      }
      map(blocks, (block, mapCallback) => {
        this._getFormat(block.cid.codec, (err, format) => {
          if (err) return mapCallback(err)
          format.util.deserialize(block.data, mapCallback)
        })
      },
      callback)
    })
  }

  put (node, options, callback) {
    if (typeof options === 'function') {
      callback = options
      return setImmediate(() => callback(
        new Error('IPLDResolver.put requires options')
      ))
    }
    callback = callback || noop

    if (options.cid && CID.isCID(options.cid)) {
      if (options.onlyHash) {
        return setImmediate(() => callback(null, options.cid))
      }

      return this._put(options.cid, node, callback)
    }

    this._getFormat(options.format, (err, format) => {
      if (err) return callback(err)

      format.util.cid(node, options, (err, cid) => {
        if (err) {
          return callback(err)
        }

        if (options.onlyHash) {
          return callback(null, cid)
        }

        this._put(cid, node, callback)
      })
    })
  }

  treeStream (cid, path, options) {
    if (typeof path === 'object') {
      options = path
      path = undefined
    }

    options = options || {}

    let p

    if (!options.recursive) {
      p = pullDeferSource()

      waterfall([
        (cb) => this._getFormat(cid.codec, cb),
        (format, cb) => this.bs.get(cid, (err, block) => {
          if (err) return cb(err)
          cb(null, format, block)
        }),
        (format, block, cb) => format.resolver.tree(block.data, cb)
      ], (err, paths) => {
        if (err) {
          p.abort(err)
          return p
        }
        p.resolve(pull.values(paths))
      })
    }

    // recursive
    if (options.recursive) {
      p = pull(
        pullTraverse.widthFirst({
          basePath: null,
          cid: cid
        }, (el) => {
          // pass the paths through the pushable pull stream
          // continue traversing the graph by returning
          // the next cids with deferred

          if (typeof el === 'string') {
            return pull.empty()
          }

          const deferred = pullDeferSource()
          const cid = el.cid

          waterfall([
            (cb) => this._getFormat(cid.codec, cb),
            (format, cb) => this.bs.get(cid, (err, block) => {
              if (err) return cb(err)
              cb(null, format, block)
            }),
            (format, block, cb) => format.resolver.tree(block.data, (err, paths) => {
              if (err) {
                return cb(err)
              }
              map(paths, (p, cb) => {
                format.resolver.isLink(block.data, p, (err, link) => {
                  if (err) {
                    return cb(err)
                  }
                  cb(null, {path: p, link: link})
                })
              }, cb)
            })
          ], (err, paths) => {
            if (err) {
              deferred.abort(err)
              return deferred
            }

            deferred.resolve(pull.values(paths.map((p) => {
              const base = el.basePath ? el.basePath + '/' + p.path : p.path
              if (p.link) {
                return {
                  basePath: base,
                  cid: IPLDResolver._maybeCID(p.link)
                }
              }
              return base
            })))
          })
          return deferred
        }),
        pull.map((e) => {
          if (typeof e === 'string') {
            return e
          }
          return e.basePath
        }),
        pull.filter(Boolean)
      )
    }

    // filter out by path
    if (path) {
      return pull(
        p,
        pull.map((el) => {
          if (el.indexOf(path) === 0) {
            el = el.slice(path.length + 1)
            return el
          }
        }),
        pull.filter(Boolean)
      )
    }

    return p
  }

  remove (cids, callback) {
    this.bs.delete(cids, callback)
  }

  /*           */
  /* internals */
  /*           */

  _get (cid, callback) {
    waterfall([
      (cb) => this._getFormat(cid.codec, cb),
      (format, cb) => this.bs.get(cid, (err, block) => {
        if (err) return cb(err)
        cb(null, format, block)
      }),
      (format, block, cb) => {
        format.util.deserialize(block.data, (err, deserialized) => {
          if (err) {
            return cb(err)
          }
          cb(null, deserialized)
        })
      }
    ], callback)
  }

  _getFormat (codec, callback) {
    if (this.resolvers[codec]) {
      return callback(null, this.resolvers[codec])
    }

    // If not supported, attempt to dynamically load this format
    this.support.load(codec, (err, format) => {
      if (err) return callback(err)
      this.resolvers[codec] = format
      callback(null, format)
    })
  }

  _put (cid, node, callback) {
    callback = callback || noop

    waterfall([
      (cb) => this._getFormat(cid.codec, cb),
      (format, cb) => format.util.serialize(node, cb),
      (buf, cb) => this.bs.put(new Block(buf, cid), cb)
    ], (err) => {
      if (err) {
        return callback(err)
      }
      callback(null, cid)
    })
  }

  /**
   * Return a CID instance if it is a link.
   *
   * If something is a link `{"/": "baseencodedcid"}` or a CID, then return
   * a CID object, else return `null`.
   *
   * @param {*} link - The object to check
   * @returns {?CID} - A CID instance
   */
  static _maybeCID (link) {
    if (CID.isCID(link)) {
      return link
    }
    if (link && link['/'] !== undefined) {
      return new CID(link['/'])
    }
    return null
  }
}

/**
 * Default options for IPLD.
 */
IPLDResolver.defaultOptions = {
  formats: [ipldDagCbor, ipldDagPb, ipldRaw]
}

/**
 * Create an IPLD resolver with an in memory blockservice and
 * repo.
 *
 * @param {function(Error, IPLDResolver)} callback
 * @returns {void}
 */
IPLDResolver.inMemory = function (callback) {
  const repo = new IPFSRepo('in-memory', {
    storageBackends: {
      root: MemoryStore,
      blocks: MemoryStore,
      datastore: MemoryStore
    },
    lock: 'memory'
  })
  const blockService = new BlockService(repo)

  series([
    (cb) => repo.init({}, cb),
    (cb) => repo.open(cb)
  ], (err) => {
    if (err) {
      return callback(err)
    }
    callback(null, new IPLDResolver({blockService}))
  })
}

module.exports = IPLDResolver
