# bip32
[![Build Status](https://travis-ci.org/bitcoinjs/bip32.png?branch=master)](https://travis-ci.org/bitcoinjs/bip32)

[![NPM](https://img.shields.io/npm/v/bip32.svg)](https://www.npmjs.org/package/bip32)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

A [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) compatible library.


## Example
``` javascript
let bip32 = require('bip32')
let node = bip32.fromBase58('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi')

let child = node.derivePath('m/0/0')
// ...
```

## LICENSE [ISC](LICENSE)
