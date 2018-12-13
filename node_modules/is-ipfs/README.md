is-ipfs
====

[![](https://img.shields.io/github/release/ipfs/is-ipfs.svg)](https://github.com/ipfs/is-ipfs/releases/latest)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](https://webchat.freenode.net/?channels=%23ipfs)

> A set of utilities to help identify [IPFS](https://ipfs.io/) resources

## Lead Maintainer

[Marcin Rataj](https://github.com/lidel)

# Install

### In Node.js through npm

```bash
$ npm install --save is-ipfs
```

### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact an ES5 transpiled version with the right shims added. This means that you can require it and use with your favorite bundler without having to adjust asset management process.

```js
var is-ipfs = require('is-ipfs')
```


### In the Browser through `<script>` tag

Loading this module through a script tag will make the ```IsIpfs``` obj available in the global namespace.

```
<script src="https://unpkg.com/is-ipfs/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/is-ipfs/dist/index.js"></script>
```

# Usage
```javascript
const isIPFS = require('is-ipfs')

isIPFS.multihash('QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // true
isIPFS.multihash('noop') // false

isIPFS.cid('QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // true (CIDv0)
isIPFS.cid('zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7') // true (CIDv1)
isIPFS.cid('noop') // false

isIPFS.base32cid('bafybeie5gq4jxvzmsym6hjlwxej4rwdoxt7wadqvmmwbqi7r27fclha2va') // true
isIPFS.base32cid('QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // false

isIPFS.url('https://ipfs.io/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // true
isIPFS.url('https://ipfs.io/ipns/github.com') // true
isIPFS.url('https://github.com/ipfs/js-ipfs/blob/master/README.md') // false
isIPFS.url('https://google.com') // false

isIPFS.path('/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // true
isIPFS.path('/ipns/github.com') // true
isIPFS.path('/ipfs/js-ipfs/blob/master/README.md') // false

isIPFS.urlOrPath('https://ipfs.io/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // true
isIPFS.urlOrPath('https://ipfs.io/ipns/github.com') // true
isIPFS.urlOrPath('/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // true
isIPFS.urlOrPath('/ipns/github.com') // true
isIPFS.urlOrPath('https://google.com') // false

isIPFS.ipfsUrl('https://ipfs.io/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // true
isIPFS.ipfsUrl('https://ipfs.io/ipfs/invalid-hash') // false

isIPFS.ipnsUrl('https://ipfs.io/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // false
isIPFS.ipnsUrl('https://ipfs.io/ipns/github.com') // true

isIPFS.ipfsPath('/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // true
isIPFS.ipfsPath('/ipfs/invalid-hash') // false

isIPFS.ipnsPath('/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // false
isIPFS.ipnsPath('/ipns/github.com') // true

isIPFS.subdomain('http://bafybeie5gq4jxvzmsym6hjlwxej4rwdoxt7wadqvmmwbqi7r27fclha2va.ipfs.dweb.link') // true
isIPFS.subdomain('http://bafybeiabc2xofh6tdi6vutusorpumwcikw3hf3st4ecjugo6j52f6xwc6q.ipns.dweb.link') // true
isIPFS.subdomain('http://www.bafybeie5gq4jxvzmsym6hjlwxej4rwdoxt7wadqvmmwbqi7r27fclha2va.ipfs.dweb.link') // false
isIPFS.subdomain('http://bafybeie5gq4jxvzmsym6hjlwxej4rwdoxt7wadqvmmwbqi7r27fclha2va.dweb.link') // false

isIPFS.ipfsSubdomain('http://bafybeie5gq4jxvzmsym6hjlwxej4rwdoxt7wadqvmmwbqi7r27fclha2va.ipfs.dweb.link') // true
isIPFS.ipfsSubdomain('http://bafybeie5gq4jxvzmsym6hjlwxej4rwdoxt7wadqvmmwbqi7r27fclha2va.dweb.link') // false

isIPFS.ipnsSubdomain('http://bafybeiabc2xofh6tdi6vutusorpumwcikw3hf3st4ecjugo6j52f6xwc6q.ipns.dweb.link') // true
isIPFS.ipnsSubdomain('http://bafybeiabc2xofh6tdi6vutusorpumwcikw3hf3st4ecjugo6j52f6xwc6q.dweb.link') // false
isIPFS.ipnsSubdomain('http://QmcNioXSC1bfJj1dcFErhUfyjFzoX2HodkRccsFFVJJvg8.ipns.dweb.link') // false
isIPFS.ipnsSubdomain('http://foo-bar.ipns.dweb.link') // false (not a PeerID)
```

# API

A suite of util methods that provides efficient validation.

Detection of IPFS Paths and identifiers in URLs is a two-stage process:
1.  `urlPattern`/`pathPattern`/`subdomainPattern` regex is applied to quickly identify potential candidates
2.  proper CID validation is applied to remove false-positives


## Utils

### `isIPFS.multihash(hash)`

Returns `true` if the provided string is a valid `multihash` or `false` otherwise.

### `isIPFS.cid(hash)`

Returns `true` if the provided string is a valid `CID` or `false` otherwise.

### `isIPFS.base32cid(hash)`

Returns `true` if the provided string is a valid `CID` in Base32 encoding or `false` otherwise.

## URLs

### `isIPFS.url(url)`

Returns `true` if the provided string is a valid IPFS or IPNS url or `false` otherwise.

### `isIPFS.ipfsUrl(url)`

Returns `true` if the provided string is a valid IPFS url or `false` otherwise.

### `isIPFS.ipnsUrl(url)`

Returns `true` if the provided string is a valid IPNS url or `false` otherwise.

## Paths

Standalone validation of IPFS Paths: `/ip(f|n)s/<cid>/..`

### `isIPFS.path(path)`

Returns `true` if the provided string is a valid IPFS or IPNS path or `false` otherwise.

### `isIPFS.urlOrPath(path)`

Returns `true` if the provided string is a valid IPFS or IPNS url or path or `false` otherwise.


### `isIPFS.ipfsPath(path)`

Returns `true` if the provided string is a valid IPFS path or `false` otherwise.

### `isIPFS.ipnsPath(path)`

Returns `true` if the provided string is a valid IPNS path or `false` otherwise.

## Subdomains

Validated subdomain convention: `cidv1b32.ip(f|n)s.domain.tld`

### `isIPFS.subdomain(url)`

Returns `true` if the provided string includes a valid IPFS or IPNS subdomain or `false` otherwise.

### `isIPFS.ipfsSubdomain(url)`

Returns `true` if the provided string includes a valid IPFS subdomain or `false` otherwise.

### `isIPFS.ipnsSubdomain(url)`

Returns `true` if the provided string includes a valid IPNS subdomain or `false` otherwise.


# License

MIT
