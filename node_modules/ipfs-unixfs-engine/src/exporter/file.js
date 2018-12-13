'use strict'

const traverse = require('pull-traverse')
const UnixFS = require('ipfs-unixfs')
const CID = require('cids')
const pull = require('pull-stream')
const paramap = require('pull-paramap')
const extractDataFromBlock = require('./extract-data-from-block')

// Logic to export a single (possibly chunked) unixfs file.
module.exports = (cid, node, name, path, pathRest, resolve, size, dag, parent, depth, offset, length) => {
  const accepts = pathRest[0]

  if (accepts !== undefined && accepts !== path) {
    return pull.empty()
  }

  let file

  try {
    file = UnixFS.unmarshal(node.data)
  } catch (error) {
    return pull.error(error)
  }

  const fileSize = size || file.fileSize()

  if (offset < 0) {
    return pull.error(new Error('Offset must be greater than or equal to 0'))
  }

  if (offset > fileSize) {
    return pull.error(new Error('Offset must be less than the file size'))
  }

  if (length < 0) {
    return pull.error(new Error('Length must be greater than or equal to 0'))
  }

  if (length === 0) {
    return pull.once({
      depth: depth,
      content: pull.once(Buffer.alloc(0)),
      name: name,
      path: path,
      hash: cid,
      size: fileSize,
      type: 'file'
    })
  }

  if (!offset) {
    offset = 0
  }

  if (!length || (offset + length > fileSize)) {
    length = fileSize - offset
  }

  const content = streamBytes(dag, node, fileSize, offset, length)

  return pull.values([{
    depth: depth,
    content: content,
    name: name,
    path: path,
    hash: cid,
    size: fileSize,
    type: 'file'
  }])
}

function streamBytes (dag, node, fileSize, offset, length) {
  if (offset === fileSize || length === 0) {
    return pull.once(Buffer.alloc(0))
  }

  const end = offset + length

  return pull(
    traverse.depthFirst({
      node,
      start: 0,
      end: fileSize
    }, getChildren(dag, offset, end)),
    pull.map(extractData(offset, end)),
    pull.filter(Boolean)
  )
}

function getChildren (dag, offset, end) {
  // as we step through the children, keep track of where we are in the stream
  // so we can filter out nodes we're not interested in
  let streamPosition = 0

  return function visitor ({ node }) {
    if (Buffer.isBuffer(node)) {
      // this is a leaf node, can't traverse any further
      return pull.empty()
    }

    let file

    try {
      file = UnixFS.unmarshal(node.data)
    } catch (error) {
      return pull.error(error)
    }

    const nodeHasData = Boolean(file.data && file.data.length)

    // handle case where data is present on leaf nodes and internal nodes
    if (nodeHasData && node.links.length) {
      streamPosition += file.data.length
    }

    // work out which child nodes contain the requested data
    const filteredLinks = node.links
      .map((link, index) => {
        const child = {
          link: link,
          start: streamPosition,
          end: streamPosition + file.blockSizes[index],
          size: file.blockSizes[index]
        }

        streamPosition = child.end

        return child
      })
      .filter((child) => {
        return (offset >= child.start && offset < child.end) || // child has offset byte
          (end > child.start && end <= child.end) || // child has end byte
          (offset < child.start && end > child.end) // child is between offset and end bytes
      })

    if (filteredLinks.length) {
      // move stream position to the first node we're going to return data from
      streamPosition = filteredLinks[0].start
    }

    return pull(
      pull.values(filteredLinks),
      paramap((child, cb) => {
        dag.get(new CID(child.link.multihash), (error, result) => cb(error, {
          start: child.start,
          end: child.end,
          node: result && result.value,
          size: child.size
        }))
      })
    )
  }
}

function extractData (requestedStart, requestedEnd) {
  let streamPosition = -1

  return function getData ({ node, start, end }) {
    let block

    if (Buffer.isBuffer(node)) {
      block = node
    } else {
      try {
        const file = UnixFS.unmarshal(node.data)

        if (!file.data) {
          if (file.blockSizes.length) {
            return
          }

          return Buffer.alloc(0)
        }

        block = file.data
      } catch (error) {
        throw new Error(`Failed to unmarshal node - ${error.message}`)
      }
    }

    if (block && block.length) {
      if (streamPosition === -1) {
        streamPosition = start
      }

      const output = extractDataFromBlock(block, streamPosition, requestedStart, requestedEnd)

      streamPosition += block.length

      return output
    }

    return Buffer.alloc(0)
  }
}
