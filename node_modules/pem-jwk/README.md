# pem-jwk

convert between PEM and JWK key serialization formats

## Usage

As a commandline tool:

```sh
$ openssl genrsa 2048 | pem-jwk > private.jwk
$ pwm-jwk private.jwk > private.pem
```

## Example

```js
var assert = require('assert')
var fs = require('fs')
var pem2jwk = require('pem-jwk').pem2jwk
var jwk2pem = require('pem-jwk').jwk2pem

var str = fs.readFileSync('./test/priv.pem', 'ascii')
var jwk = pem2jwk(str)
var pem = jwk2pem(jwk)
assert.equal(pem, str)
```
