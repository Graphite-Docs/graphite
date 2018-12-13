# js-datastore-core

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Build Status](https://travis-ci.org/ipfs/js-datastore-core.svg)](https://travis-ci.org/ipfs/js-datastore-core) [![Circle CI](https://circleci.com/gh/ipfs/js-datastore-core.svg?style=svg)](https://circleci.com/gh/ipfs/js-datastore-core)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-datastore-core/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-datastore-core?branch=master) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/ipfs/js-datastore-core)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

> Wrapping implmentations for [interface-datastore](https://github.com/ipfs/interface-datastore).


## Table of Contents

- [Implementations](#implementations)
- [Install](#install)
- [Usage](#usage)
- [Api](#api)
- [Contribute](#contribute)
- [License](#license)

## Implementations

- Wrapper Implementations
  - Mount: [`src/mount`](src/mount.js)
  - Keytransform: [`src/keytransform`](src/keytransform.js)
  - Sharding: [`src/sharding`](src/sharding.js)
  - Tiered: [`src/tiered`](src/tirered.js)
  - Namespace: [`src/tiered`](src/namespace.js)

## Install

```
$ npm install datastore-core
```

## Usage

### Wrapping Stores

```js
const MemoryStore = require('interface-datastore').MemoryDatastore
const MountStore = require('datastore-core').MountDatastore
const Key = require('interface-datastore').Key

const store = new MountStore({prefix: new Key('/a'), datastore: new MemoryStore()})
```

## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT 2017 © IPFS
