'use strict'

const waterfall = require('async/waterfall')
const series = require('async/series')
const parallel = require('async/parallel')
const each = require('async/each')
const _get = require('lodash.get')
const assert = require('assert')
const path = require('path')
const debug = require('debug')
const Big = require('big.js')
const pull = require('pull-stream')

const backends = require('./backends')
const version = require('./version')
const config = require('./config')
const spec = require('./spec')
const apiAddr = require('./api-addr')
const blockstore = require('./blockstore')
const defaultOptions = require('./default-options')
const defaultDatastore = require('./default-datastore')
const ERRORS = require('./errors')

const log = debug('repo')

const noLimit = Number.MAX_SAFE_INTEGER

const lockers = {
  memory: require('./lock-memory'),
  fs: require('./lock')
}

const repoVersion = require('./constants').repoVersion

/**
 * IpfsRepo implements all required functionality to read and write to an ipfs repo.
 *
 */
class IpfsRepo {
  /**
   * @param {string} repoPath - path where the repo is stored
   * @param {object} options - Configuration
   */
  constructor (repoPath, options) {
    assert.equal(typeof repoPath, 'string', 'missing repoPath')

    this.options = buildOptions(options)
    this.closed = true
    this.path = repoPath

    this._locker = this._getLocker()

    this.root = backends.create('root', this.path, this.options)
    this.version = version(this.root)
    this.config = config(this.root)
    this.spec = spec(this.root)
    this.apiAddr = apiAddr(this.root)
  }

  /**
   * Initialize a new repo.
   *
   * @param {Object} config - config to write into `config`.
   * @param {function(Error)} callback
   * @returns {void}
   */
  init (config, callback) {
    log('initializing at: %s', this.path)

    series([
      (cb) => this.root.open(ignoringAlreadyOpened(cb)),
      (cb) => this.config.set(buildConfig(config), cb),
      (cb) => this.spec.set(buildDatastoreSpec(config), cb),
      (cb) => this.version.set(repoVersion, cb)
    ], callback)
  }

  /**
   * Open the repo. If the repo is already open no action will be taken.
   * If the repo is not initialized it will return an error.
   *
   * @param {function(Error)} callback
   * @returns {void}
   */
  open (callback) {
    if (!this.closed) {
      setImmediate(() => callback(new Error('repo is already open')))
      return // early
    }
    log('opening at: %s', this.path)

    // check if the repo is already initialized
    waterfall([
      (cb) => this.root.open(ignoringAlreadyOpened(cb)),
      (cb) => this._isInitialized(cb),
      (cb) => this._openLock(this.path, cb),
      (lck, cb) => {
        log('aquired repo.lock')
        this.lockfile = lck
        cb()
      },
      (cb) => {
        log('creating datastore')
        this.datastore = backends.create('datastore', path.join(this.path, 'datastore'), this.options)
        log('creating blocks')
        const blocksBaseStore = backends.create('blocks', path.join(this.path, 'blocks'), this.options)
        blockstore(
          blocksBaseStore,
          this.options.storageBackendOptions.blocks,
          cb)
      },
      (blocks, cb) => {
        this.blocks = blocks
        cb()
      },
      (cb) => {
        log('creating keystore')
        this.keys = backends.create('keys', path.join(this.path, 'keys'), this.options)
        cb()
      },

      (cb) => {
        this.closed = false
        log('all opened')
        cb()
      }
    ], (err) => {
      if (err && this.lockfile) {
        this._closeLock((err2) => {
          if (!err2) {
            this.lockfile = null
          } else {
            log('error removing lock', err2)
          }
          callback(err)
        })
      } else {
        callback(err)
      }
    })
  }

  /**
   * Returns the repo locker to be used. Null will be returned if no locker is requested
   *
   * @private
   * @returns {Locker}
   */
  _getLocker () {
    if (typeof this.options.lock === 'string') {
      assert(lockers[this.options.lock], 'Unknown lock type: ' + this.options.lock)
      return lockers[this.options.lock]
    }

    assert(this.options.lock, 'No lock provided')
    return this.options.lock
  }

  /**
   * Creates a lock on the repo if a locker is specified. The lockfile object will
   * be returned in the callback if one has been created.
   *
   * @param {string} path
   * @param {function(Error, lockfile)} callback
   * @returns {void}
   */
  _openLock (path, callback) {
    this._locker.lock(path, (err, lockfile) => {
      if (err) {
        return callback(err, null)
      }

      assert.equal(typeof lockfile.close, 'function', 'Locks must have a close method')
      callback(null, lockfile)
    })
  }

  /**
   * Closes the lock on the repo
   *
   * @param {function(Error)} callback
   * @returns {void}
   */
  _closeLock (callback) {
    if (this.lockfile) {
      return this.lockfile.close(callback)
    }
    callback()
  }

