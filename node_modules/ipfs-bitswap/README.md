# ipfs-bitswap

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://coveralls.io/repos/github/ipfs/js-ipfs-bitswap/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-bitswap?branch=master)
[![](https://travis-ci.org/ipfs/js-ipfs-bitswap.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-bitswap)
[![](https://circleci.com/gh/ipfs/js-ipfs-bitswap.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-bitswap)
[![](https://david-dm.org/ipfs/js-ipfs-bitswap.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-bitswap)
[![](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

> JavaScript implementation of the Bitswap 'data exchange' protocol used by IPFS

## Lead Maintainer

[Volker Mische](https://github.com/vmx)

## Table of Contents

- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
  - [Use in a browser with browserify, webpack or any other bundler](#use-in-a-browser-with-browserify-webpack-or-any-other-bundler)
  - [Use in a browser using a script tag](#use-in-a-browser-using-a-script-tag)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Install

### npm

```bash
> npm install ipfs-bitswap
```

### Use in Node.js or in the browser with browserify, webpack or any other bundler

```js
const Bitswap = require('ipfs-bitswap')
```

### Use in a browser using a script tag

Loading this module through a script tag will make the `IpfsBitswap` object available in the global namespace.

```html
<script src="https://unpkg.com/ipfs-bitswap/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/ipfs-bitswap/dist/index.js"></script>
```

## API

See https://ipfs.github.io/js-ipfs-bitswap

### Stats

```js
const bitswapNode = // ...

const stats = bitswapNode.stat()
```

Stats contains a snapshot accessor, a moving average acessor and a peer accessor.

Besides that, it emits "update" events every time it is updated.

```js
stats.on('update', (stats) => {
  console.log('latest stats snapshot: %j', stats)
})
```

#### Peer accessor:

You can get the stats for a specific peer by doing:

```js
const peerStats = stats.forPeer(peerId)
```

The returned object behaves like the root stats accessor (has a snapshot, a moving average accessors and is an event emitter).

#### Global snapshot accessor:

```js
const snapshot = stats.snapshot
console.log('stats: %j', snapshot)
```

the snapshot will contain the following keys, with the values being [Big.js](https://github.com/MikeMcl/big.js#readme) instances:

```js
// stats: {
//   "dataReceived":"96",
//   "blocksReceived":"2",
//   "dataReceived":"96",
//   "dupBlksReceived":"0",
//   "dupDataReceived":"0",
//   "blocksSent":"0",
//   "dataSent":"0",
//   "providesBufferLength":"0",
//   "wantListLength":"0",
//   "peerCount":"1"
// }
```

#### Moving average accessor:

```js
const movingAverages = stats.movingAverages
```

This object contains these properties:

* 'blocksReceived',
* 'dataReceived',
* 'dupBlksReceived',
* 'dupDataReceived',
* 'blocksSent',
* 'dataSent',
* 'providesBufferLength',
* 'wantListLength',
* 'peerCount'

```js
const dataReceivedMovingAverages = movingAverages.dataReceived
```

Each one of these will contain one key per interval (miliseconds), being the default intervals defined:

* 60000 (1 minute)
* 300000 (5 minutes)
* 900000 (15 minutes)

You can then select one of them

```js
const oneMinuteDataReceivedMovingAverages = dataReceivedMovingAverages[60000]
```

This object will be a [movingAverage](https://github.com/pgte/moving-average#readme) instance.

## Development

### Structure

![](/img/architecture.png)

```sh
» tree src
src
├── constants.js
├── decision-engine
│   ├── index.js
│   └── ledger.js
├── index.js
├── network.js             # Handles peerSet and open new conns
├── notifications.js       # Handles tracking of incomning blocks and wants/unwants.
├─── want-manager          # Keeps track of all blocks the peer (self) wants
│   ├── index.js
│   └── msg-queue.js       # Messages to send queue, one per peer
└─── types
    ├── message            # (Type) message that is put in the wire
    │   ├── entry.js
    │   ├── index.js
    │   └── message.proto.js
    └── wantlist           # (Type) track wanted blocks
        ├── entry.js
        └── index.js
```

## Performance tests

You can run performance tests like this:

```
$ npm run benchmarks
```

### Profiling

You can run each of the individual performance tests with a profiler like 0x.

To do that, you need to install 0x:

```bash
$ npm install 0x --global
```

And then run the test:

```bash
$ 0x test/benchmarks/get-many
```

This will output a flame graph and print the location for it.
Use the browser Chrome to open and inspect the generated graph.

![Flame graph](https://ipfs.io/ipfs/QmVbyLgYfkLewNtzTAFwAEMmP2hTJgs8sSqsRTBNBjyQ1y)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-bitswap/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
