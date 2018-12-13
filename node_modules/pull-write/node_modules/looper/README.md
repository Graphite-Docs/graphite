# looper

Loop with callbacks but don't RangeError

[![travis](https://travis-ci.org/dominictarr/looper.png?branch=master)
](https://travis-ci.org/dominictarr/looper)

[![testling](http://ci.testling.com/dominictarr/looper.png)
](http://ci.testling.com/dominictarr/looper)

## Synopsis

Normally, if `mightBeAsync` calls it's cb immediately
this would `RangeError`:

``` js
var l = 100000
;(function next () {
  if(--l) mightBeAsync(next)
})
```

`looper` detects that case, and falls back to a `while` loop,
in computer science something like this is called a [trampoline](https://en.wikipedia.org/wiki/Trampoline_(computing))
this module is simpler than other trampoline libraries such as [tail-call](https://github.com/Gozala/js-tail-call)
because it does not preserve arguments. But this is still useful
for looping when  async recursion is sometimes sync.

This is about 10 times faster than using [setImmediate](http://devdocs.io/node~6_lts/timers#timers_setimmediate_callback_args)

## Example

``` js
var looper = require('looper')

var l = 100000
var next = looper(function () {
  if(--l) probablySync(next)
})

next()
```

when you want to stop looping, don't call `next`.
`looper` checks if each callback is sync or not,
so you can even mix sync and async calls!

## License

MIT

