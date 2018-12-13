# js-cid

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-cid/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-cid?branch=master)
[![Dependency Status](https://david-dm.org/ipld/js-cid.svg?style=flat-square)](https://david-dm.org/ipld/js-cid)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> [CID](https://github.com/ipld/cid) implementation in JavaScript.

## Lead Maintainer

[Volker Mische](https://github.com/vmx)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Install

### In Node.js through npm

```bash
$ npm install --save cids
```

### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact an ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```js
const CID = require('cids')
```

### In the Browser through `<script>` tag

Loading this module through a script tag will make the ```Cids``` obj available in the global namespace.

```
<script src="https://unpkg.com/cids/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/cids/dist/index.js"></script>
```

#### Gotchas

You will need to use Node.js `Buffer` API compatible, if you are running inside the browser, you can access it by `multihash.Buffer` or you can install Feross's [Buffer](https://github.com/feross/buffer).

## Usage

Basic usage is quite simple.

```js
const CID = require('cids')

const cid = new CID(1, 'dag-pb', multihash)
```

If you have a base encoded string for a multihash you can also create
an instance from the encoded string.

```js
const cid = new CID(base58Multihash)
```

## API

### CID.isCid(cid)

Returns true if object is a valid CID instance, false if not valid.

It's important to use this method rather than `instanceof` checks in
order to handle CID objects from different versions of this module.

### CID.validateCID(cid)

Validates the different components (version, codec, multihash) of the CID
instance. Returns true if valid, false if not valid.

### new CID(version, codec, multihash)

`version` must be either 0 or 1.

`codec` must be a string of a valid [registered codec](https://github.com/multiformats/multicodec/blob/master/table.csv).

`multihash` must be a `Buffer` instance of a valid [multihash](https://github.com/multiformats/multihash).

### new CID(baseEncodedString)

Additionally, you can instantiate an instance from a base encoded
string.

### new CID(Buffer)

Additionally, you can instantiate an instance from a buffer.

#### cid.codec

Property containing the codec string.

#### cid.version

Property containing the CID version integer.

#### cid.multihash

Property containing the multihash buffer.

#### cid.buffer

Property containing the full CID encoded as a `Buffer`.

#### cid.prefix

Proprety containing a buffer of the CID version, codec, and the prefix
section of the multihash.

#### cid.toV0()

Returns the CID encoded in version 0. Only works for `dag-pb` codecs.

Throws if codec is not `dag-pb`.

#### cid.toV1()

Returns the CID encoded in version 1.

#### cid.toBaseEncodedString(base='base58btc')

Returns a base encodec string of the CID. Defaults to `base58btc`.

#### cid.equals(cid)

Compare cid instance. Returns true if CID's are identical, false if
otherwise.

## Contribute

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

Contributions welcome. Please check out [the issues](https://github.com/ipld/js-cid/issues).

Check out our [contributing document](https://github.com/ipfs/community/blob/master/contributing.md) for more information on how we work, and about contributing in general. Please be aware that all interactions related to multiformats are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT
