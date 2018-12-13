[![Build Status](https://travis-ci.org/OADA/rsa-pem-to-jwk.svg)](https://travis-ci.org/OADA/rsa-pem-to-jwk)
[![Coverage Status](https://coveralls.io/repos/OADA/rsa-pem-to-jwk/badge.png?branch=master)](https://coveralls.io/r/OADA/rsa-pem-to-jwk?branch=master)
[![Dependency Status](https://david-dm.org/oada/rsa-pem-to-jwk.svg)](https://david-dm.org/oada/rsa-pem-to-jwk)
[![License](http://img.shields.io/:license-Apache%202.0-green.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

# Table of Contents

- [rsa-pem-to-jwk](#rsa-pem-to-jwk)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Running the tests, coverage, and style checks](#running-the-tests-coverage-and-style-checks)
  - [PEM Format](#pem-format)
    - [Private Keys](#private-keys)
    - [Public Keys](#public-keys)
- [API Reference](#api-reference)
  - [rsaPemToJwk(pem, extraKeys, type)](#rsapemtojwkpem-extrakeys-type)
    - [Parameters](#parameters)
    - [Usage Example](#usage-example)

# rsa-pem-to-jwk

Converts PEM encoded RSA public and private keys to the [JWK (JSON Web
Key)][jwk] format.

For example, given the following PEM encoded RSA key:

```
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDfn1nKQshOSj8xw44oC2klFWSNLmK3BnHONCJ1bZfq0EQ5gIfg
tlvB+Px8Ya+VS3OnK7Cdi4iU1fxO9ktN6c6TjmmmFevk8wIwqLthmCSF3r+3+h4e
ddj7hucMsXWv05QUrCPoL6YUUz7Cgpz7ra24rpAmK5z7lsV+f3BEvXkrUQIDAQAB
AoGAC0G3QGI6OQ6tvbCNYGCqq043YI/8MiBl7C5dqbGZmx1ewdJBhMNJPStuckhs
kURaDwk4+8VBW9SlvcfSJJrnZhgFMjOYSSsBtPGBIMIdM5eSKbenCCjO8Tg0BUh/
xa3CHST1W4RQ5rFXadZ9AeNtaGcWj2acmXNO3DVETXAX3x0CQQD13LrBTEDR44ei
lQ/4TlCMPO5bytd1pAxHnrqgMnWovSIPSShAAH1feFugH7ZGu7RoBO7pYNb6N3ia
C1idc7yjAkEA6Nfc6c8meTRkVRAHCF24LB5GLfsjoMB0tOeEO9w9Ous1a4o+D24b
AePMUImAp3woFoNDRfWtlNktOqLel5PjewJBAN9kBoA5o6/Rl9zeqdsIdWFmv4DB
5lEqlEnC7HlAP+3oo3jWFO9KQqArQL1V8w2D4aCd0uJULiC9pCP7aTHvBhcCQQDb
W0mOp436T6ZaELBfbFNulNLOzLLi5YzNRPLppfG1SRNZjbIrvTIKVL4N/YxLvQbT
NrQw+2OdQACBJiEHsdZzAkBcsTk7frTH4yGx0VfHxXDPjfTj4wmD6gZIlcIr9lZg
4H8UZcVFN95vEKxJiLRjAmj6g273pu9kK4ymXNEjWWJn
-----END RSA PRIVATE KEY-----
```

the following private RSA JWK is returned:

```json
{
  "kty": "RSA",
  "n": "AN-fWcpCyE5KPzHDjigLaSUVZI0uYrcGcc40InVtl-rQRDmAh-C2W8H4_Hxhr5VLc6crsJ2LiJTV_E72S03pzpOOaaYV6-TzAjCou2GYJIXev7f6Hh512PuG5wyxda_TlBSsI-gvphRTPsKCnPutrbiukCYrnPuWxX5_cES9eStR",
  "e": "AQAB",
  "d": "C0G3QGI6OQ6tvbCNYGCqq043YI_8MiBl7C5dqbGZmx1ewdJBhMNJPStuckhskURaDwk4-8VBW9SlvcfSJJrnZhgFMjOYSSsBtPGBIMIdM5eSKbenCCjO8Tg0BUh_xa3CHST1W4RQ5rFXadZ9AeNtaGcWj2acmXNO3DVETXAX3x0",
  "p": "APXcusFMQNHjh6KVD_hOUIw87lvK13WkDEeeuqAydai9Ig9JKEAAfV94W6Aftka7tGgE7ulg1vo3eJoLWJ1zvKM",
  "q": "AOjX3OnPJnk0ZFUQBwhduCweRi37I6DAdLTnhDvcPTrrNWuKPg9uGwHjzFCJgKd8KBaDQ0X1rZTZLTqi3peT43s",
  "dp": "AN9kBoA5o6_Rl9zeqdsIdWFmv4DB5lEqlEnC7HlAP-3oo3jWFO9KQqArQL1V8w2D4aCd0uJULiC9pCP7aTHvBhc",
  "dq": "ANtbSY6njfpPploQsF9sU26U0s7MsuLljM1E8uml8bVJE1mNsiu9MgpUvg39jEu9BtM2tDD7Y51AAIEmIQex1nM",
  "qi": "XLE5O360x-MhsdFXx8Vwz4304-MJg-oGSJXCK_ZWYOB_FGXFRTfebxCsSYi0YwJo-oNu96bvZCuMplzRI1liZw"
}
```

alternatively, the PEM can also be converted to a public RSA JWK:

```json
{
  "kty": "RSA",
  "n": "AN-fWcpCyE5KPzHDjigLaSUVZI0uYrcGcc40InVtl-rQRDmAh-C2W8H4_Hxhr5VLc6crsJ2LiJTV_E72S03pzpOOaaYV6-TzAjCou2GYJIXev7f6Hh512PuG5wyxda_TlBSsI-gvphRTPsKCnPutrbiukCYrnPuWxX5_cES9eStR",
  "e": "AQAB"
}
```

# Getting Started

## Installation
The library can be installed with `npm` using
```sh
$ npm install rsa-pem-to-jwk
```

## Running the tests, coverage, and style checks
The module's tests are run with:
```sh
$ npm test
```

The coverage report is generated with:
```sh
$ npm run cover
```

`jshint` (lint) and `jscs` (style) is automated with gulp:
```sh
$ gulp lint
$ gulp style
```

or just
```sh
$ gulp
```

## PEM Format

This module expects the input RSA keys to be in "PEM" format. Most tools agree
on what this means for private keys but some tools have different definitions
for public keys.

### Private Keys

Both OpenSSH and OpenSSL use the same RSA private key PEM format. Below is an
example of generating such a PEM of a 2048 bit RSA private key with each tool:

**OpenSSL:**
```sh
$ openssl genrsa -out private.pem 2048
```

**OpenSSH:**
```sh
$ ssh-keygen -t rsa -b 2048 -m PEM -f private.pem
```

### Public Keys

The expected PEM format for public keys is `RSAPublicKey`. This is the default
output PEM format for the OpenSSH key generation tool but not for OpenSSL
(requires -RSAPublicKey_out flag). Below is an example of generating the public
key from a RSA private key PEM with each tool:

**OpenSSL**:
```sh
$ openssl rsa -in private.pem -RSAPublicKey_out -out public.pem
```

**OpenSSH**:
```sh
$ ssh-keygen -f private.pem -e -m PEM > public.pem
```

# API Reference

## rsaPemToJwk(pem, extraKeys, type)
Converts PEM encoded RSA public and private keys to the [JWK (JSON Web
Token)][jwk] format.

### Parameters
`pem` {String} of a PEM encoded RSA public or private key.

`extraKeys` {Object} whose keys appear in the JWK body. **Default**: *{}*

`type` {String} equal to:
  - *public* -- JWK will only contain the public portions of the RSA key.
  - *private* -- JWK will contain both the public and private portions of the RSA
    key.

    **Default**: *type of input PEM*

### Usage Example
```javascript
var fs = require('fs');
var rsaPemToJwk = require('rsa-pem-to-jwk');

var pem = fs.readFileSync('privateKey.pem');

var jwk = rsaPemToJwk(pem, {use: 'sig'}, 'public');
```

[jwk]: https://tools.ietf.org/id/draft-ietf-jose-json-web-key.txt
