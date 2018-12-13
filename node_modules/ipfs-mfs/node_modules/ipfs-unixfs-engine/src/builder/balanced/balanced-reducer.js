'use strict'

const pull = require('pull-stream')
const pushable = require('pull-pushable')
const pullPair = require('pull-pair')
const batch = require('pull-batch')

module.exports = function balancedReduceToRoot (reduce, options) {
  const pair = pullPair()
  const source = pair.source

  const result = pushable()

  reduceToParents(source, (err, roots) => {
    if (err) {
      result.end(err)
      return // early
    }
    if (roots.length === 1) {
      result.push(roots[0])
      result.end()
    } else if (roots.length > 1) {
      result.end(new Error('expected a maximum of 1 roots and got ' + roots.length))
    } else {
      result.end()
    }
  })

  function reduceToParents (_chunks, callback) {
    let chunks = _chunks
    if (Array.isArray(chunks)) {
      chunks = pull.values(chunks)
    }

    pull(
      chunks,
      batch(options.maxChildrenPerNode),
      pull.asyncMap(reduce),
      pull.collect(reduced)
    )

    function reduced (err, roots) {
      if (err) {
        callback(err)
      } else if (roots.length > 1) {
        reduceToParents(roots, callback)
      } else {
        callback(null, roots)
      }
    }
  }

  return {
    sink: pair.sink,
    source: result
  }
}
