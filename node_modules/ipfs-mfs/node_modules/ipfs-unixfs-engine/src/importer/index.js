'use strict'

const pause = require('pull-pause')
const pull = require('pull-stream')
const writable = require('pull-write')
const pushable = require('pull-pushable')
const assert = require('assert')
const setImmediate = require('async/setImmediate')
const DAGBuilder = require('../builder')
const createTreeBuilder = require('./tree-builder')
const chunkers = require('../chunker')

const defaultOptions = {
  chunker: 'fixed',
  rawLeaves: false,
  hashOnly: false,
  cidVersion: 0,
  hash: null,
  leafType: 'file',
  hashAlg: 'sha2-256'
}

module.exports = function (ipld, _options) {
  const options = Object.assign({}, defaultOptions, _options)
  options.cidVersion = options.cidVersion || 0

  if (options.cidVersion > 0 && _options.rawLeaves === undefined) {
    // if the cid version is 1 or above, use raw leaves as this is
    // what go does.
    options.rawLeaves = true
  }

  if (_options && _options.hash !== undefined && _options.rawLeaves === undefined) {
    // if a non-default hash alg has been specified, use raw leaves as this is
    // what go does.
    options.rawLeaves = true
  }

  const Chunker = chunkers[options.chunker]
  assert(Chunker, 'Unknkown chunker named ' + options.chunker)

  let pending = 0
  const waitingPending = []

  const entry = {
    sink: writable(
      (nodes, callback) => {
        pending += nodes.length
        nodes.forEach((node) => entry.source.push(node))
        setImmediate(callback)
      },
      null,
      1,
      (err) => entry.source.end(err)
    ),
    source: pushable()
  }

  const dagStream = DAGBuilder(Chunker, ipld, options)

  const treeBuilder = createTreeBuilder(ipld, options)
  const treeBuilderStream = treeBuilder.stream()
  const pausable = pause(() => {})

  // TODO: transform this entry -> pausable -> <custom async transform> -> exit
  // into a generic NPM package named something like pull-pause-and-drain

  pull(
    entry,
    pausable,
    dagStream,
    pull.map((node) => {
      pending--
      if (!pending) {
        process.nextTick(() => {
          while (waitingPending.length) {
            waitingPending.shift()()
          }
        })
      }
      return node
    }),
    treeBuilderStream
  )

  return {
    sink: entry.sink,
    source: treeBuilderStream.source,
    flush: flush
  }

  function flush (callback) {
    pausable.pause()

    // wait until all the files entered were
    // transformed into DAG nodes
    if (!pending) {
      proceed()
    } else {
      waitingPending.push(proceed)
    }

    function proceed () {
      treeBuilder.flush((err, hash) => {
        if (err) {
          treeBuilderStream.source.end(err)
          callback(err)
          return
        }
        pausable.resume()
        callback(null, hash)
      })
    }
  }
}
