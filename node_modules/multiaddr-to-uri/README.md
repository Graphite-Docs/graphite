# multiaddr-to-uri

[![Build Status](https://travis-ci.org/tableflip/multiaddr-to-uri.svg?branch=master)](https://travis-ci.org/tableflip/multiaddr-to-uri) [![dependencies Status](https://david-dm.org/tableflip/multiaddr-to-uri/status.svg)](https://david-dm.org/tableflip/multiaddr-to-uri) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


> Convert a Multiaddr to a URI /dnsaddr/ipfs.io/http -> http://ipfs.io

## Install

```sh
npm install multiaddr-to-uri
```

## Usage

```js
const toUri = require('multiaddr-to-uri')

console.log(toUri('/dnsaddr/protocol.ai/https'))
// -> https://protocol.ai
```

Note:

* Might be lossy - e.g. a DNSv6 multiaddr
* Can throw if the passed multiaddr:
    * is not a valid multiaddr
    * is not supported as a URI e.g. circuit

## Contribute

Feel free to dive in! [Open an issue](https://github.com/tableflip/multiaddr-to-uri/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
