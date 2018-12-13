<a name="0.2.2"></a>
## [0.2.2](https://github.com/ipld/js-ipld-git/compare/v0.2.1...v0.2.2) (2018-10-12)


### Features

* parse mergetags ([f2010df](https://github.com/ipld/js-ipld-git/commit/f2010df))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ipld/js-ipld-git/compare/v0.2.0...v0.2.1) (2018-06-29)


### Bug Fixes

* do not ignore cid.options ([#18](https://github.com/ipld/js-ipld-git/issues/18)) ([4641b63](https://github.com/ipld/js-ipld-git/commit/4641b63))
* pass serialized blob to util.cid ([#16](https://github.com/ipld/js-ipld-git/issues/16)) ([d8f8687](https://github.com/ipld/js-ipld-git/commit/d8f8687))


### Features

* add defaultHashAlg ([d0ccec3](https://github.com/ipld/js-ipld-git/commit/d0ccec3))
* add util.cid options ([#15](https://github.com/ipld/js-ipld-git/issues/15)) ([5ed9c74](https://github.com/ipld/js-ipld-git/commit/5ed9c74))


### BREAKING CHANGES

* the first argument is now the serialized output NOT the dag node.
See https://github.com/ipld/interface-ipld-format/issues/32



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipld/js-ipld-git/compare/v0.1.1...v0.2.0) (2018-02-12)


### Bug Fixes

* use binary blobs directly ([334f2f0](https://github.com/ipld/js-ipld-git/commit/334f2f0))


### BREAKING CHANGES

* Everyone calling the functions of `resolve` need to
pass in the binary data instead of an IPFS block.

So if your input is an IPFS block, the code changes from

    resolver.resolve(block, path, (err, result) => {…}

to

    resolver.resolve(block.data, path, (err, result) => {…}



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipld/js-ipld-git/compare/v0.1.0...v0.1.1) (2017-11-07)


### Bug Fixes

* invalid signature parsing ([#6](https://github.com/ipld/js-ipld-git/issues/6)) ([b1f8bd4](https://github.com/ipld/js-ipld-git/commit/b1f8bd4))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/ipld/js-ipld-git/compare/51a9b5e...v0.1.0) (2017-09-02)


### Bug Fixes

* deps in package.json ([fece381](https://github.com/ipld/js-ipld-git/commit/fece381))


### Features

* v0.1.0 ([51a9b5e](https://github.com/ipld/js-ipld-git/commit/51a9b5e))



