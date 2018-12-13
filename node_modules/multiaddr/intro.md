JavaScript implementation of [Multiaddr](https://github.com/multiformats/multiaddr).

## What is multiaddr?

Multiaddr is a standard way to represent addresses that: 
- Support any standard network protocols.
- Self-describe (include protocols).
- Have a binary packed format.
- Have a nice string representation.
- Encapsulate well.

You can read more about what Multiaddr is in the language-independent Github repository: 
https://github.com/multiformats/multiaddr

Multiaddr is a part of a group of values called [Multiformats](https://github.com/multiformats/multiformats)

## Example

```js
var Multiaddr = require('multiaddr')

var home = new Multiaddr('/ip4/127.0.0.1/tcp/80')
// <Multiaddr 047f000001060050 - /ip4/127.0.0.1/tcp/80>

home.buffer
// <Buffer 04 7f 00 00 01 06 00 50>

home.toString()
// '/ip4/127.0.0.1/tcp/80'

home.protos()
// [ { code: 4, size: 32, name: 'ip4' },
//   { code: 6, size: 16, name: 'tcp' } ]

home.nodeAddress()
// { family: 'IPv4', address: '127.0.0.1', port: '80' }

var proxy = new Multiaddr('/ip4/192.168.2.1/tcp/3128')
// <Multiaddr 04c0a80201060c38 - /ip4/192.168.2.1/tcp/3128>

var full = proxy.encapsulate(home)
// <Multiaddr 04c0a80201060c38047f000001060050 - /ip4/192.168.2.1/tcp/3128/ip4/127.0.0.1/tcp/80>

full.toString()
// '/ip4/192.168.2.1/tcp/3128/ip4/127.0.0.1/tcp/80'
```

## Installation

### npm

```sh
> npm install multiaddr
```

## Setup

### Node.js

```js
var Multiaddr = require('multiaddr')
```

### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact a ES5
transpiled version with the right shims added. This means that you can require
it and use with your favourite bundler without having to adjust asset management
process.

```js
var Multiaddr = require('multiaddr')
```

### Browser: `<script>` Tag

Loading this module through a script tag will make the `Multiaddr` obj available in
the global namespace.

```html
<script src="https://unpkg.com/multiaddr/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/multiaddr/dist/index.js"></script>
```
