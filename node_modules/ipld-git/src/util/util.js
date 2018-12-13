'use strict'

const SmartBuffer = require('smart-buffer').SmartBuffer
const multihashes = require('multihashes/src/constants')
const multicodecs = require('multicodec/src/base-table')
const multihash = require('multihashes')
const CID = require('cids')

exports = module.exports

exports.SHA1_LENGTH = multihashes.defaultLengths[multihashes.names.sha1]

exports.find = (buf, byte) => {
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === byte) {
      return i
    }
  }
  return -1
}

exports.parsePersonLine = (line) => {
  let matched = line.match(/^(([^<]+)\s)?\s?<([^>]+)>\s?(\d+\s[+\-\d]+)?$/)
  if (matched === null) {
    return null
  }

  return {
    name: matched[2],
    email: matched[3],
    date: matched[4]
  }
}

exports.serializePersonLine = (node) => {
  let parts = []
  if (node.name) {
    parts.push(node.name)
  }
  parts.push('<' + node.email + '>')
  if (node.date) {
    parts.push(node.date)
  }

  return parts.join(' ')
}

exports.shaToCid = (buf) => {
  let mhashBuf = new SmartBuffer()
  mhashBuf.writeUInt8(1)
  mhashBuf.writeBuffer(multicodecs['git-raw'])
  mhashBuf.writeUInt8(multihashes.names.sha1)
  mhashBuf.writeUInt8(exports.SHA1_LENGTH)
  mhashBuf.writeBuffer(buf)
  return mhashBuf.toBuffer()
}

exports.cidToSha = (cidBuf) => {
  let mh = multihash.decode(new CID(cidBuf).multihash)
  if (mh.name !== 'sha1') {
    return null
  }

  return mh.digest
}
