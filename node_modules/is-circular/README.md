# is-circular [![Build Status](https://travis-ci.org/tjmehta/is-circular.svg?branch=master)](https://travis-ci.org/tjmehta/is-circular) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

High-performance circular reference check for objects (or arrays) w/ no dependencies

# Installation

`npm install is-circular`

# Usage

```js
var isCircular = require('is-circular')

var circularObj = {
  foo: 1,
  bar: 2
}
circularObj.qux = circularObj

isCircular(circularObj) // true

var obj = {
  foo: 1,
  bar: 2,
  qux: 3
}

isCircular(obj) // false
```

# License
MIT
