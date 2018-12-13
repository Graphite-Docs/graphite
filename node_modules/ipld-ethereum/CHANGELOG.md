<a name="2.0.2"></a>
## [2.0.2](https://github.com/ipld/js-ipld-ethereum/compare/v2.0.1...v2.0.2) (2018-11-07)


### Bug Fixes

* sorting function needs to return an integer ([662d8ec](https://github.com/ipld/js-ipld-ethereum/commit/662d8ec))
* **package:** update ipfs-block to version 0.8.0 ([7013beb](https://github.com/ipld/js-ipld-ethereum/commit/7013beb))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/ipld/js-ipld-ethereum/compare/v2.0.0...v2.0.1) (2018-07-13)


### Bug Fixes

* implement CID options ([#21](https://github.com/ipld/js-ipld-ethereum/issues/21)) ([da25e17](https://github.com/ipld/js-ipld-ethereum/commit/da25e17))


### Features

* add defaultHashAlg ([e767312](https://github.com/ipld/js-ipld-ethereum/commit/e767312))
* add util.cid options ([#17](https://github.com/ipld/js-ipld-ethereum/issues/17)) ([f416b43](https://github.com/ipld/js-ipld-ethereum/commit/f416b43)), closes [ipld/interface-ipld-format#40](https://github.com/ipld/interface-ipld-format/issues/40)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/ipld/js-ipld-ethereum/compare/v1.4.4...v2.0.0) (2018-02-12)


### Bug Fixes

* use binary blobs directly ([e69f539](https://github.com/ipld/js-ipld-ethereum/commit/e69f539))


### BREAKING CHANGES

* Everyone calling the functions of `resolve` need to
pass in the binary data instead of an IPFS block.

So if your input is an IPFS block, the code changes from

    resolver.resolve(block, path, (err, result) => {…}

to

    resolver.resolve(block.data, path, (err, result) => {…}



<a name="1.4.4"></a>
## [1.4.4](https://github.com/ipld/js-ipld-ethereum/compare/v1.4.2...v1.4.4) (2017-11-07)



<a name="1.4.2"></a>
## [1.4.2](https://github.com/ipld/js-ipld-ethereum/compare/v1.4.1...v1.4.2) (2017-08-25)


### Features

* update module: name, ci, packages ([bbaf528](https://github.com/ipld/js-ipld-ethereum/commit/bbaf528))



<a name="1.4.1"></a>
## [1.4.1](https://github.com/ipld/js-ipld-ethereum/compare/v1.4.0...v1.4.1) (2017-07-11)



<a name="1.4.0"></a>
# [1.4.0](https://github.com/ipld/js-ipld-ethereum/compare/v1.3.0...v1.4.0) (2017-07-11)



<a name="1.3.0"></a>
# [1.3.0](https://github.com/ipld/js-ipld-ethereum/compare/v1.2.1...v1.3.0) (2017-07-11)



<a name="1.2.1"></a>
## [1.2.1](https://github.com/ipld/js-ipld-ethereum/compare/v1.2.0...v1.2.1) (2017-07-10)



<a name="1.2.0"></a>
# [1.2.0](https://github.com/ipld/js-ipld-ethereum/compare/v1.1.0...v1.2.0) (2017-07-10)



<a name="1.1.0"></a>
# 1.1.0 (2017-07-10)



