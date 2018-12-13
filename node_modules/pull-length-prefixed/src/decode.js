'use strict'

const varint = require('varint')
const Reader = require('pull-reader')
const Buffer = require('safe-buffer').Buffer
const pushable = require('pull-pushable')

exports.decode = decode
exports.decodeFromReader = decodeFromReader

const MSB = 0x80
const isEndByte = (byte) => !(byte & MSB)
const MAX_LENGTH = ((1024 * 1024) * 4)

function decode (opts) {
  let reader = new Reader()
  let p = pushable((err) => {
    reader.abort(err)
  })

  return (read) => {
    reader(read)
    function next () {
      _decodeFromReader(reader, opts, (err, msg) => {
        if (err) return p.end(err)

        p.push(msg)
        next()
      })
    }

    next()
    return p
  }
}

// wrapper to detect sudden pull-stream disconnects
function decodeFromReader (reader, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  _decodeFromReader(reader, opts, function onComplete (err, msg) {
    if (err) {
      if (err === true) return cb(new Error('Unexpected end of input from reader.'))
      return cb(err)
    }
    cb(null, msg)
  })
}

function _decodeFromReader (reader, opts, cb) {
  opts = Object.assign({
    fixed: false,
    maxLength: MAX_LENGTH
  }, opts || {})

  if (opts.fixed) {
    readFixedMessage(reader, opts.maxLength, cb)
  } else {
    readVarintMessage(reader, opts.maxLength, cb)
  }
}

function readFixedMessage (reader, maxLength, cb) {
  reader.read(4, (err, bytes) => {
    if (err) {
      return cb(err)
    }

    const msgSize = bytes.readInt32BE(0) // reads exactly 4 bytes
    if (msgSize > maxLength) {
      return cb(new Error('size longer than max permitted length of ' + maxLength + '!'))
    }

    readMessage(reader, msgSize, cb)
  })
}

function readVarintMessage (reader, maxLength, cb) {
  let rawMsgSize = []
  if (rawMsgSize.length === 0) readByte()

  // 1. Read the varint
  function readByte () {
    reader.read(1, (err, byte) => {
      if (err) {
        return cb(err)
      }

      rawMsgSize.push(byte)

      if (byte && !isEndByte(byte[0])) {
        readByte()
        return
      }

      const msgSize = varint.decode(Buffer.concat(rawMsgSize))
      if (msgSize > maxLength) {
        return cb(new Error('size longer than max permitted length of ' + maxLength + '!'))
      }
      readMessage(reader, msgSize, (err, msg) => {
        if (err) {
          return cb(err)
        }

        rawMsgSize = []

        if (msg.length < msgSize) {
          return cb(new Error('Message length does not match prefix specified length.'))
        }
        cb(null, msg)
      })
    })
  }
}

function readMessage (reader, size, cb) {
  reader.read(size, (err, msg) => {
    if (err) {
      return cb(err)
    }

    cb(null, msg)
  })
}
