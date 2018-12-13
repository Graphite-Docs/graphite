# js-datastore-fs

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Build Status](https://travis-ci.org/ipfs/js-datastore-fs.svg)](https://travis-ci.org/ipfs/js-datastore-fs) [![Circle CI](https://circleci.com/gh/ipfs/js-datastore-fs.svg?style=svg)](https://circleci.com/gh/ipfs/js-datastore-fs)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-datastore-fs/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-datastore-fs?branch=master) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/ipfs/js-datastore-fs)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

> Datastore implementation with file system backend.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Install

```
$ npm install datastore-fs
```

## Usage

```js
const FsStore = require('datastore-fs')
const store = new FsStore('path/to/store')
```

## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT 2017 © IPFS
