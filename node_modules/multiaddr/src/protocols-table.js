'use strict'

const map = require('lodash.map')

function Protocols (proto) {
  if (typeof (proto) === 'number') {
    if (Protocols.codes[proto]) {
      return Protocols.codes[proto]
    }

    throw new Error('no protocol with code: ' + proto)
  } else if (typeof (proto) === 'string' || proto instanceof String) {
    if (Protocols.names[proto]) {
      return Protocols.names[proto]
    }

    throw new Error('no protocol with name: ' + proto)
  }

  throw new Error('invalid protocol id type: ' + proto)
}

const V = -1
Protocols.lengthPrefixedVarSize = V
Protocols.V = V

Protocols.table = [
  [4, 32, 'ip4'],
  [6, 16, 'tcp'],
  [17, 16, 'udp'],
  [33, 16, 'dccp'],
  [41, 128, 'ip6'],
  [54, V, 'dns4', 'resolvable'],
  [55, V, 'dns6', 'resolvable'],
  [56, V, 'dnsaddr', 'resolvable'],
  [132, 16, 'sctp'],
  // all of the below use varint for size
  [302, 0, 'utp'],
  [421, Protocols.lengthPrefixedVarSize, 'ipfs'],
  [480, 0, 'http'],
  [443, 0, 'https'],
  [460, 0, 'quic'],
  [477, 0, 'ws'],
  [478, 0, 'wss'],
  [479, 0, 'p2p-websocket-star'],
  [275, 0, 'p2p-webrtc-star'],
  [276, 0, 'p2p-webrtc-direct'],
  [290, 0, 'p2p-circuit']
]

Protocols.names = {}
Protocols.codes = {}

// populate tables
map(Protocols.table, function (row) {
  const proto = p.apply(null, row)
  Protocols.codes[proto.code] = proto
  Protocols.names[proto.name] = proto
})

Protocols.object = p

function p (code, size, name, resolvable) {
  return {
    code: code,
    size: size,
    name: name,
    resolvable: Boolean(resolvable)
  }
}

module.exports = Protocols
