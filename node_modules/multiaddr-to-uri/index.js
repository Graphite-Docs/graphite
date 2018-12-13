const Multiaddr = require('multiaddr')
const reduceValue = (_, v) => v

const Reducers = {
  ip4: reduceValue,
  ip6: reduceValue,
  tcp: (str, content, i, parts) => (
    parts.some(p => ['http', 'https', 'ws', 'wss'].includes(p.protocol))
      ? `${str}:${content}`
      : `tcp://${str}:${content}`
  ),
  udp: (str, content) => `udp://${str}:${content}`,
  dnsaddr: reduceValue,
  dns4: reduceValue,
  dns6: reduceValue,
  ipfs: (str, content) => `${str}/ipfs/${content}`,
  p2p: (str, content) => `${str}/p2p/${content}`,
  http: str => `http://${str}`,
  https: str => `https://${str}`,
  ws: str => `ws://${str}`,
  wss: str => `wss://${str}`,
  'p2p-websocket-star': str => `${str}/p2p-websocket-star`,
  'p2p-webrtc-star': str => `${str}/p2p-webrtc-star`,
  'p2p-webrtc-direct': str => `${str}/p2p-webrtc-direct`
}

module.exports = (multiaddr) => (
  Multiaddr(multiaddr)
    .stringTuples()
    .map(tuple => ({
      protocol: Multiaddr.protocols.codes[tuple[0]].name,
      content: tuple[1]
    }))
    .reduce((str, part, i, parts) => {
      const reduce = Reducers[part.protocol]
      if (!reduce) throw new Error(`Unsupported protocol ${part.protocol}`)
      return reduce(str, part.content, i, parts)
    }, '')
)
