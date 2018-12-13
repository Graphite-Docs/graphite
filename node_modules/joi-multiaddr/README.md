# joi-multiaddr

[![Build Status](https://travis-ci.org/tableflip/joi-multiaddr.svg?branch=master)](https://travis-ci.org/tableflip/joi-multiaddr)
[![dependencies Status](https://david-dm.org/tableflip/joi-multiaddr/status.svg)](https://david-dm.org/tableflip/joi-multiaddr)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Validate a multiaddr and common formats.

## Install

```js
npm install joi-multiaddr
```

## Usage

```js
const Joi = require('joi').extend(require('joi-multiaddr'))

/**
 * Validate a String or Buffer is in multiaddr format:
 */

const schema = Joi.multiaddr()
const result = schema.validate('/ip4/0.0.7.6/tcp/1234')

console.log(result.error) // null
// Note, successful validation converts to a Multiaddr instance:
console.log(result.value) // <Multiaddr 04000007060604d2 - /ip4/0.0.7.6/tcp/1234>

/**
 * Validate formats using mafmt (https://github.com/multiformats/js-mafmt):
 */

const dnsSchema = Joi.multiaddr().DNS()
const tcpSchema = Joi.multiaddr().TCP()
const ipfsSchema = Joi.multiaddr().IPFS()
/* etc. */

ipfsSchema.validate('/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4') // Success!
ipfsSchema.validate('/ip4/0.0.7.6/tcp/1234') // Failure :(
```

## Contribute

Feel free to dive in! [Open an issue](https://github.com/tableflip/joi-multiaddr/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
