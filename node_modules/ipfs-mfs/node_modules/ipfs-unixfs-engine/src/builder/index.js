'use strict'

const assert = require('assert')
const createBuildStream = require('./create-build-stream')
const Builder = require('./builder')

const reducers = {
  flat: require('./flat'),
  balanced: require('./balanced'),
  trickle: require('./trickle')
}

const defaultOptions = {
  strategy: 'balanced',
  highWaterMark: 100,
  reduceSingleLeafToSelf: true
}

module.exports = function (Chunker, ipld, _options) {
  assert(Chunker, 'Missing chunker creator function')
  assert(ipld, 'Missing IPLD')

  const options = Object.assign({}, defaultOptions, _options)

  const strategyName = options.strategy
  const reducer = reducers[strategyName]
  assert(reducer, 'Unknown importer build strategy name: ' + strategyName)

  const createStrategy = Builder(Chunker, ipld, reducer, options)

  return createBuildStream(createStrategy, ipld, options)
}
