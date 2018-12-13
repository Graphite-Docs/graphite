<a name="0.14.11"></a>
## [0.14.11](https://github.com/ipld/js-ipld-dag-pb/compare/v0.14.10...v0.14.11) (2018-10-26)


### Features

* expose cid property on DAGLinks and DAGNodes ([af3b44d](https://github.com/ipld/js-ipld-dag-pb/commit/af3b44d)), closes [/github.com/ipld/js-ipld-dag-pb/pull/81#issuecomment-410681495](https://github.com//github.com/ipld/js-ipld-dag-pb/pull/81/issues/issuecomment-410681495)



<a name="0.14.10"></a>
## [0.14.10](https://github.com/ipld/js-ipld-dag-pb/compare/v0.14.9...v0.14.10) (2018-09-24)



<a name="0.14.9"></a>
## [0.14.9](https://github.com/ipld/js-ipld-dag-pb/compare/v0.14.8...v0.14.9) (2018-09-24)


### Bug Fixes

* resolve link Name or Tsize ([981cb9f](https://github.com/ipld/js-ipld-dag-pb/commit/981cb9f)), closes [#85](https://github.com/ipld/js-ipld-dag-pb/issues/85)



<a name="0.14.8"></a>
## [0.14.8](https://github.com/ipld/js-ipld-dag-pb/compare/v0.14.7...v0.14.8) (2018-08-13)


### Bug Fixes

* allow mutating returned .toJSON value ([d8239ad](https://github.com/ipld/js-ipld-dag-pb/commit/d8239ad)), closes [ipld/js-ipld-dag-pb#81](https://github.com/ipld/js-ipld-dag-pb/issues/81)



<a name="0.14.7"></a>
## [0.14.7](https://github.com/ipld/js-ipld-dag-pb/compare/v0.14.6...v0.14.7) (2018-08-13)


### Bug Fixes

* support cids in DagLink ([4c701aa](https://github.com/ipld/js-ipld-dag-pb/commit/4c701aa))


### Performance Improvements

* make this._json calculation lazy ([d138c95](https://github.com/ipld/js-ipld-dag-pb/commit/d138c95))



<a name="0.14.6"></a>
## [0.14.6](https://github.com/ipld/js-ipld-dag-pb/compare/v0.14.5...v0.14.6) (2018-07-20)


### Bug Fixes

* add support for resolving links by name ([#78](https://github.com/ipld/js-ipld-dag-pb/issues/78)) ([3f6f094](https://github.com/ipld/js-ipld-dag-pb/commit/3f6f094))



<a name="0.14.5"></a>
## [0.14.5](https://github.com/ipld/js-ipld-dag-pb/compare/v0.14.4...v0.14.5) (2018-06-29)


### Bug Fixes

* pass serialized blob to util.cid ([#75](https://github.com/ipld/js-ipld-dag-pb/issues/75)) ([2ae9542](https://github.com/ipld/js-ipld-dag-pb/commit/2ae9542))
* unlock and update stable dep ([40a5e65](https://github.com/ipld/js-ipld-dag-pb/commit/40a5e65))


### Features

* add defaultHashAlg ([424d2a1](https://github.com/ipld/js-ipld-dag-pb/commit/424d2a1))
* add util.cid options ([#74](https://github.com/ipld/js-ipld-dag-pb/issues/74)) ([1d89fa7](https://github.com/ipld/js-ipld-dag-pb/commit/1d89fa7))


### BREAKING CHANGES

* the first argument is now the serialized output NOT the dag node.
See https://github.com/ipld/interface-ipld-format/issues/32



<a name="0.14.4"></a>
## [0.14.4](https://github.com/ipld/js-ipld-dag-pb/compare/v0.14.3...v0.14.4) (2018-04-25)


### Bug Fixes

* Initialise the DAGLink name to empty string if a falsey value is passed ([575a03f](https://github.com/ipld/js-ipld-dag-pb/commit/575a03f))



<a name="0.14.3"></a>
## [0.14.3](https://github.com/ipld/js-ipld-dag-pb/compare/v0.14.2...v0.14.3) (2018-04-16)


### Bug Fixes

* lock stable dep ([4174338](https://github.com/ipld/js-ipld-dag-pb/commit/4174338)), closes [#65](https://github.com/ipld/js-ipld-dag-pb/issues/65)



<a name="0.14.2"></a>
## [0.14.2](https://github.com/ipld/js-ipld-dag-pb/compare/v0.14.1...v0.14.2) (2018-04-11)



<a name="0.14.1"></a>
## [0.14.1](https://github.com/ipld/js-ipld-dag-pb/compare/v0.14.0...v0.14.1) (2018-04-10)



<a name="0.14.0"></a>
# [0.14.0](https://github.com/ipld/js-ipld-dag-pb/compare/v0.13.1...v0.14.0) (2018-04-09)


### Bug Fixes

* replace constructor.name with instanceof ([881d572](https://github.com/ipld/js-ipld-dag-pb/commit/881d572))


### Features

* use class-is module for type checks ([621c12c](https://github.com/ipld/js-ipld-dag-pb/commit/621c12c))



<a name="0.13.1"></a>
## [0.13.1](https://github.com/ipld/js-ipld-dag-pb/compare/v0.13.0...v0.13.1) (2018-02-26)


### Bug Fixes

* return deserialized node if no path is given ([bcba192](https://github.com/ipld/js-ipld-dag-pb/commit/bcba192))



<a name="0.13.0"></a>
# [0.13.0](https://github.com/ipld/js-ipld-dag-pb/compare/v0.12.0...v0.13.0) (2018-02-12)



<a name="0.12.0"></a>
# [0.12.0](https://github.com/ipld/js-ipld-dag-pb/compare/v0.11.4...v0.12.0) (2018-02-12)


### Bug Fixes

* Fix false positives in isLink and update test ([#51](https://github.com/ipld/js-ipld-dag-pb/issues/51)) ([73b21c7](https://github.com/ipld/js-ipld-dag-pb/commit/73b21c7))
* use binary blobs directly ([50edc45](https://github.com/ipld/js-ipld-dag-pb/commit/50edc45))


### BREAKING CHANGES

* Everyone calling the functions of `resolve` need to
pass in the binary data instead of an IPFS block.

So if your input is an IPFS block, the code changes from

    resolver.resolve(block, path, (err, result) => {…}

to

    resolver.resolve(block.data, path, (err, result) => {…}



<a name="0.11.4"></a>
## [0.11.4](https://github.com/ipld/js-ipld-dag-pb/compare/v0.11.3...v0.11.4) (2017-12-02)


### Features

* If link hashes to serializer are base58 encoded, then decode them [Fi… ([#43](https://github.com/ipld/js-ipld-dag-pb/issues/43)) ([9f66bca](https://github.com/ipld/js-ipld-dag-pb/commit/9f66bca)), closes [#28](https://github.com/ipld/js-ipld-dag-pb/issues/28)



<a name="0.11.3"></a>
## [0.11.3](https://github.com/ipld/js-ipld-dag-pb/compare/v0.11.2...v0.11.3) (2017-11-07)



<a name="0.11.2"></a>
## [0.11.2](https://github.com/ipld/js-ipld-dag-pb/compare/v0.11.0...v0.11.2) (2017-09-07)


### Bug Fixes

* **package:** update cids to version 0.5.0 ([b1d4b0f](https://github.com/ipld/js-ipld-dag-pb/commit/b1d4b0f))
* switch to protobufjs ([#39](https://github.com/ipld/js-ipld-dag-pb/issues/39)) ([5130844](https://github.com/ipld/js-ipld-dag-pb/commit/5130844))


### Features

* replace protocol-buffers with protons ([#42](https://github.com/ipld/js-ipld-dag-pb/issues/42)) ([603e11f](https://github.com/ipld/js-ipld-dag-pb/commit/603e11f))



<a name="0.11.1"></a>
## [0.11.1](https://github.com/ipld/js-ipld-dag-pb/compare/v0.11.0...v0.11.1) (2017-09-05)


### Bug Fixes

* **package:** update cids to version 0.5.0 ([b1d4b0f](https://github.com/ipld/js-ipld-dag-pb/commit/b1d4b0f))
* switch to protobufjs ([#39](https://github.com/ipld/js-ipld-dag-pb/issues/39)) ([5130844](https://github.com/ipld/js-ipld-dag-pb/commit/5130844))



<a name="0.11.0"></a>
# [0.11.0](https://github.com/ipld/js-ipld-dag-pb/compare/v0.10.1...v0.11.0) (2017-03-21)


### Features

* upgrade to new ipfs-block and blockservice ([1dd4dd2](https://github.com/ipld/js-ipld-dag-pb/commit/1dd4dd2))



<a name="0.10.1"></a>
## [0.10.1](https://github.com/ipld/js-ipld-dag-pb/compare/v0.10.0...v0.10.1) (2017-03-16)



<a name="0.10.0"></a>
# [0.10.0](https://github.com/ipld/js-ipld-dag-pb/compare/v0.9.5...v0.10.0) (2017-03-13)


### Bug Fixes

* **deps:** move bs58 to regular dependecies ([e69c9bc](https://github.com/ipld/js-ipld-dag-pb/commit/e69c9bc))
* remove starting slash ([ad47ffa](https://github.com/ipld/js-ipld-dag-pb/commit/ad47ffa))


### Features

* change window to self for webworker support ([a68d50e](https://github.com/ipld/js-ipld-dag-pb/commit/a68d50e))
* **ww:** Full support for webworkers ([e073e08](https://github.com/ipld/js-ipld-dag-pb/commit/e073e08))
* update isCID to isLink by spec ([df759c8](https://github.com/ipld/js-ipld-dag-pb/commit/df759c8))



<a name="0.9.5"></a>
## [0.9.5](https://github.com/ipld/js-ipld-dag-pb/compare/v0.9.4...v0.9.5) (2017-02-09)


### Bug Fixes

* **package:** update is-ipfs to version 0.3.0 ([2620f9d](https://github.com/ipld/js-ipld-dag-pb/commit/2620f9d))



<a name="0.9.4"></a>
## [0.9.4](https://github.com/ipld/js-ipld-dag-pb/compare/v0.9.3...v0.9.4) (2017-01-29)



<a name="0.9.3"></a>
## [0.9.3](https://github.com/ipld/js-ipld-dag-pb/compare/v0.9.2...v0.9.3) (2016-12-07)


### Bug Fixes

* detect when unvalid dagPB node ([068b1e2](https://github.com/ipld/js-ipld-dag-pb/commit/068b1e2))



<a name="0.9.2"></a>
## [0.9.2](https://github.com/ipld/js-ipld-dag-pb/compare/v0.9.1...v0.9.2) (2016-12-01)



<a name="0.9.1"></a>
## [0.9.1](https://github.com/ipld/js-ipld-dag-pb/compare/v0.9.0...v0.9.1) (2016-11-24)


### Bug Fixes

* ensure empty link names are preserved ([ad11b7a](https://github.com/ipld/js-ipld-dag-pb/commit/ad11b7a))
* fixtures loading in the browser ([405dd01](https://github.com/ipld/js-ipld-dag-pb/commit/405dd01))
* linting ([d51245c](https://github.com/ipld/js-ipld-dag-pb/commit/d51245c))
* sort links in creation ([8519b3b](https://github.com/ipld/js-ipld-dag-pb/commit/8519b3b))
* use aegir fixtures instead ([c492997](https://github.com/ipld/js-ipld-dag-pb/commit/c492997))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/ipld/js-ipld-dag-pb/compare/v0.8.0...v0.9.0) (2016-11-24)


### Bug Fixes

* apply code review ([2b1a356](https://github.com/ipld/js-ipld-dag-pb/commit/2b1a356))
* DAGLink tests ([eec00da](https://github.com/ipld/js-ipld-dag-pb/commit/eec00da))
* serialization of empty node ([ae71f26](https://github.com/ipld/js-ipld-dag-pb/commit/ae71f26))
* that linting ([301d0b0](https://github.com/ipld/js-ipld-dag-pb/commit/301d0b0))


### Features

* **refactor:** new API proposal ([b56d797](https://github.com/ipld/js-ipld-dag-pb/commit/b56d797))
* add a same create pattern api for DAGLink ([6a3531d](https://github.com/ipld/js-ipld-dag-pb/commit/6a3531d))
* IPLD Resolver updated, all tests passing ([f53e0c8](https://github.com/ipld/js-ipld-dag-pb/commit/f53e0c8))
* refactor, structure code, make DAGNode funcs inside the same folder, make tests pass again ([ea904a7](https://github.com/ipld/js-ipld-dag-pb/commit/ea904a7))
* update DAGLink and DAGNode to have an immutable API ([4bdb48b](https://github.com/ipld/js-ipld-dag-pb/commit/4bdb48b))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/ipld/js-ipld-dag-pb/compare/v0.1.3...v0.8.0) (2016-11-03)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipld/js-ipld-dag-pb/compare/v0.1.3...v0.3.0) (2016-11-03)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipld/js-ipld-dag-pb/compare/v0.1.3...v0.2.0) (2016-11-03)



<a name="0.1.3"></a>
## [0.1.3](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.1.2...v0.1.3) (2016-10-27)


### Bug Fixes

* toJSON should return multihash as a b58String ([3c34563](https://github.com/ipfs/js-ipfs-merkle-dag/commit/3c34563))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.1.1...v0.1.2) (2016-10-26)


### Bug Fixes

* do not call callbacks inside try catch blocks ([9cc237e](https://github.com/ipfs/js-ipfs-merkle-dag/commit/9cc237e))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.1.0...v0.1.1) (2016-10-26)


### Bug Fixes

* size func ([655a964](https://github.com/ipfs/js-ipfs-merkle-dag/commit/655a964))



<a name="0.1.0"></a>
# 0.1.0 (2016-10-26)


### Bug Fixes

* **dag-node:** ensure links are always DAGLinks ([219cf5d](https://github.com/ipfs/js-ipfs-merkle-dag/commit/219cf5d))
* **deps:** add missing pull-stream dependency ([5ef7176](https://github.com/ipfs/js-ipfs-merkle-dag/commit/5ef7176))
* browser testing (dixie problem) ([0c98929](https://github.com/ipfs/js-ipfs-merkle-dag/commit/0c98929))
* do not convert existing daglinks ([0e4361f](https://github.com/ipfs/js-ipfs-merkle-dag/commit/0e4361f))


### Features

* generate cid ([6165a91](https://github.com/ipfs/js-ipfs-merkle-dag/commit/6165a91))
* let utils be utils ([82fc2fe](https://github.com/ipfs/js-ipfs-merkle-dag/commit/82fc2fe))
* migrate dag-node size, multihash and util serialize, deserialize and cid to async from sync ([d2bf303](https://github.com/ipfs/js-ipfs-merkle-dag/commit/d2bf303))
* migrate resolver to async API ([2d3d220](https://github.com/ipfs/js-ipfs-merkle-dag/commit/2d3d220))
* new util API, move serialize, deserialize and cid out ([473a991](https://github.com/ipfs/js-ipfs-merkle-dag/commit/473a991))
* resolver, tree + tests ([23ba424](https://github.com/ipfs/js-ipfs-merkle-dag/commit/23ba424))
* s/copy/clone, simplify internal API (encoded stuff) and update tests to understand cid ([bbb5ab9](https://github.com/ipfs/js-ipfs-merkle-dag/commit/bbb5ab9))
* yield remainderPath if not possible to result through ([680bf4e](https://github.com/ipfs/js-ipfs-merkle-dag/commit/680bf4e))



<a name="0.7.3"></a>
## [0.7.3](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.7.2...v0.7.3) (2016-09-09)



<a name="0.7.2"></a>
## [0.7.2](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.7.1...v0.7.2) (2016-09-09)



<a name="0.7.1"></a>
## [0.7.1](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.7.0...v0.7.1) (2016-09-09)


### Bug Fixes

* **deps:** add missing pull-stream dependency ([5ef7176](https://github.com/ipfs/js-ipfs-merkle-dag/commit/5ef7176))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.6.2...v0.7.0) (2016-09-08)



<a name="0.6.2"></a>
## [0.6.2](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.6.1...v0.6.2) (2016-08-04)



<a name="0.6.1"></a>
## [0.6.1](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.6.0...v0.6.1) (2016-08-04)



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.5.1...v0.6.0) (2016-05-16)


### Bug Fixes

* **dag-node:** ensure links are always DAGLinks ([219cf5d](https://github.com/ipfs/js-ipfs-merkle-dag/commit/219cf5d))
* do not convert existing daglinks ([0e4361f](https://github.com/ipfs/js-ipfs-merkle-dag/commit/0e4361f))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.5.0...v0.5.1) (2016-05-12)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.4.3...v0.5.0) (2016-05-02)



<a name="0.4.3"></a>
## [0.4.3](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.4.2...v0.4.3) (2016-04-28)



<a name="0.4.2"></a>
## [0.4.2](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.4.1...v0.4.2) (2016-04-26)



<a name="0.4.1"></a>
## [0.4.1](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.4.0...v0.4.1) (2016-04-26)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.3.0...v0.4.0) (2016-04-13)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.2.1...v0.3.0) (2016-03-21)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.2.0...v0.2.1) (2016-02-03)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.1.1...v0.2.0) (2016-02-03)



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.1.0...v0.1.1) (2016-01-31)



<a name="0.1.0"></a>
# [0.1.0](https://github.com/ipfs/js-ipfs-merkle-dag/compare/v0.0.2...v0.1.0) (2016-01-31)



<a name="0.0.2"></a>
## 0.0.2 (2016-01-19)



