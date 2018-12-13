js-mafmt
========

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/whyrusleeping/js-mafmt/badge.svg?branch=master)](https://coveralls.io/github/whyrusleeping/js-mafmt?branch=master)
[![Travis CI](https://travis-ci.org/whyrusleeping/js-mafmt.svg?branch=master)](https://travis-ci.org/whyrusleeping/js-mafmt)
[![Circle CI](https://circleci.com/gh/whyrusleeping/js-mafmt.svg?style=svg)](https://circleci.com/gh/whyrusleeping/js-mafmt)
[![Dependency Status](https://david-dm.org/whyrusleeping/js-mafmt.svg?style=flat-square)](https://david-dm.org/whyrusleeping/js-mafmt) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> Javascript implementation of multiaddr validation

## Lead Maintainer

[Vasco Santos](https://github.com/vasco-santos).

## Install

```sh
npm install mafmt
```

## Usage

```js
const mafmt = require('msfmt')

mafmt.DNS.matches('/dns4/ipfs.io') // true
```

## API

#### `mafmt.<FORMAT>.matches(multiaddr)`

Where `<FORMAT>` may be:

| `<FORMAT>` | Description | Example(s) |
| --- | --- | --- |
| `DNS` | a "dns4" or "dns6" format multiaddr | `/dnsaddr/ipfs.io`
| `DNS4` | a "dns4" format multiaddr | `/dns4/ipfs.io` |
| `DNS6` | a "dns6" format multiaddr | `/dns6/protocol.ai/tcp/80` |
| `IP` | an "ip4" or "ip6" format multiaddr | `/ip4/127.0.0.1` <br> `/ip6/fc00::` |
| `TCP` | a "tcp" over `IP` format multiaddr | `/ip4/0.0.7.6/tcp/1234` |
| `UDP` | a "udp" over `IP` format multiaddr | `/ip4/0.0.7.6/udp/1234` |
| `UTP` | a "utp" over `UDP` format multiaddr | `/ip4/1.2.3.4/udp/3456/utp` |
| `Websockets` | a "ws" over `TCP` or "ws" over `DNS` format multiaddr | `/ip4/1.2.3.4/tcp/3456/ws` <br> `/dnsaddr/ipfs.io/ws` |
| `WebSocketsSecure` | a "wss" over `TCP` or "wss" over `DNS` format multiaddr | `/ip6/::/tcp/0/wss` <br> `/dnsaddr/ipfs.io/wss` |
| `HTTP` | a "http" over `TCP` or `DNS` or "http" over `DNS` format multiaddr | `/ip4/127.0.0.1/tcp/90/http` <br> `/dnsaddr/ipfs.io/http` |
| `HTTPS` | a "https" over `TCP` or `DNS` or "https" over `DNS` format multiaddr | `/ip4/127.0.0.1/tcp/90/https` <br> `/dnsaddr/ipfs.io/https` |
| `WebRTCStar` | an "ipfs" over "p2p-webrtc-star" over `Websockets` or "ipfs" over "p2p-webrtc-star" over `WebSocketsSecure` format multiaddr | `/dnsaddr/ipfs.io/wss/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4` |
| `WebSocketStar` | an "ipfs" over "p2p-websocket-star" over `Websockets` or "ipfs" over "p2p-websocket-star" over `WebSocketsSecure` or "p2p-websocket-star" over `Websockets` or "p2p-websocket-star" over `WebSocketsSecure` format multiaddr | `/ip4/1.2.3.4/tcp/3456/ws/p2p-websocket-star` <br> `/dnsaddr/localhost/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4` |
| `WebRTCDirect` | a "p2p-webrtc-direct" over `HTTP` or "p2p-webrtc-direct" over `HTTPS` format multiaddr | `/ip4/1.2.3.4/tcp/3456/http/p2p-webrtc-direct` |
| `Reliable` | a `WebSockets` or `WebSocketsSecure` or `HTTP` or `HTTPS` or `WebRTCStar` or `WebRTCDirect` or `TCP` or `UTP` format multiaddr | `/dnsaddr/ipfs.io/wss` |
| `Circuit` |  | `/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4/p2p-circuit/ipfs/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj` |
| `IPFS` | "ipfs" over `Reliable` or `WebRTCStar` or "ipfs" format multiaddr | `/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4` <br> `/ip4/127.0.0.1/tcp/20008/ws/ipfs/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj` |

Where `multiaddr` may be:

* a [Multiaddr](https://www.npmjs.com/package/multiaddr)
* a String
* a [Buffer](https://www.npmjs.com/package/buffer)

Returns `true`/`false`
