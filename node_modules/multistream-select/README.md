# js-multistream-select

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-multiformats-blue.svg?style=flat-square)](https://github.com/multiformats/multiformats)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](https://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/multiformats/js-multistream-select/badge.svg?branch=master)](https://coveralls.io/github/multiformats/js-multistream-select?branch=master)
[![Travis CI](https://img.shields.io/travis/multiformats/js-multistream-select.svg?style=flat-square&branch=master)](https://travis-ci.org/multiformats/js-multistream-select)
[![Circle CI](https://circleci.com/gh/multiformats/js-multistream-select.svg?style=svg)](https://circleci.com/gh/multiformats/js-multistream-select)
[![Dependency Status](https://david-dm.org/multiformats/js-multistream-select.svg?style=flat-square)](https://david-dm.org/multiformats/js-multistream-select)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)
[![](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> JavaScript implementation of [multistream-select](https://github.com/multiformats/multistream-select).

## Lead Maintainer

[Jacob Heun](https://github.com/jacobheun)

## Table of Contents

- [Background](#background)
  - [What is multistream](#what-is-multistream)
    - [Normal mode](#normal-mode)
- [Install](#install)
  - [npm](#npm)
  - [Setup](#setup)
    - [Node.js](#nodejs)
    - [Browser: Browserify, Webpack, other bundlers](#browser-browserify-webpack-other-bundlers)
    - [Browser: `<script>` Tag](#browser-script-tag)
- [Usage](#usage)
  - [Attach multistream to a connection (socket)](#attach-multistream-to-a-connection-socket)
  - [Handling a protocol](#handling-a-protocol)
  - [Selecting a protocol](#selecting-a-protocol)
  - [Listing the available protocols](#listing-the-available-protocols)
- [API](#api)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Background

### What is multistream-select

tl;dr: multistream-select is protocol multiplexing per connection/stream. [Full spec here](https://github.com/multiformats/multistream-select)

#### Select a protocol flow

The caller will send "interactive" messages, expecting for some acknowledgement from the callee, which will "select" the handler for the desired and supported protocol

```
< /multistream-select/0.3.0  # i speak multistream-select/0.3.0
> /multistream-select/0.3.0  # ok, let's speak multistream-select/0.3.0
> /ipfs-dht/0.2.3            # i want to speak ipfs-dht/0.2.3
< na                         # ipfs-dht/0.2.3 is not available
> /ipfs-dht/0.1.9            # What about ipfs-dht/0.1.9 ?
< /ipfs-dht/0.1.9            # ok let's speak ipfs-dht/0.1.9 -- in a sense acts as an ACK
> <dht-message>
> <dht-message>
> <dht-message>
```

This mode also packs a `ls` option, so that the callee can list the protocols it currently supports

## Install

### npm

```sh
> npm i multistream-select
```

### Setup

#### Node.js

```js
const multistream = require('multistream-select')
```

#### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact a ES5
transpiled version with the right shims added. This means that you can require
it and use with your favourite bundler without having to adjust asset management
process.

```js
const multistream = require('multistream-select')
```

#### Browser: `<script>` Tag

Loading this module through a script tag will make the `MultistreamSelect` obj available in
the global namespace.

```html
<script src="https://unpkg.com/multistream-select/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/multistream-select/dist/index.js"></script>
```

## Usage

### Attach multistream to a connection (socket)

```JavaScript
const multistream = require('multistream-select')

const ms = new multistream.Listener()
// or
const ms = new multistream.Dialer()

// apply the multistream to the conn
ms.handle(conn, callback)
```

### This module uses `pull-streams`

We expose a streaming interface based on `pull-streams`, rather then on the Node.js core streams implementation (aka Node.js streams). `pull-streams` offers us a better mechanism for error handling and flow control guarantees. If you would like to know more about why we did this, see the discussion at this [issue](https://github.com/ipfs/js-ipfs/issues/362).

You can learn more about pull-streams at:

- [The history of Node.js streams, nodebp April 2014](https://www.youtube.com/watch?v=g5ewQEuXjsQ)
- [The history of streams, 2016](http://dominictarr.com/post/145135293917/history-of-streams)
- [pull-streams, the simple streaming primitive](http://dominictarr.com/post/149248845122/pull-streams-pull-streams-are-a-very-simple)
- [pull-streams documentation](https://pull-stream.github.io/)

#### Converting `pull-streams` to Node.js Streams

If you are a Node.js streams user, you can convert a pull-stream to a Node.js stream using the module [`pull-stream-to-stream`](https://github.com/pull-stream/pull-stream-to-stream), giving you an instance of a Node.js stream that is linked to the pull-stream. For example:

```js
const pullToStream = require('pull-stream-to-stream')

const nodeStreamInstance = pullToStream(pullStreamInstance)
// nodeStreamInstance is an instance of a Node.js Stream
```

To learn more about this utility, visit https://pull-stream.github.io/#pull-stream-to-stream.

## API

https://multiformats.github.io/js-multistream-select/

## Maintainers

Captain: [@diasdavid](https://github.com/diasdavid).

## Contribute

Contributions welcome. Please check out [the issues](https://github.com/multiformats/js-multistream-select/issues).

Check out our [contributing document](https://github.com/multiformats/multiformats/blob/master/contributing.md) for more information on how we work, and about contributing in general. Please be aware that all interactions related to multiformats are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT](LICENSE) © 2015 David Dias
