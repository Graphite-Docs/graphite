pull-ndjson
===========

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A pull-streams ndjson parser and serializer, inspired by and compatible with [ndjson](https://www.npmjs.com/package/ndjson). Note: This module ends up being a very tiny wrapper around pull-strinfigy and pull-split, exposing the same API as `ndjson`.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Install

```
> npm install pull-ndjson
```

## Examples

#### Serialize and Deserialize

```JavaScript
const ndjson = require('ndjson')

pull(
  pull.values([{ a: 1 }]),
  ndjson.serialize(),
  ndjson.parse(),
  pull.collect((err, values) => {
    if (err) {
      throw err
    }
    console.log(values)
    // [{ a: 1}]
  })
)
```

## Contribute

PRs are welcome!

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © David Dias
