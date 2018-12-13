/* @flow */
'use strict'

/* :: import type {Batch, Query, QueryResult, Callback} from './' */

const pull = require('pull-stream')
const setImmediate = require('async/setImmediate')

const asyncFilter = require('./utils').asyncFilter
const asyncSort = require('./utils').asyncSort
const Key = require('./key')

// Errors
const Errors = require('./errors')

class MemoryDatastore {
  /* :: data: {[key: string]: Buffer} */

  constructor () {
    this.data = {}
  }

  open (callback /* : Callback<void> */) /* : void */ {
    setImmediate(callback)
  }

  put (key /* : Key */, val /* : Buffer */, callback /* : Callback<void> */) /* : void */ {
    this.data[key.toString()] = val

    setImmediate(callback)
  }

  get (key /* : Key */, callback /* : Callback<Buffer> */) /* : void */ {
    this.has(key, (err, exists) => {
      if (err) {
        return callback(err)
      }

      if (!exists) {
        return callback(Errors.notFoundError())
      }

      callback(null, this.data[key.toString()])
    })
  }

  has (key /* : Key */, callback /* : Callback<bool> */) /* : void */ {
    setImmediate(() => {
      callback(null, this.data[key.toString()] !== undefined)
    })
  }

  delete (key /* : Key */, callback /* : Callback<void> */) /* : void */ {
    delete this.data[key.toString()]

    setImmediate(() => {
      callback()
    })
  }

  batch () /* : Batch<Buffer> */ {
    let puts = []
    let dels = []

    return {
      put (key /* : Key */, value /* : Buffer */) /* : void */ {
        puts.push([key, value])
      },
      delete (key /* : Key */) /* : void */ {
        dels.push(key)
      },
      commit: (callback /* : Callback<void> */) /* : void */ => {
        puts.forEach(v => {
          this.data[v[0].toString()] = v[1]
        })

        puts = []
        dels.forEach(key => {
          delete this.data[key.toString()]
        })
        dels = []

        setImmediate(callback)
      }
    }
  }

  query (q /* : Query<Buffer> */) /* : QueryResult<Buffer> */ {
    let tasks = [pull.keys(this.data), pull.map(k => ({
      key: new Key(k),
      value: this.data[k]
    }))]

    let filters = []

    if (q.prefix != null) {
      const prefix = q.prefix
      filters.push((e, cb) => cb(null, e.key.toString().startsWith(prefix)))
    }

    if (q.filters != null) {
      filters = filters.concat(q.filters)
    }

    tasks = tasks.concat(filters.map(f => asyncFilter(f)))

    if (q.orders != null) {
      tasks = tasks.concat(q.orders.map(o => asyncSort(o)))
    }

    if (q.offset != null) {
      let i = 0
      // $FlowFixMe
      tasks.push(pull.filter(() => i++ >= q.offset))
    }

    if (q.limit != null) {
      tasks.push(pull.take(q.limit))
    }

    if (q.keysOnly === true) {
      tasks.push(pull.map(e => ({ key: e.key })))
    }

    return pull.apply(null, tasks)
  }

  close (callback /* : Callback<void> */) /* : void */ {
    setImmediate(callback)
  }
}

module.exports = MemoryDatastore
