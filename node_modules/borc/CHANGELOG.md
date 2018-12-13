<a name="2.0.4"></a>
## [2.0.4](https://github.com/dignifiedquire/borc/compare/v2.0.3...v2.0.4) (2018-10-18)


### Performance Improvements

* avoid object allocation when creating strings from the underlying buffer ([e609298](https://github.com/dignifiedquire/borc/commit/e609298))



<a name="2.0.3"></a>
## [2.0.3](https://github.com/dignifiedquire/borc/compare/v2.0.2...v2.0.3) (2018-05-02)


### Bug Fixes

* **decoder:** handle 32bit byte strings and utf8 strings ([7c5707c](https://github.com/dignifiedquire/borc/commit/7c5707c)), closes [#19](https://github.com/dignifiedquire/borc/issues/19)
* **decoder:** handle larger arrays ([562f14b](https://github.com/dignifiedquire/borc/commit/562f14b)), closes [#20](https://github.com/dignifiedquire/borc/issues/20)
* **encoder:** cast uint8arrays to a buffer ([7f34f6a](https://github.com/dignifiedquire/borc/commit/7f34f6a)), closes [#13](https://github.com/dignifiedquire/borc/issues/13)
* **encoder:** correct return value on `.write` ([8eb9b1f](https://github.com/dignifiedquire/borc/commit/8eb9b1f)), closes [#27](https://github.com/dignifiedquire/borc/issues/27)


### Features

* upgrade dependencies ([54a5073](https://github.com/dignifiedquire/borc/commit/54a5073))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/dignifiedquire/borc/compare/v2.0.1...v2.0.2) (2017-01-29)


### Bug Fixes

* **decoder:** correct ByteBuffer and ByteString handling ([4ed9a69](https://github.com/dignifiedquire/borc/commit/4ed9a69))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/dignifiedquire/borc/compare/v2.0.0...v2.0.1) (2016-12-14)


### Bug Fixes

* **decoder:** handle large input sizes ([b44cdfe](https://github.com/dignifiedquire/borc/commit/b44cdfe)), closes [#10](https://github.com/dignifiedquire/borc/issues/10)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/dignifiedquire/borc/compare/v2.0.2...v2.0.0) (2016-12-11)


### Features

* **decoder:** implement diagnose decoder ([857f9a9](https://github.com/dignifiedquire/borc/commit/857f9a9)), closes [#5](https://github.com/dignifiedquire/borc/issues/5)
* add docs setup ([8164bc2](https://github.com/dignifiedquire/borc/commit/8164bc2))
* rename to borc ([936dfc8](https://github.com/dignifiedquire/borc/commit/936dfc8))



