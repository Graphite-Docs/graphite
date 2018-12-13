/* @flow */
'use strict'

/* :: import type {Batch, Query, QueryResult, Callback} from 'interface-datastore' */

const fs = require('graceful-fs')
const pull = require('pull-stream')
const glob = require('glob')
const setImmediate = require('async/setImmediate')
const waterfall = require('async/series')
const each = require('async/each')
const mkdirp = require('mkdirp')
const writeFile = require('write-file-atomic')
const path = require('path')

const asyncFilter = require('interface-datastore').utils.asyncFilter
const asyncSort = require('interface-datastore').utils.asyncSort
const IDatastore = require('interface-datastore')
const Key = IDatastore.Key
const Errors = IDatastore.Errors

/* :: export type FsInputOptions = {
  createIfMissing?: bool,
  errorIfExists?: bool,
  extension?: string
}

type FsOptions = {
  createIfMissing: bool,
  errorIfExists: bool,
  extension: string
}
*/

/**
 * A datastore backed by the file system.
 *
 * Keys need to be sanitized before use, as they are written
 * to the file system as is.
 */
class FsDatastore {
  /* :: path: string */
  /* :: opts: FsOptions */

  constructor (location /* : string */, opts /* : ?FsInputOptions */) {
    this.path = path.resolve(location)
    this.opts = Object.assign({}, {
      createIfMissing: true,
      errorIfExists: false,
      extension: '.data'
    }, opts)

    if (this.opts.createIfMissing) {
      this._openOrCreate()
    } else {
      this._open()
    }
  }

  open (callback /* : Callback<void> */) /* : void */ {
    this._openOrCreate()
    setImmediate(callback)
  }

  /**
   * Check if the path actually exists.
   * @private
   * @returns {void}
   */
  _open () {
    if (!fs.existsSync(this.path)) {
      throw new Error(`Datastore directory: ${this.path} does not exist`)
    }

    if (this.opts.errorIfExists) {
      throw new Error(`Datastore directory: ${this.path} already exists`)
    }
  }

  /**
   * Create the directory to hold our data.
   *
   * @private
   * @returns {void}
   */
  _create () {
    mkdirp.sync(this.path, { fs: fs })
  }

  /**
   * Tries to open, and creates if the open fails.
   *
   * @private
   * @returns {void}
   */
  _openOrCreate () {
    try {
      this._open()
    } catch (err) {
      if (err.message.match('does not exist')) {
        this._create()
        return
      }

      throw err
    }
  }

  /**
   * Calculate the directory and file name for a given key.
   *
   * @private
   * @param {Key} key
   * @returns {{string, string}}
   */
  _encode (key /* : Key */) /* : {dir: string, file: string} */ {
    const parent = key.parent().toString()
    const dir = path.join(this.path, parent)
    const name = key.toString().slice(parent.length)
    const file = path.join(dir, name + this.opts.extension)

    return {
      dir: dir,
      file: file
    }
  }

  /**
   * Calculate the original key, given the file name.
   *
   * @private
   * @param {string} file
   * @returns {Key}
   */
  _decode (file /* : string */) /* : Key */ {
    const ext = this.opts.extension
    if (path.extname(file) !== ext) {
      throw new Error(`Invalid extension: ${path.extname(file)}`)
    }

    const keyname = file
      .slice(this.path.length, -ext.length)
      .split(path.sep)
      .join('/')
    return new Key(keyname)
  }

  /**
   * Write to the file system without extension.
   *
   * @param {Key} key
   * @param {Buffer} val
   * @param {function(Error)} callback
   * @returns {void}
   */
  putRaw (key /* : Key */, val /* : Buffer */, callback /* : Callback<void> */) /* : void */ {
    const parts = this._encode(key)
    const file = parts.file.slice(0, -this.opts.extension.length)
    waterfall([
      (cb) => mkdirp(parts.dir, { fs: fs }, cb),
      (cb) => writeFile(file, val, cb)
    ], (err) => callback(err))
  }

