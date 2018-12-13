<a name="2.0.1"></a>
## [2.0.1](https://github.com/ipld/js-ipld-raw/compare/v2.0.0...v2.0.1) (2018-06-29)


### Bug Fixes

* resolver.tree allow options to be ommitted ([2903bf7](https://github.com/ipld/js-ipld-raw/commit/2903bf7)), closes [#4](https://github.com/ipld/js-ipld-raw/issues/4)


### Features

* add defaultHashAlg ([b7db79b](https://github.com/ipld/js-ipld-raw/commit/b7db79b))
* add util.cid options ([#13](https://github.com/ipld/js-ipld-raw/issues/13)) ([bb2fbf7](https://github.com/ipld/js-ipld-raw/commit/bb2fbf7)), closes [ipld/interface-ipld-format#40](https://github.com/ipld/interface-ipld-format/issues/40)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/ipld/js-ipld-raw/compare/v1.0.7...v2.0.0) (2018-02-12)


### Bug Fixes

* use binary blobs directly ([6fc00cd](https://github.com/ipld/js-ipld-raw/commit/6fc00cd))


### BREAKING CHANGES

* Everyone calling the functions of `resolve` need to
pass in the binary data instead of an IPFS block.

So if your input is an IPFS block, the code changes from

    resolver.resolve(block, path, (err, result) => {…}

to

    resolver.resolve(block.data, path, (err, result) => {…}



<a name="1.0.7"></a>
## [1.0.7](https://github.com/ipld/js-ipld-raw/compare/v1.0.5...v1.0.7) (2017-11-07)



<a name="1.0.5"></a>
## [1.0.5](https://github.com/ipld/js-ipld-raw/compare/v1.0.4...v1.0.5) (2017-10-06)



<a name="1.0.4"></a>
## [1.0.4](https://github.com/ipld/js-ipld-raw/compare/v1.0.3...v1.0.4) (2017-10-06)



<a name="1.0.3"></a>
## [1.0.3](https://github.com/ipld/js-ipld-raw/compare/v1.0.2...v1.0.3) (2017-10-06)



<a name="1.0.2"></a>
## 1.0.2 (2017-10-06)



