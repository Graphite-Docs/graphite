## 3.0.27 (2018-09-21)

Bugfix:
  - Kill `use asm`

## 3.0.25 (2015-08-27)

Bugfix:
  - unbreak due to bad version of IcedCoffeeScript. Fix with v108.0.8

## 3.0.24 (2015-08-27)

Bugfix:
  - Don't copy() extra key material, since we're not scrubbing it.

## 3.0.23 (2015-08-27)

Bugfix:
  - Fix more issues in cloning, and also bugs in scrubbing derived keys

## 3.0.22 (2015-08-27)

Bugfix:
  - Do the same for Encryptor, so fix a bug

## 3.0.21 (2015-08-27)

Features:

  - Encryptor / Decryptor clone support

## 3.0.20 (2015-05-31)

Bugfixes:
  - Bower matches package.json

## 3.0.19 (2014-08-18)

Bugfixes:

  - Remove errant iced-coffee-script inclusion
     - Address keybase/kbpgp#40

## 3.0.18 (2014-08-16)

Features:

  - Upgrade more-entropy to make it more polite on energy-constrained devices

## 3.0.17 (2014-06-17)

Features:

  - RipeMD160 support

## 3.0.14-3.0.16 (2014-05-26)

Bugfixes:

  - Various small changes to package.json to debug install problems with npm
 

## 3.0.13 (2014-05-26)

Features:

  - Expose other hmac features

## 3.0.12 (2014-05-22)

Features:

  - Expose Salsa20 and CTR to modules

## 3.0.11 (2014-05-18)

Features:

   - Buffer comparison as an unsigned big-endian number

## 3.0.10 (2014-04-14)

Bugfixes:

  - SHA224 and SHA384 were reporting incorrect hash lengths 

## 3.0.9 (2014-04-14)

Bugfixes:

  - Fix bug in SHA384 inclusion

## 3.0.8 (2014-04-13)

Features:

  - SHA384 implementation

## 3.0.7 (2014-03-11)

Features:

  - MD5 implementation

## 3.0.6 (2014-2-21)

Bugfixes:

  - Get IE11 working, with window.msCrypto.getRandomValues

Features:

  - Inaugural changelog