  /**
   * Store the given value under the key.
   *
   * @param {Key} key
   * @param {Buffer} val
   * @param {function(Error)} callback
   * @returns {void}
   */
  put (key /* : Key */, val /* : Buffer */, callback /* : Callback<void> */) /* : void */ {
    const parts = this._encode(key)
    waterfall([
      (cb) => mkdirp(parts.dir, { fs: fs }, cb),
      (cb) => writeFile(parts.file, val, cb)
    ], (err) => {
      if (err) {
        return callback(Errors.dbWriteFailedError(err))
      }
      callback()
    })
  }

  /**
   * Read from the file system without extension.
   *
   * @param {Key} key
   * @param {function(Error, Buffer)} callback
   * @returns {void}
   */
  getRaw (key /* : Key */, callback /* : Callback<Buffer> */) /* : void */ {
    const parts = this._encode(key)
    let file = parts.file
    file = file.slice(0, -this.opts.extension.length)
    fs.readFile(file, (err, data) => {
      if (err) {
        return callback(Errors.notFoundError(err))
      }
      callback(null, data)
    })
  }

  /**
   * Read from the file system.
   *
   * @param {Key} key
   * @param {function(Error, Buffer)} callback
   * @returns {void}
   */
  get (key /* : Key */, callback /* : Callback<Buffer> */) /* : void */ {
    const parts = this._encode(key)
    fs.readFile(parts.file, (err, data) => {
      if (err) {
        return callback(Errors.notFoundError(err))
      }
      callback(null, data)
    })
  }

  /**
   * Check for the existence of the given key.
   *
   * @param {Key} key
   * @param {function(Error, bool)} callback
   * @returns {void}
   */
  has (key /* : Key */, callback /* : Callback<bool> */) /* : void */ {
    const parts = this._encode(key)
    fs.access(parts.file, err => {
      callback(null, !err)
    })
  }

  /**
   * Delete the record under the given key.
   *
   * @param {Key} key
   * @param {function(Error)} callback
   * @returns {void}
   */
  delete (key /* : Key */, callback /* : Callback<void> */) /* : void */ {
    const parts = this._encode(key)
    fs.unlink(parts.file, (err) => {
      if (err) {
        return callback(Errors.dbDeleteFailedError(err))
      }
      callback()
    })
  }

  /**
   * Create a new batch object.
   *
   * @returns {Batch}
   */
  batch () /* : Batch<Buffer> */ {
    const puts = []
    const deletes = []
    return {
      put (key /* : Key */, value /* : Buffer */) /* : void */ {
        puts.push({ key: key, value: value })
      },
      delete (key /* : Key */) /* : void */ {
        deletes.push(key)
      },
      commit: (callback /* : (err: ?Error) => void */) => {
        waterfall([
          (cb) => each(puts, (p, cb) => {
            this.put(p.key, p.value, cb)
          }, cb),
          (cb) => each(deletes, (k, cb) => {
            this.delete(k, cb)
          }, cb)
        ], (err) => callback(err))
      }
    }
  }

  /**
   * Query the store.
   *
   * @param {Object} q
   * @returns {PullStream}
   */
  query (q /* : Query<Buffer> */) /* : QueryResult<Buffer> */ {
    // glob expects a POSIX path
    let prefix = q.prefix || '**'
    let pattern = path
      .join(this.path, prefix, '*' + this.opts.extension)
      .split(path.sep)
      .join('/')
    let tasks = [pull.values(glob.sync(pattern))]

    if (!q.keysOnly) {
      tasks.push(pull.asyncMap((f, cb) => {
        fs.readFile(f, (err, buf) => {
          if (err) {
            return cb(err)
          }
          cb(null, {
            key: this._decode(f),
            value: buf
          })
        })
      }))
    } else {
      tasks.push(pull.map(f => ({ key: this._decode(f) })))
    }

    if (q.filters != null) {
      tasks = tasks.concat(q.filters.map(asyncFilter))
    }

    if (q.orders != null) {
      tasks = tasks.concat(q.orders.map(asyncSort))
    }

    if (q.offset != null) {
      let i = 0
      tasks.push(pull.filter(() => i++ >= q.offset))
    }

    if (q.limit != null) {
      tasks.push(pull.take(q.limit))
    }

    return pull.apply(null, tasks)
  }

  /**
   * Close the store.
   *
   * @param {function(Error)} callback
   * @returns {void}
   */
  close (callback /* : (err: ?Error) => void */) /* : void */ {
    setImmediate(callback)
  }
}

module.exports = FsDatastore
