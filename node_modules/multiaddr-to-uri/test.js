const test = require('ava')
const toUri = require('./')

test('should convert multiaddr to URI', (t) => {
  const data = [
    ['/ip4/127.0.0.1', '127.0.0.1'],
    ['/ip4/127.0.0.1/http', 'http://127.0.0.1'],
    ['/ip6/fc00::', 'fc00::'],
    ['/ip6/fc00::/http', 'http://fc00::'],
    ['/ip4/0.0.7.6/tcp/1234', 'tcp://0.0.7.6:1234'],
    ['/ip6/::/tcp/0', 'tcp://:::0'],
    ['/ip4/0.0.7.6/udp/1234', 'udp://0.0.7.6:1234'],
    ['/ip6/::/udp/0', 'udp://:::0'],
    ['/dnsaddr/ipfs.io', 'ipfs.io'],
    ['/dns4/ipfs.io', 'ipfs.io'],
    ['/dns4/libp2p.io', 'libp2p.io'],
    ['/dns6/protocol.ai', 'protocol.ai'],
    ['/dns4/protocol.ai/tcp/80', 'tcp://protocol.ai:80'],
    ['/dns6/protocol.ai/tcp/80', 'tcp://protocol.ai:80'],
    ['/dnsaddr/protocol.ai/tcp/80', 'tcp://protocol.ai:80'],
    ['/dnsaddr/ipfs.io/ws', 'ws://ipfs.io'],
    ['/dnsaddr/ipfs.io/http', 'http://ipfs.io'],
    ['/dnsaddr/ipfs.io/https', 'https://ipfs.io'],
    ['/ip4/1.2.3.4/tcp/3456/ws', 'ws://1.2.3.4:3456'],
    ['/ip6/::/tcp/0/ws', 'ws://:::0'],
    ['/dnsaddr/ipfs.io/wss', 'wss://ipfs.io'],
    ['/ip4/1.2.3.4/tcp/3456/wss', 'wss://1.2.3.4:3456'],
    ['/ip6/::/tcp/0/wss', 'wss://:::0'],
    [
      '/ip4/1.2.3.4/tcp/3456/ws/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo',
      'ws://1.2.3.4:3456/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo'
    ],
    [
      '/dnsaddr/ipfs.io/ws/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
      'ws://ipfs.io/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4'
    ],
    [
      '/dnsaddr/ipfs.io/wss/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
      'wss://ipfs.io/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4'
    ],
    [
      '/ip6/::/tcp/0/ws/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo5',
      'ws://:::0/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo5'
    ],
    [
      '/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/ipfs/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
      'wss://wrtc-star.discovery.libp2p.io:443/p2p-webrtc-star/ipfs/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79'
    ],
    ['/ip4/1.2.3.4/tcp/3456/http/p2p-webrtc-direct', 'http://1.2.3.4:3456/p2p-webrtc-direct'],
    ['/ip6/::/tcp/0/http/p2p-webrtc-direct', 'http://:::0/p2p-webrtc-direct'],
    ['/ip4/1.2.3.4/tcp/3456/ws/p2p-websocket-star', 'ws://1.2.3.4:3456/p2p-websocket-star'],
    ['/ip6/::/tcp/0/ws/p2p-websocket-star', 'ws://:::0/p2p-websocket-star'],
    [
      '/dnsaddr/localhost/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
      'ws://localhost/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4'
    ],
    [
      '/ip4/1.2.3.4/tcp/3456/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
      'ws://1.2.3.4:3456/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4'
    ],
    [
      '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star/ipfs/Qma3uqwymdqwXtC4uvmqqwwMhTDHD7xp9FzM75tQB5qRM3',
      'wss://ws-star.discovery.libp2p.io:443/p2p-websocket-star/ipfs/Qma3uqwymdqwXtC4uvmqqwwMhTDHD7xp9FzM75tQB5qRM3'
    ],
    [
      '/ip4/127.0.0.1/tcp/20008/ws/ipfs/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj',
      'ws://127.0.0.1:20008/ipfs/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj'
    ],
    [
      '/ip4/1.2.3.4/tcp/3456/ws/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
      'ws://1.2.3.4:3456/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4'
    ],
    [
      '/ip4/1.2.3.4/tcp/3456/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
      'tcp://1.2.3.4:3456/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4'
    ]
  ]

  data.forEach(d => t.is(toUri(d[0]), d[1]))
})

test('should throw for unsupported protocol', (t) => {
  t.throws(() => toUri('/quic'))
})
