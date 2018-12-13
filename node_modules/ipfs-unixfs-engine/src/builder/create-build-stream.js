'use strict'

const pullPushable = require('pull-pushable')
const pullWrite = require('pull-write')

module.exports = function createBuildStream (createStrategy, _ipld, options) {
  const source = pullPushable()

  const sink = pullWrite(
    createStrategy(source),
    null,
    options.highWaterMark,
    (err) => source.end(err)
  )

  return {
    source: source,
    sink: sink
  }
}
