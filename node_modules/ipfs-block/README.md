# IPFS Block JavaScript Implementation

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Travis CI](https://travis-ci.org/ipfs/js-ipfs-block.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-block)
[![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-block.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-block)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-block/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-block?branch=master)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs-block.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

> [IPFS][ipfs] implementation of the Block data structure in JavaScript.

**Block** - A block is a blob of binary data.

## Lead Maintainer

[Volker Mische](https://github.com/vmx)

## Table of Contents

- [Install](#install)
  - [npm](#npm)
- [Usage](#usage)
  - [Node.js](#nodejs)
    - [Example](#example)
  - [Browser: Browserify, Webpack, other bundlers](#browser-browserify-webpack-other-bundlers)
  - [Browser: `<script>` Tag](#browser-script-tag)
- [API](#api)
  - [Block](#block)
    - [`new Block(data, cid)`](#new-blockdata-cid)
    - [`block.data`](#blockdata)
    - [`block.cid`](#blockcid)
- [Contribute](#contribute)
- [License](#license)

## Install

### npm

```sh
> npm install ipfs-block
```

## Usage

### Node.js

```js
const Block = require('ipfs-block')
```

#### Example

```js
const Block = require('ipfs-block')

// create a block
const block = new Block(new Buffer('hello world'), cid)
console.log(block.data.toString())
```

### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact a ES5
transpiled version with the right shims added. This means that you can require
it and use with your favourite bundler without having to adjust asset management
process.

```js
const Block = require('ipfs-block')
```

### Browser: `<script>` Tag

Loading this module through a script tag will make the `IpfsBlock` obj available in
the global namespace.

```html
<script src="https://unpkg.com/ipfs-block/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/ipfs-block/dist/index.js"></script>
```

## API

```js
const Block = require('ipfs-block')
```

### Block

#### `new Block(data, cid)`

- `data: Buffer`

Creates a new block with raw data `data`.

#### `block.data`

The raw data of the block. Its format matches whatever was provided in its constructor.

#### `block.cid`

The cid of the block.

[ipfs]: https://ipfs.io
[multihash]: https://github.com/jbenet/js-multihash

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-block/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
