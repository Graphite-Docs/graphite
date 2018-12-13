'use strict'

module.exports = function extractDataFromBlock (block, blockStart, requestedStart, requestedEnd) {
  const blockLength = block.length
  const blockEnd = blockStart + blockLength

  if (requestedStart >= blockEnd || requestedEnd < blockStart) {
    // If we are looking for a byte range that is starts after the start of the block,
    // return an empty block.  This can happen when internal nodes contain data
    return Buffer.alloc(0)
  }

  if (requestedEnd >= blockStart && requestedEnd < blockEnd) {
    // If the end byte is in the current block, truncate the block to the end byte
    block = block.slice(0, requestedEnd - blockStart)
  }

  if (requestedStart >= blockStart && requestedStart < blockEnd) {
    // If the start byte is in the current block, skip to the start byte
    block = block.slice(requestedStart - blockStart)
  }

  return block
}
