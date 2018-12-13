webcrypto-shim.js
=================

[Web Cryptography API](www.w3.org/TR/WebCryptoAPI/) shim for legacy browsers.

Quick start with _Bower_
------------------------

Install the package

```sh
$ bower install webcrypto-shim
```

and link scripts into your html code

```html
<script src="bower_components/promiz/promiz.js"></script>
<script src="bower_components/webcrypto-shim/webcrypto-shim.js"></script>
```

Now you can use webcrypto api through the `window.crypto` and `window.crypto.subtle` objects.

Note that _IE11_ lacks support of `Promise`-s and requires _promiz.js_ to work properly. You can replace _promiz.js_ with any _Promise/A+_-compatible implementation.

Supported browsers
------------------

The library is targeted to fix these browsers having prefixed and buggy webcrypto api implementations:
* _Internet Explorer 11_, _Mobile Internet Explorer 11_,
* _Safari 8+_, _iOS Safari 8+_.

These browsers have unprefixed and conforming webcrypto api implementations, so no need in shim:
* _Chrome 43+_, _Chrome for Android 44+_,
* _Opera 24+_,
* _Firefox 34+_,
* _Edge 12+_.

Crossbrowser support of algorithms & operations
-----------------------------------------------

* **SHA-256**, **SHA-384**: `digest`

* **HMAC**: `sign`, `verify`, `generateKey`, `importKey`, `exportKey`
  * with _hash_ **SHA-1**, **SHA-256**, **SHA-384**

* **AES-CBC**: `encrypt`, `decrypt`, `generateKey`, `importKey`, `exportKey`, `wrapKey`, `unwrapKey`
  * _TODO_ tests

* **AES-KW**: `generateKey`, `importKey`, `exportKey`, `wrapKey`, `unwrapKey`
  * _TODO_ tests

* **RSASSA-PKCS1-v1\_5**: `sign`, `verify`, `generateKey`, `importKey`, `exportKey`
  * with _hash_ **SHA-256**, **SHA-384**
  * and _modulusLength_ at least 2048 bits

* **RSA-OAEP**: `encrypt`, `decrypt`, `generateKey`, `importKey`, `exportKey`, `wrapKey`, `unwrapKey`
  * with _hash_ **SHA-1**
  * and _modulusLength_ at least 2048 bits
  * _FIXME_ only `"jwk"` format for wrapped/unwrapped keys

Known limitations
-----------------

`deriveKey`, `deriveBits` are not supported under _IE11_ and _Safari_  since there is no implementation of any algorithm providing key derivation.

Under _IE11_ exception is thrown in case of empty input data since _IE11_ silently discards empty data and leaves returned `Promise` object never resolved nor rejected.

Other browsers support
----------------------

See https://vibornoff.github.io/webcrypto-examples/index.html

Sponsored by
------------

[BrowserStack](https://browserstack.com) — automated & manual crossbrowser testing solution.
