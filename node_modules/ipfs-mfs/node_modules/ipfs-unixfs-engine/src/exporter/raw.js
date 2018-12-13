'use strict'

const pull = require('pull-stream')
const extractDataFromBlock = require('./extract-data-from-block')

// Logic to export a single raw block
module.exports = (cid, node, name, path, pathRest, resolve, size, dag, parent, depth, offset, length) => {
  const accepts = pathRest[0]

  if (accepts !== undefined && accepts !== path) {
    return pull.empty()
  }

  size = size || node.length

  if (offset < 0) {
    return pull.error(new Error('Offset must be greater than or equal to 0'))
  }

  if (offset > size) {
    return pull.error(new Error('Offset must be less than the file size'))
  }

  if (length < 0) {
    return pull.error(new Error('Length must be greater than or equal to 0'))
  }

  if (length === 0) {
    return pull.once({
      depth,
      content: pull.once(Buffer.alloc(0)),
      hash: cid,
      name,
      path,
      size,
      type: 'raw'
    })
  }

  if (!offset) {
    offset = 0
  }

  if (!length || (offset + length > size)) {
    length = size - offset
  }

  return pull.once({
    depth,
    content: pull.once(extractDataFromBlock(node, 0, offset, offset + length)),
    hash: cid,
    name,
    path,
    size,
    type: 'raw'
  })
}
