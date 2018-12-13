'use strict'

const pullBlock = require('pull-block')

module.exports = (options) => {
  let maxSize = (typeof options === 'number') ? options : options.maxChunkSize
  return pullBlock(maxSize, { zeroPadding: false, emitEmpty: true })
}
