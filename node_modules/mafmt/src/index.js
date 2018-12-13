'use strict'

const multiaddr = require('multiaddr')

/*
 * Valid combinations
 */
const DNS4 = base('dns4')
const DNS6 = base('dns6')
const _DNS = or(
  base('dnsaddr'),
  DNS4,
  DNS6
)

const IP = or(base('ip4'), base('ip6'))
const TCP = or(
  and(IP, base('tcp')),
  and(_DNS, base('tcp'))
)
const UDP = and(IP, base('udp'))
const UTP = and(UDP, base('utp'))

const DNS = or(
  and(_DNS, base('tcp')),
  _DNS
)

const WebSockets = or(
  and(TCP, base('ws')),
  and(DNS, base('ws'))
)

const WebSocketsSecure = or(
  and(TCP, base('wss')),
  and(DNS, base('wss'))
)

const HTTP = or(
  and(TCP, base('http')),
  and(IP, base('http')),
  and(DNS, base('http')),
  and(DNS)
)

const HTTPS = or(
  and(TCP, base('https')),
  and(IP, base('https')),
  and(DNS, base('https'))
)

const WebRTCStar = or(
  and(WebSockets, base('p2p-webrtc-star'), base('ipfs')),
  and(WebSocketsSecure, base('p2p-webrtc-star'), base('ipfs'))
)

const WebSocketStar = or(
  and(WebSockets, base('p2p-websocket-star'), base('ipfs')),
  and(WebSocketsSecure, base('p2p-websocket-star'), base('ipfs')),
  and(WebSockets, base('p2p-websocket-star')),
  and(WebSocketsSecure, base('p2p-websocket-star'))
)

const WebRTCDirect = or(
  and(HTTP, base('p2p-webrtc-direct')),
  and(HTTPS, base('p2p-webrtc-direct'))
)

const Reliable = or(
  WebSockets,
  WebSocketsSecure,
  HTTP,
  HTTPS,
  WebRTCStar,
  WebRTCDirect,
  TCP,
  UTP
)

let _IPFS = or(
  and(Reliable, base('ipfs')),
  WebRTCStar,
  base('ipfs')
)

const _Circuit = or(
  and(_IPFS, base('p2p-circuit'), _IPFS),
  and(_IPFS, base('p2p-circuit')),
  and(base('p2p-circuit'), _IPFS),
  and(Reliable, base('p2p-circuit')),
  and(base('p2p-circuit'), Reliable),
  base('p2p-circuit')
)

const CircuitRecursive = () => or(
  and(_Circuit, CircuitRecursive),
  _Circuit
)

const Circuit = CircuitRecursive()

const IPFS = or(
  and(Circuit, _IPFS, Circuit),
  and(_IPFS, Circuit),
  and(Circuit, _IPFS),
  Circuit,
  _IPFS
)

exports.DNS = DNS
exports.DNS4 = DNS4
exports.DNS6 = DNS6
exports.IP = IP
exports.TCP = TCP
exports.UDP = UDP
exports.UTP = UTP
exports.HTTP = HTTP
exports.HTTPS = HTTPS
exports.WebSockets = WebSockets
exports.WebSocketsSecure = WebSocketsSecure
exports.WebSocketStar = WebSocketStar
exports.WebRTCStar = WebRTCStar
exports.WebRTCDirect = WebRTCDirect
exports.Reliable = Reliable
exports.Circuit = Circuit
exports.IPFS = IPFS

/*
 * Validation funcs
 */

function and () {
  const args = Array.from(arguments)

  function matches (a) {
    if (typeof a === 'string') {
      a = multiaddr(a)
    }
    let out = partialMatch(a.protoNames())
    if (out === null) {
      return false
    }
    return out.length === 0
  }

  function partialMatch (a) {
    if (a.length < args.length) {
      return null
    }
    args.some((arg) => {
      a = typeof arg === 'function'
        ? arg().partialMatch(a)
        : arg.partialMatch(a)

      if (a === null) {
        return true
      }
    })

    return a
  }

  return {
    toString: function () { return '{ ' + args.join(' ') + ' }' },
    input: args,
    matches: matches,
    partialMatch: partialMatch
  }
}

function or () {
  const args = Array.from(arguments)

  function matches (a) {
    if (typeof a === 'string') {
      a = multiaddr(a)
    }
    const out = partialMatch(a.protoNames())
    if (out === null) {
      return false
    }
    return out.length === 0
  }

  function partialMatch (a) {
    let out = null
    args.some((arg) => {
      const res = typeof arg === 'function'
        ? arg().partialMatch(a)
        : arg.partialMatch(a)
      if (res) {
        out = res
        return true
      }
    })

    return out
  }

  const result = {
    toString: function () { return '{ ' + args.join(' ') + ' }' },
    input: args,
    matches: matches,
    partialMatch: partialMatch
  }

  return result
}

function base (n) {
  const name = n

  function matches (a) {
    if (typeof a === 'string') {
      a = multiaddr(a)
    }

    const pnames = a.protoNames()
    if (pnames.length === 1 && pnames[0] === name) {
      return true
    }
    return false
  }

  function partialMatch (protos) {
    if (protos.length === 0) {
      return null
    }

    if (protos[0] === name) {
      return protos.slice(1)
    }
    return null
  }

  return {
    toString: function () { return name },
    matches: matches,
    partialMatch: partialMatch
  }
}
