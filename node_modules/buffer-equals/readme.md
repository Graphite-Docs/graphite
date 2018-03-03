# buffer-equals [![Build Status](https://travis-ci.org/sindresorhus/buffer-equals.svg?branch=master)](https://travis-ci.org/sindresorhus/buffer-equals)

> Node.js [`buffer.equals()`](https://nodejs.org/api/buffer.html#buffer_buf_equals_otherbuffer) [ponyfill](https://ponyfill.com)


## Install

```
$ npm install --save buffer-equals
```


## Usage

```js
const bufferEquals = require('buffer-equals');

bufferEquals(new Buffer('foo'), new Buffer('foo'));
//=> true

bufferEquals(new Buffer('foo'), new Buffer('bar'));
//=> false
```


## API

See the [`buffer.equals()` docs](https://nodejs.org/api/buffer.html#buffer_buf_equals_otherbuffer).

The only difference is that you pass in the buffer as the first argument instead of calling the `.equals()` method on the buffer instance.


## Related

- [buf-compare](https://github.com/sindresorhus/buf-compare) - Node.js 0.12 `Buffer.compare()` ponyfill
- [buf-indexof](https://github.com/sindresorhus/buf-indexof) - Node.js 4.0 `buffer.indexOf()` ponyfill


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
