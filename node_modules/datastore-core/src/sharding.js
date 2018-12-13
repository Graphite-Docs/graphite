/* @flow */
'use strict'

const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const Key = require('interface-datastore').Key

const sh = require('./shard')
const KeytransformStore = require('./keytransform')

const shardKey = new Key(sh.SHARDING_FN)
const shardReadmeKey = new Key(sh.README_FN)

/* ::
import type {Datastore, Batch, Query, QueryResult, Callback} from 'interface-datastore'

import type {ShardV1} from './shard'
*/

/**
 * Backend independent abstraction of go-ds-flatfs.
 *
 * Wraps another datastore such that all values are stored
 * sharded according to the given sharding function.
 */
class ShardingDatastore {
  /* :: shard: ShardV1 */
  /* :: child: Datastore<Buffer> */

  constructor (store /* : Datastore<Buffer> */, shard /* : ShardV1 */) {
    this.child = new KeytransformStore(store, {
      convert: this._convertKey.bind(this),
      invert: this._invertKey.bind(this)
    })
    this.shard = shard
  }

  open (callback /* : Callback<void> */) /* : void */ {
    this.child.open(callback)
  }

  _convertKey (key/* : Key */)/* : Key */ {
    const s = key.toString()
    if (s === shardKey.toString() || s === shardReadmeKey.toString()) {
      return key
    }

    const parent = new Key(this.shard.fun(s))
    return parent.child(key)
  }

  _invertKey (key/* : Key */)/* : Key */ {
    const s = key.toString()
    if (s === shardKey.toString() || s === shardReadmeKey.toString()) {
      return key
    }
    return Key.withNamespaces(key.list().slice(1))
  }

  static createOrOpen (store /* : Datastore<Buffer> */, shard /* : ShardV1 */, callback /* : Callback<ShardingDatastore> */) /* : void */ {
    ShardingDatastore.create(store, shard, err => {
      if (err && err.message !== 'datastore exists') {
        return callback(err)
      }

      ShardingDatastore.open(store, callback)
    })
  }

  static open (store /* : Datastore<Buffer> */, callback /* : Callback<ShardingDatastore> */) /* : void */ {
    waterfall([
      (cb) => sh.readShardFun('/', store, cb),
      (shard, cb) => {
        cb(null, new ShardingDatastore(store, shard))
      }
    ], callback)
  }

  static create (store /* : Datastore<Buffer> */, shard /* : ShardV1 */, callback /* : Callback<void> */) /* : void */ {
    store.has(shardKey, (err, exists) => {
      if (err) {
        return callback(err)
      }

      if (!exists) {
        const put = typeof store.putRaw === 'function' ? store.putRaw.bind(store) : store.put.bind(store)
        return parallel([
          (cb) => put(shardKey, Buffer.from(shard.toString() + '\n'), cb),
          (cb) => put(shardReadmeKey, Buffer.from(sh.readme), cb)
        ], err => callback(err))
      }

      sh.readShardFun('/', store, (err, diskShard) => {
        if (err) {
          return callback(err)
        }

        const a = (diskShard || '').toString()
        const b = shard.toString()
        if (a !== b) {
          return callback(new Error(`specified fun ${b} does not match repo shard fun ${a}`))
        }

        callback(new Error('datastore exists'))
      })
    })
  }

  put (key /* : Key */, val /* : Buffer */, callback /* : Callback<void> */) /* : void */ {
    this.child.put(key, val, callback)
  }

  get (key /* : Key */, callback /* : Callback<Buffer> */) /* : void */ {
    this.child.get(key, callback)
  }

  has (key /* : Key */, callback /* : Callback<bool> */) /* : void */ {
    this.child.has(key, callback)
  }

  delete (key /* : Key */, callback /* : Callback<void> */) /* : void */ {
    this.child.delete(key, callback)
  }

  batch () /* : Batch<Buffer> */ {
    return this.child.batch()
  }

  query (q /* : Query<Buffer> */) /* : QueryResult<Buffer> */ {
    const tq/* : Query<Buffer> */ = {
      keysOnly: q.keysOnly,
      offset: q.offset,
      limit: q.limit,
      filters: [
        (e, cb) => cb(null, e.key.toString() !== shardKey.toString()),
        (e, cb) => cb(null, e.key.toString() !== shardReadmeKey.toString())
      ]
    }

    if (q.prefix != null) {
      tq.filters.push((e, cb) => {
        cb(null, this._invertKey(e.key).toString().startsWith(q.prefix))
      })
    }

    if (q.filters != null) {
      const filters = q.filters.map((f) => (e, cb) => {
        f(Object.assign({}, e, {
          key: this._invertKey(e.key)
        }), cb)
      })
      tq.filters = tq.filters.concat(filters)
    }

    if (q.orders != null) {
      tq.orders = q.orders.map((o) => (res, cb) => {
        res.forEach((e) => { e.key = this._invertKey(e.key) })
        o(res, (err, ordered) => {
          if (err) {
            return cb(err)
          }
          ordered.forEach((e) => { e.key = this._convertKey(e.key) })
          cb(null, ordered)
        })
      })
    }

    return this.child.query(tq)
  }

  close (callback /* : Callback<void> */) /* : void */ {
    this.child.close(callback)
  }
}

module.exports = ShardingDatastore
