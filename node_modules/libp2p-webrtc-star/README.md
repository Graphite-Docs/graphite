# js-libp2p-webrtc-star

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Travis](https://travis-ci.org/libp2p/js-libp2p-webrtc-star.svg?style=flat-square)](https://travis-ci.org/libp2p/js-libp2p-webrtc-star)
[![Circle](https://circleci.com/gh/libp2p/js-libp2p-webrtc-star.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-webrtc-star)
[![Coverage](https://coveralls.io/repos/github/libp2p/js-libp2p-webrtc-star/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-webrtc-star?branch=master)
[![david-dm](https://david-dm.org/libp2p/js-libp2p-webrtc-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-webrtc-star)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D6.0.0-orange.svg?style=flat-square)

[![](https://raw.githubusercontent.com/libp2p/interface-transport/master/img/badge.png)](https://github.com/libp2p/interface-transport)
[![](https://raw.githubusercontent.com/libp2p/interface-connection/master/img/badge.png)](https://github.com/libp2p/interface-connection)
[![](https://github.com/libp2p/interface-peer-discovery/raw/master/img/badge.png)](https://github.com/libp2p/interface-peer-discovery)

> libp2p WebRTC transport that includes a discovery mechanism provided by the signalling-star

## Lead Maintainer

[Vasco Santos](https://github.com/vasco-santos).

## Description

`libp2p-webrtc-star` is one of the WebRTC transports available for libp2p. `libp2p-webrtc-star` incorporates both a transport and a discovery service that is facilitated by the signalling server, also part of this module.

## Usage

### Install

```bash
> npm install libp2p-webrtc-star
```

## Usage

### Using this module in Node.js (read: not in the browser)

To use this module in Node.js, you have to BYOI of WebRTC, there are multiple options out there, unfortunately, none of them are 100% solid. The ones we recommend are: [wrtc](http://npmjs.org/wrtc) and [electron-webrtc](https://www.npmjs.com/package/electron-webrtc).

Instead of just creating the WebRTCStar instance without arguments, you need to pass an options object with the WebRTC implementation:

```JavaScript
const wrtc = require('wrtc')
const electronWebRTC = require('electron-webrtc')
const WStar = require('libp2p-webrtc-star')

// Using wrtc
const ws1 = new WStar({ wrtc: wrtc })

// Using electron-webrtc
const ws2 = new WStar({ wrtc: electronWebRTC() })
```

### Using this module in the Browser

```JavaScript
const WStar = require('libp2p-webrtc-star')

const ws = new WStar()
```

## API

### Transport

[![](https://raw.githubusercontent.com/libp2p/interface-transport/master/img/badge.png)](https://github.com/libp2p/interface-transport)

### Connection

[![](https://raw.githubusercontent.com/libp2p/interface-connection/master/img/badge.png)](https://github.com/libp2p/interface-connection)

### Peer Discovery - `ws.discovery`

[![](https://github.com/libp2p/interface-peer-discovery/raw/master/img/badge.png)](https://github.com/libp2p/interface-peer-discovery)

## Rendezvous server (aka Signalling server)

Nodes using `libp2p-webrtc-star` will connect to a known point in the network, a rendezvous point where they can learn about other nodes (Discovery) and exchange their [SDP offers (signalling data)](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/).

`libp2p-webrtc-star` comes with its own signalling server, used for peers to handshake their signalling data and establish a connection. You can install it in your machine by installing the module globally:

```bash
> npm install --global libp2p-webrtc-star
```

This will expose a `webrtc-star` cli tool. To spawn a server do:

```bash
> star-signal --port=9090 --host=127.0.0.1
```

Defaults:

- `port` - 13579
- `host` - '0.0.0.0'

## Hosted Rendezvous Server

We host a signalling server at `star-signal.cloud.ipfs.team` that can be used for practical demos and experimentation, it **should not be used for apps in production**.
A libp2p-webrtc-star address, using the signalling server we provide, looks like: 

`/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star/ipfs/<your-peer-id>`

Note: The address above indicates WebSockets Secure, which can be accessed from both http and https.
