# lock-me

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/dignifiedquire/lock-me/badge.svg?branch=master)](https://coveralls.io/github/dignifiedquire/lock-me?branch=master)
[![Travis CI](https://travis-ci.org/dignifiedquire/lock-me.svg?branch=master)](https://travis-ci.org/dignifiedquire/lock-me)
[![Circle CI](https://circleci.com/gh/dignifiedquire/lock-me.svg?style=svg)](https://circleci.com/gh/dignifiedquire/lock-me)
[![Dependency Status](https://david-dm.org/dignifiedquire/lock-me.svg?style=flat-square)](https://david-dm.org/dignifiedquire/lock-me)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)


> Lock files across processes. Inspired by [go4 lock](https://github.com/camlistore/go4/blob/master/lock)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Install

```bash
$ npm install lock-me
```

## Usage

```js
const Lock = require('lock-me')
const mylock = new Lock()

const lockfile = 'me.lock'

lock(lockfile, (err, lk) => {
  if (err) throw err
  // 'me.lock' is now locked

  lk.close((err) => {
    if (err) throw err
    // 'me.lock' is no longer locked
  })
})
```

When the process dies, the lock is released so no stale lock files remain.
If they do remain, `my-lock` will understand it and delete the stale file.

## Contribute

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © Friedel Ziegelmayer
