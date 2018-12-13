<a name="0.32.8"></a>
## [0.32.8](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.32.7...v0.32.8) (2018-10-25)



<a name="0.32.7"></a>
## [0.32.7](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.32.6...v0.32.7) (2018-10-12)


### Bug Fixes

* return correct chunks of streams, fixes [#229](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/229) ([362c685](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/362c685))
* skip rabin tests on windows ([ea9e3c3](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/ea9e3c3))



<a name="0.32.6"></a>
## [0.32.6](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.32.5...v0.32.6) (2018-10-12)


### Bug Fixes

* do not use cid property of DAGNodes just yet ([7a2a308](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/7a2a308))



<a name="0.32.5"></a>
## [0.32.5](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.32.4...v0.32.5) (2018-10-12)


### Bug Fixes

* do not overwrite cid property of DAGNodes ([c2e38ae](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/c2e38ae))
* make sure errors from unmarshalling are caught ([8b2335c](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/8b2335c))



<a name="0.32.4"></a>
## [0.32.4](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.32.3...v0.32.4) (2018-08-23)


### Bug Fixes

* build & export interop with go-ipfs for small file raw leaves ([11885fa](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/11885fa))



<a name="0.32.3"></a>
## [0.32.3](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.32.2...v0.32.3) (2018-08-21)


### Bug Fixes

* import with CID version 1 ([6ef929d](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/6ef929d))
* typo ([c5cb38b](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/c5cb38b))



<a name="0.32.2"></a>
## [0.32.2](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.32.1...v0.32.2) (2018-08-11)


### Bug Fixes

* make rabin an optional dependency ([bef3152](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/bef3152))
* skip first hash algorithm as it is no longer valid ([0b84b76](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/0b84b76)), closes [js-multihash#57](https://github.com/js-multihash/issues/57)



<a name="0.32.1"></a>
## [0.32.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.32.0...v0.32.1) (2018-08-08)


### Bug Fixes

* do not emit empty buffers for non-empty files ([ccc4ad2](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/ccc4ad2))



<a name="0.32.0"></a>
# [0.32.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.31.3...v0.32.0) (2018-08-08)


### Features

* **importer:** add rabin fingerprinting chunk algorithm ([83a5feb](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/83a5feb)), closes [ipfs/js-ipfs#1283](https://github.com/ipfs/js-ipfs/issues/1283)



<a name="0.31.3"></a>
## [0.31.3](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.31.2...v0.31.3) (2018-07-24)


### Bug Fixes

* return cids from builder ([0d3d3d8](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/0d3d3d8))



<a name="0.31.2"></a>
## [0.31.2](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.31.1...v0.31.2) (2018-07-20)



<a name="0.31.1"></a>
## [0.31.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.31.0...v0.31.1) (2018-07-19)



<a name="0.31.0"></a>
# [0.31.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.30.1...v0.31.0) (2018-07-19)



<a name="0.30.1"></a>
## [0.30.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.30.0...v0.30.1) (2018-07-19)


### Features

* support --raw-leaves ([7a29d83](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/7a29d83)), closes [ipfs/js-ipfs#1432](https://github.com/ipfs/js-ipfs/issues/1432)



<a name="0.30.0"></a>
# [0.30.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.29.0...v0.30.0) (2018-06-12)



<a name="0.29.0"></a>
# [0.29.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.28.1...v0.29.0) (2018-04-23)



<a name="0.28.1"></a>
## [0.28.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.28.0...v0.28.1) (2018-04-12)



<a name="0.28.0"></a>
# [0.28.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.27.0...v0.28.0) (2018-04-10)



<a name="0.27.0"></a>
# [0.27.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.26.0...v0.27.0) (2018-03-27)


### Features

* exporter - support slicing streams stored in deeply nested DAGs ([#208](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/208)) ([8568cd5](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/8568cd5))



<a name="0.26.0"></a>
# [0.26.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.25.0...v0.26.0) (2018-03-22)


### Features

* Adds begin/end byte slices to exporter ([#207](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/207)) ([8e11d77](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/8e11d77))



<a name="0.25.0"></a>
# [0.25.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.24.4...v0.25.0) (2018-03-20)


### Features

* Add reader to read files or part of files as streams ([833accf](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/833accf))



<a name="0.24.4"></a>
## [0.24.4](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.24.3...v0.24.4) (2018-02-27)


### Bug Fixes

* use "ipld" instead of "ipld-resolver" ([f4de206](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/f4de206))



<a name="0.24.3"></a>
## [0.24.3](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.24.2...v0.24.3) (2018-02-27)



<a name="0.24.2"></a>
## [0.24.2](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.24.1...v0.24.2) (2017-12-15)



<a name="0.24.1"></a>
## [0.24.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.24.0...v0.24.1) (2017-11-12)



<a name="0.24.0"></a>
# [0.24.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.23.1...v0.24.0) (2017-11-12)


### Features

* exporter maxDepth ([#197](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/197)) ([211e4e3](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/211e4e3))



<a name="0.23.1"></a>
## [0.23.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.23.0...v0.23.1) (2017-11-10)


### Features

* windows interop ([#195](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/195)) ([aa21ff3](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/aa21ff3))



<a name="0.23.0"></a>
# [0.23.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.22.5...v0.23.0) (2017-11-07)


### Features

* Include hash field for exported files ([#191](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/191)) ([8b13957](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/8b13957))



<a name="0.22.5"></a>
## [0.22.5](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.22.4...v0.22.5) (2017-09-08)


### Features

* Use passed cidVersion option when writing to storage ([#185](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/185)) ([0cd2d60](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/0cd2d60))



<a name="0.22.4"></a>
## [0.22.4](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.22.3...v0.22.4) (2017-09-08)


### Features

* allow specify hash algorithm for large files ([#184](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/184)) ([69915da](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/69915da))



<a name="0.22.3"></a>
## [0.22.3](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.22.2...v0.22.3) (2017-09-07)



<a name="0.22.2"></a>
## [0.22.2](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.22.1...v0.22.2) (2017-09-07)


### Features

* Add `onlyHash` option ([#183](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/183)) ([7450a65](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/7450a65))
* adds call to progress bar function ([#179](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/179)) ([ac6f722](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/ac6f722))



<a name="0.22.1"></a>
## [0.22.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.22.0...v0.22.1) (2017-09-04)



<a name="0.22.0"></a>
# [0.22.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.21.0...v0.22.0) (2017-07-23)



<a name="0.21.0"></a>
# [0.21.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.20.0...v0.21.0) (2017-07-04)



<a name="0.20.0"></a>
# [0.20.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.19.2...v0.20.0) (2017-06-16)


### Features

* subtree support ([#175](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/175)) ([16b788c](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/16b788c))



<a name="0.19.2"></a>
## [0.19.2](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.19.1...v0.19.2) (2017-05-25)


### Bug Fixes

* **package:** update cids to version 0.5.0 ([59d6d0a](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/59d6d0a))


### Features

* dag-api direct support ([adaeb37](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/adaeb37))



<a name="0.19.1"></a>
## [0.19.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.19.0...v0.19.1) (2017-03-29)


### Bug Fixes

* adding a dir: leaf node gets replaced with dir if necessary ([1d682ec](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/1d682ec))



<a name="0.19.0"></a>
# [0.19.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.18.0...v0.19.0) (2017-03-24)


### Bug Fixes

* breaking the stack when importing ([993f746](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/993f746))
* passing browser tests ([29b2740](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/29b2740))
* using correct murmur3 codec name ([295d86e](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/295d86e))
* using the new IPLD API ([a80f4d8](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/a80f4d8))



<a name="0.18.0"></a>
# [0.18.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.17.0...v0.18.0) (2017-03-22)


### Bug Fixes

* **package:** update ipld-dag-pb to version 0.10.0 ([#154](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/154)) ([304ff25](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/304ff25))
* **package:** update pull-pause to version 0.0.1 ([#153](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/153)) ([4dd2143](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/4dd2143))


### Features

* upgrade to the next version of ipfs-block and blockservice ([0ca25b2](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/0ca25b2))



<a name="0.17.0"></a>
# [0.17.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.16.1...v0.17.0) (2017-02-08)


### Features

* update to latest ipld-resolver ([#137](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/137)) ([211dfb6](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/211dfb6))



<a name="0.16.1"></a>
## [0.16.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.16.0...v0.16.1) (2017-02-02)


### Bug Fixes

* exporter: recurse correctly into subdirs ([#136](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/136)) ([69c0d04](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/69c0d04))



<a name="0.16.0"></a>
# [0.16.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.15.4...v0.16.0) (2017-02-02)


### Bug Fixes

* **package:** update is-ipfs to version 0.3.0 ([#134](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/134)) ([0063f9d](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/0063f9d))



<a name="0.15.4"></a>
## [0.15.4](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.15.3...v0.15.4) (2017-01-31)


### Bug Fixes

* case for empty file ([#132](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/132)) ([fee55d1](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/fee55d1))



<a name="0.15.3"></a>
## [0.15.3](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.15.2...v0.15.3) (2017-01-30)


### Bug Fixes

* expect empty stream to not generate any nodes ([#131](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/131)) ([7b054b6](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/7b054b6))



<a name="0.15.2"></a>
## [0.15.2](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.15.1...v0.15.2) (2017-01-30)


### Bug Fixes

* stop export visitor from trying to resolve leaf object ([#130](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/130)) ([651f113](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/651f113))



<a name="0.15.1"></a>
## [0.15.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.15.0...v0.15.1) (2017-01-29)


### Bug Fixes

* **package:** update cids to version 0.4.0 ([#122](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/122)) ([65a6759](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/65a6759))



<a name="0.15.0"></a>
# [0.15.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.14.2...v0.15.0) (2017-01-11)



<a name="0.14.2"></a>
## [0.14.2](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.14.1...v0.14.2) (2016-12-13)



<a name="0.14.1"></a>
## [0.14.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.14.0...v0.14.1) (2016-12-08)



<a name="0.14.0"></a>
# [0.14.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.13.0...v0.14.0) (2016-11-24)


### Features

* upgrade to latest dag-pb API ([#88](https://github.com/ipfs/js-ipfs-unixfs-engine/issues/88)) ([51d1245](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/51d1245))



<a name="0.13.0"></a>
# [0.13.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.12.0...v0.13.0) (2016-11-03)



<a name="0.12.0"></a>
# [0.12.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.11.4...v0.12.0) (2016-10-28)


### Bug Fixes

* **exporter:** add some parallel fetching of blocks where possible ([43503d4](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/43503d4))


### Features

* migrate importer to use IPLD Resolver and the new IPLD format ([89c3602](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/89c3602))



<a name="0.11.4"></a>
## [0.11.4](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.11.3...v0.11.4) (2016-09-11)


### Features

* **exporter:** implement recursive file export ([68e09a7](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/68e09a7))



<a name="0.11.3"></a>
## [0.11.3](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.11.2...v0.11.3) (2016-09-09)


### Features

* **exporter:** return file sizes ([73cf78a](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/73cf78a))



<a name="0.11.2"></a>
## [0.11.2](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.11.1...v0.11.2) (2016-09-09)



<a name="0.11.1"></a>
## [0.11.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.11.0...v0.11.1) (2016-09-09)



<a name="0.11.0"></a>
# [0.11.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.10.2...v0.11.0) (2016-09-08)


### Bug Fixes

* **tests:** ignore ordering ([f8d1b2a](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/f8d1b2a))



<a name="0.10.2"></a>
## [0.10.2](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.10.1...v0.10.2) (2016-08-09)



<a name="0.10.1"></a>
## [0.10.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.10.0...v0.10.1) (2016-08-09)



<a name="0.10.0"></a>
# [0.10.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.9.0...v0.10.0) (2016-06-28)



<a name="0.9.0"></a>
# [0.9.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.8.0...v0.9.0) (2016-05-27)



<a name="0.8.0"></a>
# [0.8.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.7.0...v0.8.0) (2016-05-21)



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.6.1...v0.7.0) (2016-05-21)



<a name="0.6.1"></a>
## [0.6.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.6.0...v0.6.1) (2016-05-05)



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.5.0...v0.6.0) (2016-05-03)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.4.5...v0.5.0) (2016-04-26)



<a name="0.4.5"></a>
## [0.4.5](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.4.4...v0.4.5) (2016-04-24)



<a name="0.4.4"></a>
## [0.4.4](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.4.3...v0.4.4) (2016-04-24)



<a name="0.4.3"></a>
## [0.4.3](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.4.2...v0.4.3) (2016-04-24)


### Bug Fixes

* clean up dependencies ([a3bee40](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/a3bee40))
* **importer:** cleanup smaller issues ([eab17fe](https://github.com/ipfs/js-ipfs-unixfs-engine/commit/eab17fe))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.4.1...v0.4.2) (2016-04-19)



<a name="0.4.1"></a>
## [0.4.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.4.0...v0.4.1) (2016-04-19)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.3.3...v0.4.0) (2016-04-19)



<a name="0.3.3"></a>
## [0.3.3](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.3.2...v0.3.3) (2016-03-22)



<a name="0.3.2"></a>
## [0.3.2](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.3.1...v0.3.2) (2016-03-22)



<a name="0.3.1"></a>
## [0.3.1](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.3.0...v0.3.1) (2016-03-22)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.2.0...v0.3.0) (2016-03-21)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/js-ipfs-unixfs-engine/compare/v0.1.0...v0.2.0) (2016-02-17)



<a name="0.1.0"></a>
# 0.1.0 (2016-02-12)