  /**
   * Gets the status of the lock on the repo
   *
   * @param {string} path
   * @param {function(Error, boolean)} callback
   * @returns {void}
   */
  _isLocked (path, callback) {
    if (this._locker) {
      return this._locker.locked(path, callback)
    }
    callback(null, false)
  }

  /**
   * Check if the repo is already initialized.
   *
   * @private
   * @param {function(Error)} callback
   * @returns {void}
   */
  _isInitialized (callback) {
    log('init check')
    parallel(
      {
        config: (cb) => this.config.exists(cb),
        spec: (cb) => this.spec.exists(cb),
        version: (cb) => this.version.check(repoVersion, cb)
      },
      (err, res) => {
        log('init', err, res)
        if (err && !res.config) {
          return callback(Object.assign(new Error('repo is not initialized yet'),
            {
              code: ERRORS.ERR_REPO_NOT_INITIALIZED,
              path: this.path
            }))
        }
        callback(err)
      }
    )
  }

  /**
   * Close the repo and cleanup.
   *
   * @param {function(Error)} callback
   * @returns {void}
   */
  close (callback) {
    if (this.closed) {
      return callback(new Error('repo is already closed'))
    }

    log('closing at: %s', this.path)
    series([
      (cb) => this.apiAddr.delete(ignoringNotFound(cb)),
      (cb) => {
        each(
          [this.blocks, this.keys, this.datastore],
          (store, callback) => store.close(callback),
          cb)
      },
      (cb) => {
        log('unlocking')
        this.closed = true
        this._closeLock(cb)
      },
      (cb) => {
        this.lockfile = null
        cb()
      }
    ], (err) => callback(err))
  }

  /**
   * Check if a repo exists.
   *
   * @param {function(Error, bool)} callback
   * @returns {void}
   */
  exists (callback) {
    this.version.exists(callback)
  }

  /**
   * Get repo status.
   *
   * @param {Object}  options
   * @param {Boolean} options.human
   * @param {function(Error, Object)} callback
   * @return {void}
   */
  stat (options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = Object.assign({}, {human: false}, options)

    parallel({
      storageMax: (cb) => this.config.get('Datastore.StorageMax', (err, max) => {
        if (err) {
          cb(null, new Big(noLimit))
        } else {
          cb(null, new Big(max))
        }
      }),
      version: (cb) => this.version.get(cb),
      blocks: (cb) => this.blocks.query({}, (err, list) => {
        list = list || []

        const count = new Big(list.length)
        let size = new Big(0)

        list.forEach(block => {
          size = size
            .plus(block.value.byteLength)
            .plus(block.key._buf.byteLength)
        })

        cb(err, {
          count: count,
          size: size
        })
      }),
      datastore: (cb) => getSize(this.datastore, cb),
      keys: (cb) => getSize(this.keys, cb)
    }, (err, results) => {
      if (err) return callback(err)

      let size = results.blocks.size
        .plus(results.datastore)
        .plus(results.keys)

      if (options.human) {
        size = size.div(1048576)
      }

      callback(null, {
        repoPath: this.path,
        storageMax: results.storageMax,
        version: results.version,
        numObjects: results.blocks.count,
        repoSize: size
      })
    })
  }
}

function getSize (queryFn, callback) {
  pull(
    queryFn.query({}),
    pull.reduce((sum, block) => {
      return sum
        .plus(block.value.byteLength)
        .plus(block.key._buf.byteLength)
    }, new Big(0), callback))
}

module.exports = IpfsRepo
module.exports.repoVersion = repoVersion
module.exports.errors = ERRORS

function ignoringIf (cond, cb) {
  return (err) => {
    cb(err && !cond(err) ? err : null)
  }
}
function ignoringAlreadyOpened (cb) {
  return ignoringIf((err) => err.message === 'Already open', cb)
}

function ignoringNotFound (cb) {
  return ignoringIf((err) => {
    return err && (err.code === ERRORS.ERR_REPO_NOT_INITIALIZED || err.message.startsWith('ENOENT'))
  }, cb)
}

function buildOptions (_options) {
  const options = Object.assign({}, defaultOptions, _options)

  options.storageBackends = Object.assign(
    {},
    defaultOptions.storageBackends,
    options.storageBackends)

  options.storageBackendOptions = Object.assign(
    {},
    defaultOptions.storageBackendOptions,
    options.storageBackendOptions)

  return options
}

// TODO this should come from js-ipfs instead
function buildConfig (_config) {
  _config.datastore = Object.assign({}, defaultDatastore, _get(_config, 'datastore', {}))

  return _config
}

function buildDatastoreSpec (_config) {
  const spec = Object.assign({}, defaultDatastore.Spec, _get(_config, 'datastore.Spec', {}))

  return {
    type: spec.type,
    mounts: spec.mounts.map((mounting) => ({
      mountpoint: mounting.mountpoint,
      type: mounting.child.type,
      path: mounting.child.path,
      shardFunc: mounting.child.shardFunc
    }))
  }
}
