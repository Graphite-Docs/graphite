# rsa-unpack

unpack rsa fields from PEM strings

[![build status](https://secure.travis-ci.org/substack/rsa-unpack.png)](http://travis-ci.org/substack/rsa-unpack)

# example

```
$ rsa-json > keys.json
```

``` js
var fs = require('fs');
var keys = require('./keys.json');

var unpack = require('rsa-unpack');
var rsa = unpack(keys.private);
console.dir(rsa);
```

***

```
$ node example/unpack.js
{ modulus: <Buffer 02 6f cb 5a 12 79 81 c0 b7 03 ad b8 eb 20 a3 2f 5c 26 09 ab 4e e1 e9 66 05 2c 36 84 b2 21 76 3a 65 ce 8b b3 4e fd 51 03 ea 98 4d f8 8d ab cc 1b 60 a6 3b ...>,
  bits: 1073,
  publicExponent: 65537,
  privateExponent: <Buffer 01 e9 6a 97 e9 e4 d1 6b bd 6b b2 72 62 70 41 f8 57 89 34 8e e6 9e 12 fc 4b 54 ac 15 a2 98 e4 64 df 19 95 bc 02 5e 77 a0 e5 ff c7 35 1b 1a 4e 52 b0 9a dc ...>,
  prime1: <Buffer 01 9f 6b 9a 2c 1f 1e 6e 4a a3 a5 00 e8 e6 1a be 30 41 e2 66 3e be b5 81 0a d2 d4 0e d1 86 bf 4a e3 1d 20 ac 6a fb a1 cd 0c db 2a 2d 09 27 c7 d3 81 e0 f0 ...>,
  prime2: <Buffer 01 80 68 ba c8 93 2c 79 e6 8e f5 8d 0f 8c b3 af 24 96 19 2c d4 43 23 54 48 78 36 42 d0 a3 12 16 a0 03 ac 3a 77 e9 17 a1 8a 0c 4a a9 b5 cf cb b6 6a d4 ad ...>,
  exponent1: <Buffer 22 4e 1c 79 30 48 af 0a f2 e0 99 66 a2 39 eb 22 c9 0e 0d 2b 79 4c 3b cf cd 01 3e 08 07 7c 9c 8e 8c c5 39 f7 cb b7 dc db 06 ee 40 b1 d4 db 27 98 3e 1f 14 ...>,
  exponent2: <Buffer 00 f3 5c 5a 33 b5 08 c9 3b af 71 c1 16 01 0b 98 6b df 22 9d 00 dc 68 37 69 91 c1 38 57 81 85 68 11 71 81 cd 9a 30 55 27 8d 8f ee 8c b6 6f 91 16 31 57 e7 ...>,
  coefficient: <Buffer 0f a9 06 b8 51 44 98 84 9e d7 92 5f 0d 24 0a f0 3f e1 bb 86 52 93 e5 b4 53 c9 6c 0a da ef 70 1b 83 99 a4 9a 15 e8 cb 43 5b f7 14 9b d5 a0 8c 0d 47 c0 af ...> }
```

# methods

``` js
var unpack = require('rsa-unpack')
```

## unpack(pemKeyString)

Unpack the PEM-formatted string `pemKeyString` into the RSA field values.
The key can be a public or private key.

If the key is invalid, returns undefined.

# command-line usage

```
usage: rsa-unpack {FILE|-} OPTIONS

OPTIONS:

  --format        format to expect FILE to be in.
                  default: pem or json if FILE ends in .json

  --encoding, -e  encoding to use. default: hex
```

# install

With [npm](https://npmjs.org) do:

```
npm install rsa-unpack
```

# license

MIT
