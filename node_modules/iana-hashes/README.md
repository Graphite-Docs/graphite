# IANA-Hashes
**Use the IANA registered hash names with node crypto's hash functions**

[![Build Status](https://travis-ci.org/legastero/iana-hashes.png)](https://travis-ci.org/legastero/iana-hashes)
[![Dependency Status](https://david-dm.org/legastero/iana-hashes.png)](https://david-dm.org/legastero/iana-hashes)
[![devDependency Status](https://david-dm.org/legastero/iana-hashes/dev-status.png)](https://david-dm.org/legastero/iana-hashes#info=devDependencies)

[![Browser Support](https://ci.testling.com/legastero/iana-hashes.png)](https://ci.testling.com/legastero/iana-hashes)

## What is this?

The `iana-hashes` module is a very thin wrapper for the node `crypto` module's hash functions, allowing you to use the hash names registered with IANA, which are the names typically used in Internet standards.

## Installing

```sh
$ npm install iana-hashes
```

## Building bundled/minified version (for AMD, etc)

```sh
$ make
```

The bundled and minified files will be in the generated `build` directory.

## IANA Registry

[View the "Hash Function Textual Names" registry at IANA](http://www.iana.org/assignments/hash-function-text-names/hash-function-text-names.xhtml)

`crypto` | IANA
-------- | --------
md2      | md2
md5      | md5
sha1     | sha-1
sha224   | sha-224
sha256   | sha-256
sha384   | sha-384
sha512   | sha-512

## Usage

```javascript
var hashes = require('iana-hashes');

hashes.createHash('sha-1').update('test-sha1').digest('hex');
hashes.createHmac('sha-1', 'key').update('test-sha1-hmac').digest('hex');
```

## License

MIT

## Created By

If you like this, follow [@lancestout](http://twitter.com/lancestout) on twitter.
