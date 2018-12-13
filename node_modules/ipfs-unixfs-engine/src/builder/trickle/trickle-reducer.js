'use strict'

const pull = require('pull-stream')
const pushable = require('pull-pushable')
const batch = require('pull-batch')
const pullPair = require('pull-pair')
const through = require('pull-through')
const pullWrite = require('pull-write')
const pause = require('pull-pause')

module.exports = function trickleReduceToRoot (reduce, options) {
  const pair = pullPair()
  const result = pushable()
  const pausable = pause(() => {})
  let pendingResumes = 0

  pull(
    pair.source,
    pausable,
    trickle(0, -1),
    batch(Infinity),
    pull.asyncMap(reduce),
    pull.collect((err, roots) => {
      if (err) {
        result.end(err)
      } else {
        if (roots.length === 1) {
          result.push(roots[0])
          result.end()
        } else if (roots.length > 1) {
          result.end(new Error('expected a maximum of 1 roots and got ' + roots.length))
        } else {
          result.end()
        }
      }
    })
  )

  return {
    sink: pair.sink,
    source: result
  }

  function trickle (indent, maxDepth) {
    let iteration = 0
    let depth = 0
    let deeper
    let aborting = false

    const result = pushable()

    return {
      source: result,
      sink: pullWrite(write, null, 1, end)
    }

    function write (nodes, callback) {
      let ended = false
      const node = nodes[0]

      if (depth && !deeper) {
        deeper = pushable()

        pull(
          deeper,
          trickle(indent + 1, depth - 1),
          through(
            function (d) {
              this.queue(d)
            },
            function (err) {
              if (err) {
                this.emit('error', err)
                return // early
              }
              if (!ended) {
                ended = true
                pendingResumes++
                pausable.pause()
              }
              this.queue(null)
            }
          ),
          batch(Infinity),
          pull.asyncMap(reduce),
          pull.collect((err, nodes) => {
            pendingResumes--
            if (err) {
              result.end(err)
              return
            }
            nodes.forEach(node => {
              result.push(node)
            })
            iterate()
          })
        )
      }

      if (deeper) {
        deeper.push(node)
      } else {
        result.push(node)
        iterate()
      }

      callback()
    }

    function iterate () {
      deeper = null
      iteration++
      if ((depth === 0 && iteration === options.maxChildrenPerNode) ||
          (depth > 0 && iteration === options.layerRepeat)) {
        iteration = 0
        depth++
      }

      if ((!aborting && maxDepth >= 0 && depth > maxDepth) ||
          (aborting && !pendingResumes)) {
        aborting = true
        result.end()
      }

      if (!pendingResumes) {
        pausable.resume()
      }
    }

    function end (err) {
      if (err) {
        result.end(err)
        return
      }
      if (deeper) {
        if (!aborting) {
          aborting = true
          deeper.end()
        }
      } else {
        result.end()
      }
    }
  }
}
