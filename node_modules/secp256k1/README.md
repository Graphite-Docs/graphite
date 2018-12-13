# secp256k1-node

[![NPM Package](https://img.shields.io/npm/v/secp256k1.svg?style=flat-square)](https://www.npmjs.org/package/secp256k1)
[![Build Status](https://img.shields.io/travis/cryptocoinjs/secp256k1-node.svg?branch=master&style=flat-square)](https://travis-ci.org/cryptocoinjs/secp256k1-node)
[![Coverage Status](https://img.shields.io/coveralls/cryptocoinjs/secp256k1-node.svg?style=flat-square)](https://coveralls.io/r/cryptocoinjs/secp256k1-node)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

This module provides native bindings to ecdsa [secp256k1](https://github.com/bitcoin/secp256k1) functions.
This library is experimental, so use at your own risk. Works on node version 0.10 or greater and in the Browser via browserify.

# Installation

If you have gmp installed secp256k1 will use it. Otherwise it should fallback to openssl.
* arch `pacman -S gmp`
* ubuntu `sudo apt-get install libgmp-dev`

##### from npm

`npm install secp256k1`

##### from git

```
git clone git@github.com:cryptocoinjs/secp256k1-node.git
cd secp256k1-node
npm install
```

# Usage

* [API Reference (v2.x)](API.md)

```js
var crypto = require('crypto')
var secp256k1 = require('secp256k1')
// or require('secp256k1/js')
//   if you want to use pure js implementation in node (uses elliptic now)
// or require('secp256k1/elliptic')
//   if implementation that uses elliptic package

// generate message to sign
var msg = crypto.randomBytes(32)

// generate privKey
var privKey
do {
  privKey = crypto.randomBytes(32)
} while (!secp256k1.secretKeyVerify(privKey))

// get the public key in a compressed format
var pubKey = secp256k1.publicKeyCreate(privKey)

// sign the message
var sigObj = secp256k1.signSync(msg, privKey)

// verify the signature
console.log(secp256k1.verifySync(msg, sigObj.signature, pubKey))
```

# LICENSE

This library is free and open-source software released under the MIT license.
