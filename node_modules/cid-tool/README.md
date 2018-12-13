# CID Tool

[![Build Status](https://travis-ci.org/ipfs-shipyard/js-cid-tool.svg?branch=master)](https://travis-ci.org/ipfs-shipyard/js-cid-tool) [![dependencies Status](https://david-dm.org/ipfs-shipyard/cid-tool/status.svg)](https://david-dm.org/ipfs-shipyard/cid-tool) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> A module and command line tool for converting, formatting and discovering properties of CIDs

## Install

* Install Node.js 8+

```sh
npm install -g cid-tool # for command line usage
# or
npm install cid-tool    # for programmatic usage
```

## Usage

### CLI

```console
$ cid --help
cid <command>

Commands:
  cid base32 [cids...]  Convert CIDs to base 32 CID version 1.
  cid bases             List available multibase encoding names.
  cid codecs            List available CID codec names.
  cid format [cids...]  Format and convert a CID in various useful ways.
  cid hashes            List available multihash hashing algorithm names.

Options:
  --version  Show version number                                     [boolean]
  --help     Show help                                               [boolean]
```

**Note**: help is also available for each command e.g. `cid format --help`

#### Example

```console
$ cid base32 QmdnJHe9XKk6atRSqAq1SdCu12MMSKxSPC93EWngEDoypj
bafybeihfofifyyrirgqad3de7nkyldbleo3awwv4ghbba4ipjqthk2nhaa

$ cid bases --prefix
0 base1
1 base2
7 base8
9 base10
f base16
b base32
c base32pad
v base32hex
t base32hexpad
h base32z
Z base58flickr
z base58btc
m base64
M base64pad
u base64url
U base64urlpad

$ cid codecs
raw
base1
base2
base8
base10
cbor
protobuf
# ...

$ cid format mAXASIOVxUFxiKImgAexk+1WFjCsjtgtavDHCEHEPTCZ1aacA -f "%b CIDv%V %h"
base64 CIDv1 sha2-256

$ cid hashes
id
sha1
sha2-256
sha2-512
dbl-sha2-256
sha3-224
sha3-256
sha3-384
sha3-512
shake-128
shake-256
keccak-224
# ...
```

### Module

```js
const CIDTool = require('cid-tool')
// Then see API docs below...
```

## API

### `CIDTool.base32(cid)`

Convert the passed CID to base 32 CID version 1.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| cid | [`CID`](https://github.com/ipld/js-cid/)\|`String`\|`Buffer` | CID to convert. |

#### Returns

| Type | Description |
|------|-------------|
| `String` | Base 32 encoded version 1 CID |

#### Example

```js
> CIDTool.base32('QmdnJHe9XKk6atRSqAq1SdCu12MMSKxSPC93EWngEDoypj')
'bafybeihfofifyyrirgqad3de7nkyldbleo3awwv4ghbba4ipjqthk2nhaa'
```

### `CIDTool.bases()`

List available [multibase encoding name and code pairs](https://github.com/multiformats/multibase/blob/master/multibase.csv).

#### Returns

| Type | Description |
|------|-------------|
| `Array<{name<String>, code<String>}>` | Multibase encoding name and code pairs |

#### Example

```js
> CIDTool.bases()
[ { name: 'base1', code: '0' },
  { name: 'base2', code: '1' },
  { name: 'base8', code: '7' },
  { name: 'base10', code: '9' },
  { name: 'base16', code: 'f' },
  { name: 'base32', code: 'b' },
  { name: 'base32pad', code: 'c' },
  { name: 'base32hex', code: 'v' },
  { name: 'base32hexpad', code: 't' },
  { name: 'base32z', code: 'h' },
  { name: 'base58flickr', code: 'Z' },
  { name: 'base58btc', code: 'z' },
  { name: 'base64', code: 'm' },
  { name: 'base64pad', code: 'M' },
  { name: 'base64url', code: 'u' },
  { name: 'base64urlpad', code: 'U' } ]
```

### `CIDTool.codecs()`

List available [CID codec name and code pairs](https://github.com/multiformats/multicodec/blob/master/table.csv).

#### Returns

| Type | Description |
|------|-------------|
| `Array<{name<String>, code<Number>}>` | CID codec name and code pairs |

#### Example

```js
> CIDTool.codecs()
[ { name: 'raw', code: 85 },
  { name: 'base1', code: 1 },
  { name: 'base2', code: 0 },
  { name: 'base8', code: 7 },
  { name: 'base10', code: 9 },
  { name: 'cbor', code: 81 },
  { name: 'protobuf', code: 80 },
  /* ... */ ]
```

### `CIDTool.format(cid, [options])`

Format and convert a CID in various useful ways.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| cid | [`CID`](https://github.com/ipld/js-cid/)\|`String`\|`Buffer` | CID to format |
| options | `Object` | (optional) options for formatting |
| options.format | `String` | Format string to use, default "%s" |
| options.base | `String` | Multibase name or code to use for output |
| options.cidVersion | `Number` | Convert the CID to the given version if possible |

Available format specifiers:

* %% literal %
* %b multibase name
* %B multibase code
* %v version string
* %V version number
* %c codec name
* %C codec code
* %h multihash name
* %H multihash code
* %L hash digest length
* %m multihash encoded in base %b (with multibase prefix)
* %M multihash encoded in base %b without multibase prefix
* %d hash digest encoded in base %b (with multibase prefix)
* %D hash digest encoded in base %b without multibase prefix
* %s cid string encoded in base %b (1)
* %S cid string encoded in base %b without multibase prefix
* %P cid prefix: %v-%c-%h-%L

(1) For CID version 0 the multibase must be base58btc and no prefix is used. For Cid version 1 the multibase prefix is included.

#### Returns

| Type | Description |
|------|-------------|
| `String` | Formatted string |

#### Example

```js
> CIDTool.format('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { format: '%b-%v-%c-%h-%L' })
'base58btc-cidv0-dag-pb-sha2-256-32'

> CIDTool.format('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { cidVersion: 1 })
'zdj7WbTaiJT1fgatdet9Ei9iDB5hdCxkbVyhyh8YTUnXMiwYi'

> CIDTool.format('zdj7WksYf5DNoDhTbjNZundK13TdEYo9sNaFWYZuKBM3fNszf', { base: 'base64' })
'mAXASIOVxUFxiKImgAexk+1WFjCsjtgtavDHCEHEPTCZ1aacA'
```

### `CIDTool.hashes()`

List available [multihash hashing algorithm name and code pairs](https://github.com/multiformats/multihash/blob/master/hashtable.csv).

#### Returns

| Type | Description |
|------|-------------|
| `Array<{name<String>, code<Number>}>` | Multihash hashing algorithm name and code pairs |

#### Example

```js
> CIDTool.hashes()
[ { name: 'id', code: 0 },
  { name: 'sha1', code: 17 },
  { name: 'sha2-256', code: 18 },
  { name: 'sha2-512', code: 19 },
  { name: 'dbl-sha2-256', code: 86 },
  { name: 'sha3-224', code: 23 },
  { name: 'sha3-256', code: 22 },
  /* ... */ ]
```

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs-shipyard/cid-tool/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

Copyright (c) Protocol Labs, Inc. under the **MIT License**. See [LICENSE](./LICENSE) for details.
