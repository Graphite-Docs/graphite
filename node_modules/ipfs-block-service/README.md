# IPFS Block Service

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-block-service.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-block-service)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-block-service/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-block-service?branch=master)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs-block-service.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block-service)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

> [IPFS][ipfs] implementation of the BlockService and Block data structure in JavaScript.

**BlockService** - A BlockService is a content-addressable store for blocks, providing an API for adding, deleting, and retrieving blocks. A BlockService is backed by an [IPFS Repo][repo] as its datastore for blocks, and uses [Bitswap][bitswap] to fetch blocks from the network.

```markdown
┌───────────────────┐
│    BlockService   │
└───────────────────┘
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌───────┐
│IPFS Repo│ |Bitswap│
└─────────┘ └───────┘
```

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
- [Contribute](#contribute)
- [License](#license)

## Install

### npm

```sh
> npm install ipfs-block-service
```

## Usage

### Node.js

```js
const BlockService = require('ipfs-block-service')
```


### Example

```js
const BlockService = require('ipfs-block-service')
const Block = require('ipfs-block')
const multihashing = require('multihashing-async')
const IPFSRepo = require('ipfs-repo')  // storage repo

// setup a repo
const repo = new IPFSRepo('example')

// create a block
const data = new Buffer('hello world')
multihashing(data, 'sha2-256', (err, multihash) => {
  if (err) {
    throw err
  }

  const cid = new CID(multihash)
  const block = new Block(data, cid)

  // create a service
  const bs = new BlockService(repo)

  // add the block, then retrieve it
  bs.put(block, (err) => {
    if (err) {
      throw err
    }
    bs.get(cid, (err, b) => {
      if (err) {
        throw err
      }
      console.log(block.data.toString() === b.data.toString())
      // => true
    })
  })
})
```

### Browser: Browserify, Webpack, other bundlers

```JavaScript
var BlockService = require('ipfs-block-service')
```

### Browser: `<script>` Tag

Loading this module through a script tag will make the `IpfsBlockService` obj available in
the global namespace.

```html
<script src="https://unpkg.com/ipfs-block-service/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/ipfs-block-service/dist/index.js"></script>
```

## API

See https://ipfs.github.io/js-ipfs-block-service

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-block-service/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)

[ipfs]: https://ipfs.io
[bitswap]: https://github.com/ipfs/specs/tree/master/bitswap
[repo]: https://github.com/ipfs/specs/tree/master/repo
