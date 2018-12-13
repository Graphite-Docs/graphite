# keypair

Generate a RSA PEM key pair from pure JS

[![Build Status](https://travis-ci.org/juliangruber/keypair.svg?branch=master)](https://travis-ci.org/juliangruber/keypair)
[![downloads](https://img.shields.io/npm/dm/keypair.svg)](https://www.npmjs.org/package/keypair)

[![browser support](https://ci.testling.com/juliangruber/keypair.png)](https://ci.testling.com/juliangruber/keypair)

## Usage

```js
var keypair = require('keypair');

var pair = keypair();
console.log(pair);
```

outputs

```
$ node example.js
{ public: '-----BEGIN RSA PUBLIC KEY-----\r\nMIGJAoGBAM3CosR73CBNcJsLv5E90NsFt6qN1uziQ484gbOoule8leXHFbyIzPQRozgEpSpi\r\nwhr6d2/c0CfZHEJ3m5tV0klxfjfM7oqjRMURnH/rmBjcETQ7qzIISZQ/iptJ3p7Gi78X5ZMh\r\nLNtDkUFU9WaGdiEb+SnC39wjErmJSfmGb7i1AgMBAAE=\r\n-----END RSA PUBLIC KEY-----\n',
  private: '-----BEGIN RSA PRIVATE KEY-----\r\nMIICXAIBAAKBgQDNwqLEe9wgTXCbC7+RPdDbBbeqjdbs4kOPOIGzqLpXvJXlxxW8iMz0EaM4\r\nBKUqYsIa+ndv3NAn2RxCd5ubVdJJcX43zO6Ko0TFEZx/65gY3BE0O6syCEmUP4qbSd6exou/\r\nF+WTISzbQ5FBVPVmhnYhG/kpwt/cIxK5iUn5hm+4tQIDAQABAoGBAI+8xiPoOrA+KMnG/T4j\r\nJsG6TsHQcDHvJi7o1IKC/hnIXha0atTX5AUkRRce95qSfvKFweXdJXSQ0JMGJyfuXgU6dI0T\r\ncseFRfewXAa/ssxAC+iUVR6KUMh1PE2wXLitfeI6JLvVtrBYswm2I7CtY0q8n5AGimHWVXJP\r\nLfGV7m0BAkEA+fqFt2LXbLtyg6wZyxMA/cnmt5Nt3U2dAu77MzFJvibANUNHE4HPLZxjGNXN\r\n+a6m0K6TD4kDdh5HfUYLWWRBYQJBANK3carmulBwqzcDBjsJ0YrIONBpCAsXxk8idXb8jL9a\r\nNIg15Wumm2enqqObahDHB5jnGOLmbasizvSVqypfM9UCQCQl8xIqy+YgURXzXCN+kwUgHinr\r\nutZms87Jyi+D8Br8NY0+Nlf+zHvXAomD2W5CsEK7C+8SLBr3k/TsnRWHJuECQHFE9RA2OP8W\r\noaLPuGCyFXaxzICThSRZYluVnWkZtxsBhW2W8z1b8PvWUE7kMy7TnkzeJS2LSnaNHoyxi7Ia\r\nPQUCQCwWU4U+v4lD7uYBw00Ga/xt+7+UqFPlPVdz1yyr4q24Zxaw0LgmuEvgU5dycq8N7Jxj\r\nTubX0MIRR+G9fmDBBl8=\r\n-----END RSA PRIVATE KEY-----\n' }
```

## Performance

Performance greatly depends on the bit size of the generated private key. With 1024 bits you get a key in 0.5s-2s, with 2048 bits it takes 8s-20s, on the same machine. As this will block the event loop while generating the key,
make sure that's ok or to spawn a child process or run it inside a webworker.

## Pro Tip: authorized_keys

@maxogden found out how to use this module to create entries for the `authorized_keys` file:

```js
var keypair = require('keypair');
var forge = require('node-forge');

var pair = keypair();
var publicKey = forge.pki.publicKeyFromPem(pair.public);
var ssh = forge.ssh.publicKeyToOpenSSH(publicKey, 'user@domain.tld');
console.log(ssh);
```

## API

### keypair([opts])

Get an RSA PEM key pair.

`opts` can be

* `bits`: the size for the private key in bits. Default: **2048**.
* `e`: the public exponent to use. Default: **65537**.

## Installation

With [npm](http://npmjs.org) do

```bash
$ npm install keypair
```

## Kudos

To [digitalbazaar](https://github.com/digitalbazaar) for their
[forge](https://github.com/digitalbazaar/forge) project, this library is merely a
wrapper around some of forge's functions.

## License

BSD / GPL
