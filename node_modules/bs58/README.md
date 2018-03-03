bs58
====

[![build status](https://secure.travis-ci.org/cryptocoinjs/bs58.png)](http://travis-ci.org/cryptocoinjs/bs58)

JavaScript component to compute base 58 encoding. This encoding is typically used for crypto currencies such as Bitcoin.

**Note:** If you're looking for **base 58 check** encoding, see: [https://github.com/bitcoinjs/bs58check](https://github.com/bitcoinjs/bs58check), which depends upon this library.


Install
-------

    npm i --save bs58


API
---

### encode(input)

`input` must be a [Buffer](http://nodejs.org/api/buffer.html) or an `Array`. It returns a `string`.

**example**:

```js
var bs58 = require('bs58')

var unencodedData = "003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187"
var out = bs58.encode(new Buffer(unencodedData, 'hex'))
console.log(out) // => 16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS
```


### decode(input)

`input` must be a base 58 encoded string. Returns an `Array`.

**example**:

```js
var bs58 = require('bs58')

var address = "16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS"
var out = bs58.decode(address)
console.log(out.toString())
// => 0,60,23,110,101,155,234,15,41,163,233,191,120,128,193,18,177,179,27,77,200,38,38,129,135

// if using Node.js or browserify
console.log(new Buffer(out).toString('hex'))
// => 003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187
```

Hack / Test
-----------

Uses JavaScript standard style. Read more:

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


Credits
-------
- [Mike Hearn](https://github.com/mikehearn) for original Java implementation
- [Stefan Thomas](https://github.com/justmoon) for porting to JavaScript
- [Stephan Pair](https://github.com/gasteve) for buffer improvements
- [Daniel Cousens](https://github.com/dcousens) for cleanup and merging improvements from bitcoinjs-lib
- [Jared Deckard](https://github.com/deckar01) for killing `bigi` as a dependency


License
-------

MIT
