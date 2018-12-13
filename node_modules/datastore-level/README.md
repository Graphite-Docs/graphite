# js-datastore-level

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://coveralls.io/repos/github/ipfs/js-datastore-level/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-datastore-level?branch=master) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/ipfs/js-datastore-level)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

> Datastore implementation with [levelup](https://github.com/level/levelup) backend.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Browser Shimming Leveldown](#browser-shimming-leveldown)
- [Contribute](#contribute)
- [License](#license)

## Install

```
$ npm install datastore-level
```

## Usage

```js
const LevelStore = require('datastore-level')
// Default using leveldown as backend
const store = new LevelStore('path/to/store')

// use in the browser with level.js
const browserStore = new LevelStore('my/db/name', {db: require('level-js')})

// another leveldown compliant backend like memdown
const memStore = new LevelStore('my/mem/store', {db: require('memdown')})
```

### Browser Shimming Leveldown
As `leveldown` does not work in the browser, `LevelStore` takes advantage of the browser property in package.json to shim `level-js` in its place. Most modern bundlers such as webpack, will see the shim and replace it for use in the browser. If you are using a bundler that does not support pkg.browser, you will need to handle the shimming yourself, as was the case with versions of `LevelStore` 0.7.0 and earlier.

## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT 2017 © IPFS
