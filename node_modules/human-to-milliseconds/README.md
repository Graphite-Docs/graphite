# human-to-milliseconds

[![npm](https://img.shields.io/npm/v/human-to-milliseconds.svg?style=flat-square)](https://www.npmjs.com/package/human-to-milliseconds)
[![Travis](https://img.shields.io/travis/hacdias/human-to-milliseconds.svg?style=flat-square)](https://travis-ci.org/hacdias/human-to-milliseconds)

Converts human intervals to milliseconds. This accepts durations such as "300s", "1.5h" or "2h45m". Valid time units are: "ns", "us" (or "µs"), "ms", "s", "m", "h".

## Install

### In Node.js through npm

```bash
$ npm install --save human-to-milliseconds
```

### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact an ES5 transpiled version with the right shims added. This means that you can require it and use with your favorite bundler without having to adjust asset management process.

```js
const HumanToMilliseconds = require('human-to-milliseconds')
```

### In the Browser through `<script>` tag

Loading this module through a script tag will make the ```HumanToMilliseconds``` obj available in the global namespace.

```
<script src="https://unpkg.com/human-to-milliseconds/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/human-to-milliseconds/dist/index.js"></script>
```

## API

```js
HumanToMilliseconds('1h50m', (err, value) => {
  console.log(val)
})

// or ...

HumanToMilliseconds('1h50m')
  .then(val => { console.log(val) })
  .catch(err => { console.log(err) })
```

