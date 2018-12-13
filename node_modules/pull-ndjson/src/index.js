'use strict'

const stringify = require('pull-stringify')
const split = require('pull-split')
const pull = require('pull-stream')

exports = module.exports

exports.parse = () => {
  return pull(
    split('\n'),
    pull.filter(),
    pull.map(JSON.parse)
  )
}

exports.serialize = stringify.ldjson
