
[![Build Status](https://secure.travis-ci.org/soldair/node-buffer-split.png)](http://travis-ci.org/soldair/node-buffer-split)

buffer-split
============

split a buffer by another buffer. think String.split() 

```js

var bsplit = require('buffer-split')
, b = new Buffer("this is a buffer i like to split")
, delim = new Buffer('buffer')
, result = bsplit(b,delim)
;

result.length === 2

result[0].toString() === "this is a "

result[1].toString() === " i like to split"


```

you may include the delimiter in the result by passing a thrthy value as the third arg. its more efficient if you need it.

```js
var bsplit = require('buffer-split')
, b = new Buffer("this is a buffer i like to split")
, delim = new Buffer('buffer')
, result = bsplit(b,delim,true)
;

result[0].toString() === "this is a buffer"

result[1].toString() === " i like to split"


```
