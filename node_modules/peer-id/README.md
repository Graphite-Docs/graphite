# peer-id

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://travis-ci.org/libp2p/js-peer-id.svg?style=flat-square)](https://travis-ci.org/libp2p/js-peer-id)
[![Coverage Status](https://coveralls.io/repos/github/libp2p/js-peer-id/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-peer-id?branch=master)
[![Dependency Status](https://david-dm.org/libp2p/js-peer-id.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-id)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D6.0.0-orange.svg?style=flat-square)

> [IPFS](https://github.com/ipfs/ipfs) Peer ID implementation in JavaScript.

## Lead Maintainer

[Pedro Teixeira](https://github.com/pgte)

## Table of Contents

- [Description](#description)
- [Example](#example)
- [Installation](#installation)
  - [npm](#npm)
- [Setup](#setup)
  - [Node.js](#nodejs)
  - [Browser: Browserify, Webpack, other bundlers](#browser-browserify-webpack-other-bundlers)
  - [Browser: `<script>` Tag](#browser-script-tag)
- [API](#api)
  - [Create](#create)
    - [`new PeerId(id[, privKey, pubKey])`](#new-peeridid-privkey-pubkey)
    - [`create([opts], callback)`](#createopts-callback)
  - [Import](#import)
    - [`createFromHexString(str)`](#createfromhexstringstr)
    - [`createFromBytes(buf)`](#createfrombytesbuf)
    - [`createFromB58String(str)`](#createfromb58stringstr)
    - [`createFromPubKey(pubKey)`](#createfrompubkeypubkey)
    - [`createFromPrivKey(privKey)`](#createfromprivkeyprivkey)
    - [`createFromJSON(obj)`](#createfromjsonobj)
  - [Export](#export)
    - [`toHexString()`](#tohexstring)
    - [`toBytes()`](#tobytes)
    - [`toB58String()`](#tob58string)
    - [`toJSON()`](#tojson)
    - [`toPrint()`](#toprint)
- [License](#license)

# Description

Generate, import, and export PeerIDs, for use with [IPFS](https://github.com/ipfs/ipfs).

A Peer ID is the SHA-256 [multihash](https://github.com/multiformats/multihash) of a public key.

The public key is a base64 encoded string of a protobuf containing an RSA DER buffer. This uses a node buffer to pass the base64 encoded public key protobuf to the multihash for ID generation.

# Example

```JavaScript
const PeerId = require('peer-id')

PeerId.create({ bits: 1024 }, (err, id) => {
  if (err) { throw err }
  console.log(JSON.stringify(id.toJSON(), null, 2))
})
```
```bash
{
  "id": "Qma9T5YraSnpRDZqRR4krcSJabThc8nwZuJV3LercPHufi",
  "privKey": "CAAS4AQwggJcAgEAAoGBAMBgbIqyOL26oV3nGPBYrdpbv..",
  "pubKey": "CAASogEwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAMBgbIqyOL26oV3nGPBYrdpbvzCY..."
}
```

# Installation

## npm

```sh
> npm i peer-id
```

# Setup

## Node.js

```js
const PeerId = require('peer-id')
```

## Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact a ES5
transpiled version with the right shims added. This means that you can require
it and use with your favourite bundler without having to adjust asset management
process.

```js
const PeerId = require('peer-id')
```

## Browser: `<script>` Tag

Loading this module through a script tag will make the `PeerId` obj available in
the global namespace.

```html
<script src="https://unpkg.com/peer-id/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/peer-id/dist/index.js"></script>
```

# API

```js
const PeerId = require('peer-id')
```

## Create

### `new PeerId(id[, privKey, pubKey])`

- `id: Buffer` - The multihash of the publick key as `Buffer`
- `privKey: RsaPrivateKey` - The private key
- `pubKey: RsaPublicKey` - The public key

The key format is detailed in [libp2p-crypto](https://github.com/libp2p/js-libp2p-crypto).

### `create([opts], callback)`

Generates a new Peer ID, complete with public/private keypair.

- `opts: Object`: Default: `{bits: 2048}`
- `callback: Function`

Calls back `callback` with `err, id`.

## Import

### `createFromHexString(str)`

Creates a Peer ID from hex string representing the key's multihash.

### `createFromBytes(buf)`

Creates a Peer ID from a buffer representing the key's multihash.

### `createFromB58String(str)`

Creates a Peer ID from a Base58 string representing the key's multihash.

### `createFromPubKey(pubKey)`

- `publicKey: Buffer`

Creates a Peer ID from a buffer containing a public key.

### `createFromPrivKey(privKey)`

- `privKey: Buffer`

Creates a Peer ID from a buffer containing a private key.

### `createFromJSON(obj)`

- `obj.id: String` - The multihash encoded in `base58`
- `obj.pubKey: String` - The public key in protobuf format, encoded in `base64`
- `obj.privKey: String` - The private key in protobuf format, encoded in `base64`

## Export

### `toHexString()`

Returns the Peer ID's `id` as a hex string.

```
1220d6243998f2fc56343ad7ed0342ab7886a4eb18d736f1b67d44b37fcc81e0f39f
```

### `toBytes()`

Returns the Peer ID's `id` as a buffer.

```
<Buffer 12 20 d6 24 39 98 f2 fc 56 34 3a d7 ed 03 42 ab 78 86 a4 eb 18 d7 36 f1 b6 7d 44 b3 7f cc 81 e0 f3 9f>
```

### `toB58String()`

Returns the Peer ID's `id` as a base58 string.

```
QmckZzdVd72h9QUFuJJpQqhsZqGLwjhh81qSvZ9BhB2FQi
```

### `toJSON()`

Returns an `obj` of the form

- `obj.id: String` - The multihash encoded in `base58`
- `obj.pubKey: String` - The public key in protobuf format, encoded in 'base64'
- `obj.privKey: String` - The private key in protobuf format, encoded in 'base 64'

### `toPrint()`

Returns the Peer ID as a printable string without the `Qm` prefix.

Example: `<peer.ID xxxxxx>`

### `isEqual(id)`

- `id` can be a PeerId or a Buffer containing the id

# License

MIT
