<a name="0.19.3"></a>
## [0.19.3](https://github.com/ipld/js-ipld/compare/v0.19.2...v0.19.3) (2018-11-09)


### Features

* dynamic format loading ([b41033b](https://github.com/ipld/js-ipld/commit/b41033b)), closes [/github.com/ipld/js-ipld/pull/164#discussion_r228121092](https://github.com//github.com/ipld/js-ipld/pull/164/issues/discussion_r228121092)



<a name="0.19.2"></a>
## [0.19.2](https://github.com/ipld/js-ipld/compare/v0.19.1...v0.19.2) (2018-11-07)


### Features

* add getMany() ([db7dc8b](https://github.com/ipld/js-ipld/commit/db7dc8b)), closes [#132](https://github.com/ipld/js-ipld/issues/132)
* adds onlyHash option to ipld.put ([0c78f0e](https://github.com/ipld/js-ipld/commit/0c78f0e))


### Performance Improvements

* fail fast for missing format ([ebd2d1b](https://github.com/ipld/js-ipld/commit/ebd2d1b))



<a name="0.19.1"></a>
## [0.19.1](https://github.com/ipld/js-ipld/compare/v0.19.0...v0.19.1) (2018-10-27)



<a name="0.19.0"></a>
# [0.19.0](https://github.com/ipld/js-ipld/compare/v0.18.0...v0.19.0) (2018-10-25)


### Code Refactoring

* make blockService an option parameter ([f1c2e12](https://github.com/ipld/js-ipld/commit/f1c2e12))
* pass in IPLD Formats into the constructor ([b003ad1](https://github.com/ipld/js-ipld/commit/b003ad1))


### BREAKING CHANGES

* Not all IPLD Formats are included by default

By default only the [ipld-dag-cbor], [ipld-dag-pb] and [raw]
[IPLD Format]s are included. If you want to use other IPLD Formats
you need to pass them into the constructor.

The code to restore the old behaviour could look like this:

```js
const ipldBitcoin = require('ipld-bitcoin')
const ipldDagCbor = require('ipld-dag-cbor')
const ipldDagPb = require('ipld-dag-pb')
const ipldEthAccountSnapshot = require('ipld-ethereum').ethAccountSnapshot
const ipldEthBlock = require('ipld-ethereum').ethBlock
const ipldEthBlockList = require('ipld-ethereum').ethBlockList
const ipldEthStateTrie = require('ipld-ethereum').ethStateTrie
const ipldEthStorageTrie = require('ipld-ethereum').ethStorageTrie
const ipldEthTrie = require('ipld-ethereum').ethTxTrie
const ipldEthTx = require('ipld-ethereum').ethTx
const ipldGit = require('ipld-git')
const ipldRaw = require('ipld-raw')
const ipldZcash = require('ipld-zcash')

…

const ipld = new Ipld({
  blockService: blockService,
  formats: [
    ipldBitcoin, ipldDagCbor, ipldDagPb, ipldEthAccountSnapshot,
    ipldEthBlock, ipldEthBlockList, ipldEthStateTrie, ipldEthStorageTrie,
    ipldEthTrie, ipldEthTx, ipldGit, ipldRaw, ipldZcash
  ]
})
```

[ipld-dag-cbor]: https://github.com/ipld/js-ipld-dag-cbor
[ipld-dag-pb]: https://github.com/ipld/js-ipld-dag-pb
[ipld-raw]: https://github.com/ipld/js-ipld-raw
[IPLD Format]: https://github.com/ipld/interface-ipld-format
* The IPLD constructor is no longer taking a BlockService as its
only parameter, but an objects object with `blockService` as a
key.

You need to upgrade your code if you initialize IPLD.

Prior to this change:

```js
const ipld = new Ipld(blockService)
```

Now:

```js
const ipld = new Ipld({blockService: blockService})
```



<a name="0.18.0"></a>
# [0.18.0](https://github.com/ipld/js-ipld/compare/v0.17.4...v0.18.0) (2018-10-12)

### BREAKING CHANGES

* The API for [dag-cbor](https://github.com/ipld/js-ipld-dag-cbor) changed.
  Links are no longer represented as JSON objects  (`{"/": "base-encoded-cid"}`,
  but as [CID objects](https://github.com/ipld/js-cid). `get()` and
  `getStream()` now always return links as CID objects. `put()` also takes
  CID objects as input. Link represented as old-style JSON objects is still
  supported, but deprecated.

Example:

Prior to this change:

```js
const cid = new CID('QmXed8RihWcWFXRRmfSRG9yFjEbXNxu1bDwgCFAN8Dxcq5')
ipld.put({link: {'/': cid.toBaseEncodedString()}}, {format: 'dag-cbor'}, (err, putCid) => {
  ipld.get(putCid, (err, result) => {
      console.log(result.value)
  })
})
```

Output:

```js
{ link:
   { '/':
      <Buffer 12 20 8a…> } }
```

Now:

```js
const cid = new CID('QmXed8RihWcWFXRRmfSRG9yFjEbXNxu1bDwgCFAN8Dxcq5')
ipld.put({link: cid}, {format: 'dag-cbor'}, (err, putCid) => {
  ipld.get(putCid, (err, result) => {
      console.log(result.value)
  })
})
```

Output:

```js
{ link:
   CID {
     codec: 'dag-pb',
     version: 0,
     multihash:
      <Buffer 12 20 8a…> } }
```

See https://github.com/ipld/ipld/issues/44 for more information on why this
change was made.


<a name="0.17.4"></a>
## [0.17.4](https://github.com/ipld/js-ipld/compare/v0.17.3...v0.17.4) (2018-09-25)


### Bug Fixes

* get missing path ([a069a0f](https://github.com/ipld/js-ipld/commit/a069a0f))
* tests of Zcash were broken ([05b6424](https://github.com/ipld/js-ipld/commit/05b6424))


### Features

* use package-table vs custom script ([366176c](https://github.com/ipld/js-ipld/commit/366176c))


### Performance Improvements

* lazy load format resolvers ([f4a094a](https://github.com/ipld/js-ipld/commit/f4a094a))



<a name="0.17.3"></a>
## [0.17.3](https://github.com/ipld/js-ipld/compare/v0.17.2...v0.17.3) (2018-07-17)


### Bug Fixes

* **put:** pass CID options to resolver ([a419048](https://github.com/ipld/js-ipld/commit/a419048))



<a name="0.17.2"></a>
## [0.17.2](https://github.com/ipld/js-ipld/compare/v0.17.1...v0.17.2) (2018-05-29)



<a name="0.17.1"></a>
## [0.17.1](https://github.com/ipld/js-ipld/compare/v0.17.0...v0.17.1) (2018-05-29)


### Bug Fixes

* "resolver exists" error message typo ([d3d78e0](https://github.com/ipld/js-ipld/commit/d3d78e0))



<a name="0.17.0"></a>
# [0.17.0](https://github.com/ipld/js-ipld/compare/v0.16.0...v0.17.0) (2018-04-11)



<a name="0.16.0"></a>
# [0.16.0](https://github.com/ipld/js-ipld-resolver/compare/v0.15.0...v0.16.0) (2018-04-09)


### Bug Fixes

* handle required options for IPLDResolver.put ([3612289](https://github.com/ipld/js-ipld-resolver/commit/3612289))



<a name="0.15.0"></a>
# [0.15.0](https://github.com/ipld/js-ipld-resolver/compare/v0.14.1...v0.15.0) (2018-02-26)


### Bug Fixes

* resolvers expect binary data ([03eaa25](https://github.com/ipld/js-ipld-resolver/commit/03eaa25))


### Chores

* Rename package from `ipld-resolver` to `ipld` ([8b82a49](https://github.com/ipld/js-ipld-resolver/commit/8b82a49)), closes [#116](https://github.com/ipld/js-ipld-resolver/issues/116)


### Features

* Add support for Bitcoin ([7c4bc2c](https://github.com/ipld/js-ipld-resolver/commit/7c4bc2c))
* Add support for Zcash ([3e3ed35](https://github.com/ipld/js-ipld-resolver/commit/3e3ed35))


### BREAKING CHANGES

* All packages that depend on `ipld-resolver`
need to change their dependency.

Within your package that depends on `ipld-resolver` do:

    npm uninstall ipld-resolver
    npm intall ipld

Then search for all imports of `ipld-resolver` and change from

    const IPLDResolver = require('ipld-resolver')

to

    const Ipld = require('ipld')



<a name="0.14.1"></a>
## [0.14.1](https://github.com/ipld/js-ipld-resolver/compare/v0.14.0...v0.14.1) (2017-11-07)



<a name="0.14.0"></a>
# [0.14.0](https://github.com/ipld/js-ipld-resolver/compare/v0.13.4...v0.14.0) (2017-11-06)


### Bug Fixes

* Windows interop ([#104](https://github.com/ipld/js-ipld-resolver/issues/104)) ([f2d524b](https://github.com/ipld/js-ipld-resolver/commit/f2d524b))



<a name="0.13.4"></a>
## [0.13.4](https://github.com/ipld/js-ipld-resolver/compare/v0.13.3...v0.13.4) (2017-10-11)



<a name="0.13.3"></a>
## [0.13.3](https://github.com/ipld/js-ipld-resolver/compare/v0.13.2...v0.13.3) (2017-10-07)


### Features

* ipld-eth-star -> ipld-ethereum ([#98](https://github.com/ipld/js-ipld-resolver/issues/98)) ([b448e59](https://github.com/ipld/js-ipld-resolver/commit/b448e59))
* raw ipld resolver ([#90](https://github.com/ipld/js-ipld-resolver/issues/90)) ([2968681](https://github.com/ipld/js-ipld-resolver/commit/2968681))



<a name="0.13.2"></a>
## [0.13.2](https://github.com/ipld/js-ipld-resolver/compare/v0.13.1...v0.13.2) (2017-09-07)



<a name="0.13.1"></a>
## [0.13.1](https://github.com/ipld/js-ipld-resolver/compare/v0.13.0...v0.13.1) (2017-09-02)


### Features

* add git support! ([97d8fc3](https://github.com/ipld/js-ipld-resolver/commit/97d8fc3))
* resolver guard (graceful failure) ([#89](https://github.com/ipld/js-ipld-resolver/issues/89)) ([62816a9](https://github.com/ipld/js-ipld-resolver/commit/62816a9))



<a name="0.13.0"></a>
# [0.13.0](https://github.com/ipld/js-ipld-resolver/compare/v0.12.1...v0.13.0) (2017-07-23)



<a name="0.12.1"></a>
## [0.12.1](https://github.com/ipld/js-ipld-resolver/compare/v0.12.0...v0.12.1) (2017-07-11)


### Features

* update ethereum resolvers ([f258c9e](https://github.com/ipld/js-ipld-resolver/commit/f258c9e))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/ipld/js-ipld-resolver/compare/v0.11.1...v0.12.0) (2017-07-04)



<a name="0.11.1"></a>
## [0.11.1](https://github.com/ipld/js-ipld-resolver/compare/v0.11.0...v0.11.1) (2017-05-23)



<a name="0.11.0"></a>
# [0.11.0](https://github.com/ipld/js-ipld-resolver/compare/v0.10.1...v0.11.0) (2017-03-22)


### Features

* migrate to new ipfs-block and block-service api ([c7dd494](https://github.com/ipld/js-ipld-resolver/commit/c7dd494))



<a name="0.10.1"></a>
## [0.10.1](https://github.com/ipld/js-ipld-resolver/compare/v0.10.0...v0.10.1) (2017-03-16)



<a name="0.10.0"></a>
# [0.10.0](https://github.com/ipld/js-ipld-resolver/compare/v0.9.0...v0.10.0) (2017-03-13)



<a name="0.9.0"></a>
# [0.9.0](https://github.com/ipld/js-ipld-resolver/compare/v0.8.1...v0.9.0) (2017-02-11)



<a name="0.8.1"></a>
## [0.8.1](https://github.com/ipld/js-ipld-resolver/compare/v0.8.0...v0.8.1) (2017-02-09)



<a name="0.8.0"></a>
# [0.8.0](https://github.com/ipld/js-ipld-resolver/compare/v0.7.1...v0.8.0) (2017-02-08)


### Features

* improve put API and expose getStream ([#77](https://github.com/ipld/js-ipld-resolver/issues/77)) ([0d67f58](https://github.com/ipld/js-ipld-resolver/commit/0d67f58))



<a name="0.7.1"></a>
## [0.7.1](https://github.com/ipld/js-ipld-resolver/compare/v0.7.0...v0.7.1) (2017-02-08)



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipld/js-ipld-resolver/compare/v0.6.0...v0.7.0) (2017-02-08)


### Bug Fixes

* adding fix to edge cases in path names ([#74](https://github.com/ipld/js-ipld-resolver/issues/74)) ([dd10fab](https://github.com/ipld/js-ipld-resolver/commit/dd10fab))


### Features

* revamped dag api ([#76](https://github.com/ipld/js-ipld-resolver/issues/76)) ([0e878b0](https://github.com/ipld/js-ipld-resolver/commit/0e878b0))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipld/js-ipld-resolver/compare/v0.5.0...v0.6.0) (2017-02-02)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipld/js-ipld-resolver/compare/v0.4.3...v0.5.0) (2017-02-02)



<a name="0.4.3"></a>
## [0.4.3](https://github.com/ipld/js-ipld-resolver/compare/v0.4.2...v0.4.3) (2017-01-29)



<a name="0.4.2"></a>
## [0.4.2](https://github.com/ipld/js-ipld-resolver/compare/v0.4.1...v0.4.2) (2017-01-29)


### Bug Fixes

* switch to dag-cbor 0.8.2, the switch to borc in 0.8.3 introduced a bug ([948ca6a](https://github.com/ipld/js-ipld-resolver/commit/948ca6a))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/ipld/js-ipld-resolver/compare/v0.4.0...v0.4.1) (2016-12-13)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipld/js-ipld-resolver/compare/v0.3.1...v0.4.0) (2016-12-08)



<a name="0.3.1"></a>
## [0.3.1](https://github.com/ipld/js-ipld-resolver/compare/v0.3.0...v0.3.1) (2016-12-01)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipld/js-ipld-resolver/compare/v0.2.0...v0.3.0) (2016-11-24)


### Features

* update to latest dag-pb.DAGNode API ([#67](https://github.com/ipld/js-ipld-resolver/issues/67)) ([8a5b201](https://github.com/ipld/js-ipld-resolver/commit/8a5b201))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipld/js-ipld-resolver/compare/v0.1.2...v0.2.0) (2016-11-03)


### Features

* upgrade to new aegir ([#65](https://github.com/ipld/js-ipld-resolver/issues/65)) ([a08f017](https://github.com/ipld/js-ipld-resolver/commit/a08f017))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/ipld/js-ipld-resolver/compare/v0.1.1...v0.1.2) (2016-10-30)



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipld/js-ipld-resolver/compare/v0.1.0...v0.1.1) (2016-10-26)


### Bug Fixes

* point to the right memory store ([c8ce7c2](https://github.com/ipld/js-ipld-resolver/commit/c8ce7c2))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/ipld/js-ipld-resolver/compare/a138a06...v0.1.0) (2016-10-26)


### Bug Fixes

* **resolve:** Ensure all links are resolved ([abb34fd](https://github.com/ipld/js-ipld-resolver/commit/abb34fd))
* Correct name ([54b1e5f](https://github.com/ipld/js-ipld-resolver/commit/54b1e5f))
* remove dead code ([4aa591c](https://github.com/ipld/js-ipld-resolver/commit/4aa591c))


### Features

* Add basic resolve function ([a138a06](https://github.com/ipld/js-ipld-resolver/commit/a138a06))
* add ipld-dag-cbor to the mix ([a186055](https://github.com/ipld/js-ipld-resolver/commit/a186055))
* create a resolver in memory when no block-service is passed ([00d5d46](https://github.com/ipld/js-ipld-resolver/commit/00d5d46))
* drop getRecursive functions ([05d4e74](https://github.com/ipld/js-ipld-resolver/commit/05d4e74))
* follow new dag-pb interface (from new interface-ipld-format ([91ecfa4](https://github.com/ipld/js-ipld-resolver/commit/91ecfa4))
* main resolver (understands dag-pb) ([0818945](https://github.com/ipld/js-ipld-resolver/commit/0818945))
* move resolver to async IPLD format API, update dag-pb tests ([39db563](https://github.com/ipld/js-ipld-resolver/commit/39db563))
* resolve through different formats ([7978fd6](https://github.com/ipld/js-ipld-resolver/commit/7978fd6))
* support for ipld-dag-pb ([436f44c](https://github.com/ipld/js-ipld-resolver/commit/436f44c))
* Update API, use new block-service, block and ipld-dag-pb ([edee5fa](https://github.com/ipld/js-ipld-resolver/commit/edee5fa))
* update dag-cbor tests to async API, solve dag-cbor bug ([733876b](https://github.com/ipld/js-ipld-resolver/commit/733876b))
* upgrade to latest spec ([c2ec9fe](https://github.com/ipld/js-ipld-resolver/commit/c2ec9fe))



