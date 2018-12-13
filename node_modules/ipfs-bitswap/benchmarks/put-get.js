/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-disable no-console */
'use strict'

const Benchmark = require('benchmark')
const _ = require('lodash')
const Block = require('ipfs-block')
const assert = require('assert')
const series = require('async/series')
const map = require('async/map')
const crypto = require('crypto')
const CID = require('cids')
const multihashing = require('multihashing-async')

const utils = require('../test/utils')

const suite = new Benchmark.Suite('put-get')

const blockCounts = [1, 10, 1000]
const blockSizes = [10, 1024, 10 * 1024]

utils.genBitswapNetwork(1, (err, nodes) => {
  if (err) {
    throw err
  }
  const node = nodes[0]
  const bitswap = node.bitswap

  blockCounts.forEach((n) => blockSizes.forEach((k) => {
    suite.add(`put-get ${n} blocks of size ${k}`, (defer) => {
      createBlocks(n, k, (err, blocks) => {
        if (err) {
          throw err
        }
        series([
          (cb) => bitswap.putMany(blocks, cb),
          (cb) => get(blocks, bitswap, cb)
        ], (err) => {
          if (err) {
            throw err
          }
          defer.resolve()
        })
      })
    }, {
      defer: true
    })
  }))

  suite
    .on('cycle', (event) => {
      console.log(String(event.target))
    })
    .on('complete', () => {
      process.exit()
    })
    .run({
      async: true
    })
})

function createBlocks (n, k, callback) {
  map(_.range(n), (i, cb) => {
    const data = crypto.randomBytes(k)
    multihashing(data, 'sha2-256', (err, hash) => {
      if (err) {
        return cb(err)
      }
      cb(null, new Block(data, new CID(hash)))
    })
  }, callback)
}

function get (blocks, bs, callback) {
  map(blocks, (b, cb) => {
    bs.get(b.cid, cb)
  }, (err, res) => {
    if (err) {
      return callback(err)
    }

    assert(res.length === blocks.length)
    callback()
  })
}
