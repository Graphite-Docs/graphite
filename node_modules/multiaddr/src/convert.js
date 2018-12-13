'use strict'

const ip = require('ip')
const ipAddress = require('ip-address')
const protocols = require('./protocols-table')
const bs58 = require('bs58')
const varint = require('varint')

module.exports = Convert

// converts (serializes) addresses
function Convert (proto, a) {
  if (a instanceof Buffer) {
    return Convert.toString(proto, a)
  } else {
    return Convert.toBuffer(proto, a)
  }
}

Convert.toString = function convertToString (proto, buf) {
  proto = protocols(proto)
  switch (proto.code) {
    case 4: // ipv4
    case 41: // ipv6
      return ip.toString(buf)

    case 6: // tcp
    case 17: // udp
    case 33: // dccp
    case 132: // sctp
      return buf2port(buf)

    case 54: // dns4
    case 55: // dns6
    case 56: // dnsaddr
      return buf2str(buf)

    case 421: // ipfs
      return buf2mh(buf)
    default:
      return buf.toString('hex') // no clue. convert to hex
  }
}

Convert.toBuffer = function convertToBuffer (proto, str) {
  proto = protocols(proto)
  switch (proto.code) {
    case 4: // ipv4
      return ip2buf(new ipAddress.Address4(str))
    case 41: // ipv6
      return ip2buf(new ipAddress.Address6(str))

    case 6: // tcp
    case 17: // udp
    case 33: // dccp
    case 132: // sctp
      return port2buf(parseInt(str, 10))

    case 54: // dns4
    case 55: // dns6
    case 56: // dnsaddr
      return str2buf(str)

    case 421: // ipfs
      return mh2buf(str)
    default:
      return Buffer.from(str, 'hex') // no clue. convert from hex
  }
}

function ip2buf (ipaddr) {
  if (!ipaddr.isValid()) throw new Error('invalid ip address')
  return ip.toBuffer(ipaddr.address)
}

function port2buf (port) {
  const buf = Buffer.alloc(2)
  buf.writeUInt16BE(port, 0)
  return buf
}

function buf2port (buf) {
  return buf.readUInt16BE(0)
}

function str2buf (str) {
  const buf = Buffer.from(str)
  const size = Buffer.from(varint.encode(buf.length))
  return Buffer.concat([size, buf])
}

function buf2str (buf) {
  const size = varint.decode(buf)
  buf = buf.slice(varint.decode.bytes)

  if (buf.length !== size) {
    throw new Error('inconsistent lengths')
  }

  return buf.toString()
}

function mh2buf (hash) {
  // the address is a varint prefixed multihash string representation
  const mh = Buffer.from(bs58.decode(hash))
  const size = Buffer.from(varint.encode(mh.length))
  return Buffer.concat([size, mh])
}

function buf2mh (buf) {
  const size = varint.decode(buf)
  const address = buf.slice(varint.decode.bytes)

  if (address.length !== size) {
    throw new Error('inconsistent lengths')
  }

  return bs58.encode(address)
}
