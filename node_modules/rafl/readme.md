# rafl

A fork of the seemingly-abandoned [component/raf](https://github.com/component/raf) with added support for IE 11, web workers, and node.

[![Build status](https://travis-ci.org/michaelrhodes/rafl.svg?branch=master)](https://travis-ci.org/michaelrhodes/rafl)

## Install

```sh
$ npm install rafl
```

## Example

Request the animation frame with `raf(fn)`, cancel with `raf.cancel(id)`.

```js
var raf = require('rafl')

var x = 0
var y = 50
var canvas = document.querySelector('canvas')
var ctx = canvas.getContext('2d')

function animate() {
  raf(animate)
  draw()
}

var prev = Date.now()
function draw() {
  var curr = Date.now()
  var diff = curr - prev
  var p = diff / 16
  ctx.clearRect(0, 0, 900, 300)
  ctx.beginPath()
  ctx.globalAlpha = .5
  ctx.arc(x, y, 10, 0, Math.PI * 2, false)
  ctx.fill()
  x += 2
  y += Math.sin(x/20) * 5
  prev = curr
}

animate()
```

## Page weight (browserified)

| compression    |    size |
| :------------- | ------: |
| rafl.js        | 1.19 kB |
| rafl.min.js    |   865 B |
| rafl.min.js.gz |   449 B |


### License

[MIT](http://opensource.org/licenses/MIT)
