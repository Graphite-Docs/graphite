'use strict'

const map = require('lodash.map')
const filter = require('lodash.filter')
const convert = require('./convert')
const protocols = require('./protocols-table')
const varint = require('varint')

// export codec
module.exports = {
  stringToStringTuples: stringToStringTuples,
  stringTuplesToString: stringTuplesToString,

  tuplesToStringTuples: tuplesToStringTuples,
  stringTuplesToTuples: stringTuplesToTuples,

  bufferToTuples: bufferToTuples,
  tuplesToBuffer: tuplesToBuffer,

  bufferToString: bufferToString,
  stringToBuffer: stringToBuffer,

  fromString: fromString,
  fromBuffer: fromBuffer,
  validateBuffer: validateBuffer,
  isValidBuffer: isValidBuffer,
  cleanPath: cleanPath,

  ParseError: ParseError,
  protoFromTuple: protoFromTuple,

  sizeForAddr: sizeForAddr
}

// string -> [[str name, str addr]... ]
function stringToStringTuples (str) {
  const tuples = []
  const parts = str.split('/').slice(1) // skip first empty elem
  if (parts.length === 1 && parts[0] === '') {
    return []
  }

  for (let p = 0; p < parts.length; p++) {
    const part = parts[p]
    const proto = protocols(part)

    if (proto.size === 0) {
      tuples.push([part])
      continue
    }

    p++ // advance addr part
    if (p >= parts.length) {
      throw ParseError('invalid address: ' + str)
    }

    tuples.push([part, parts[p]])
  }

  return tuples
}

// [[str name, str addr]... ] -> string
function stringTuplesToString (tuples) {
  const parts = []
  map(tuples, function (tup) {
    const proto = protoFromTuple(tup)
    parts.push(proto.name)
    if (tup.length > 1) {
      parts.push(tup[1])
    }
  })

  return '/' + parts.join('/')
}

// [[str name, str addr]... ] -> [[int code, Buffer]... ]
function stringTuplesToTuples (tuples) {
  return map(tuples, function (tup) {
    if (!Array.isArray(tup)) {
      tup = [tup]
    }
    const proto = protoFromTuple(tup)
    if (tup.length > 1) {
      return [proto.code, convert.toBuffer(proto.code, tup[1])]
    }
    return [proto.code]
  })
}

// [[int code, Buffer]... ] -> [[str name, str addr]... ]
function tuplesToStringTuples (tuples) {
  return map(tuples, function (tup) {
    const proto = protoFromTuple(tup)
    if (tup.length > 1) {
      return [proto.code, convert.toString(proto.code, tup[1])]
    }
    return [proto.code]
  })
}

// [[int code, Buffer ]... ] -> Buffer
function tuplesToBuffer (tuples) {
  return fromBuffer(Buffer.concat(map(tuples, function (tup) {
    const proto = protoFromTuple(tup)
    let buf = Buffer.from(varint.encode(proto.code))

    if (tup.length > 1) {
      buf = Buffer.concat([buf, tup[1]]) // add address buffer
    }

    return buf
  })))
}

function sizeForAddr (p, addr) {
  if (p.size > 0) {
    return p.size / 8
  } else if (p.size === 0) {
    return 0
  } else {
    const size = varint.decode(addr)
    return size + varint.decode.bytes
  }
}

// Buffer -> [[int code, Buffer ]... ]
function bufferToTuples (buf) {
  const tuples = []
  let i = 0
  while (i < buf.length) {
    const code = varint.decode(buf, i)
    const n = varint.decode.bytes

    const p = protocols(code)

    const size = sizeForAddr(p, buf.slice(i + n))

    if (size === 0) {
      tuples.push([code])
      i += n
      continue
    }

    const addr = buf.slice(i + n, i + n + size)

    i += (size + n)

    if (i > buf.length) { // did not end _exactly_ at buffer.length
      throw ParseError('Invalid address buffer: ' + buf.toString('hex'))
    }

    // ok, tuple seems good.
    tuples.push([code, addr])
  }

  return tuples
}

// Buffer -> String
function bufferToString (buf) {
  const a = bufferToTuples(buf)
  const b = tuplesToStringTuples(a)
  return stringTuplesToString(b)
}

// String -> Buffer
function stringToBuffer (str) {
  str = cleanPath(str)
  const a = stringToStringTuples(str)
  const b = stringTuplesToTuples(a)

  return tuplesToBuffer(b)
}

// String -> Buffer
function fromString (str) {
  return stringToBuffer(str)
}

// Buffer -> Buffer
function fromBuffer (buf) {
  const err = validateBuffer(buf)
  if (err) throw err
  return Buffer.from(buf) // copy
}

function validateBuffer (buf) {
  try {
    bufferToTuples(buf) // try to parse. will throw if breaks
  } catch (err) {
    return err
  }
}

function isValidBuffer (buf) {
  return validateBuffer(buf) === undefined
}

function cleanPath (str) {
  return '/' + filter(str.trim().split('/')).join('/')
}

function ParseError (str) {
  return new Error('Error parsing address: ' + str)
}

function protoFromTuple (tup) {
  const proto = protocols(tup[0])
  return proto
}
