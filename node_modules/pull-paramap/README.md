# pull-paramap

parallel mapping pull-stream.

[![travis](https://travis-ci.org/dominictarr/pull-paramap.png?branch=master)
](https://travis-ci.org/dominictarr/pull-paramap)

[![testling](http://ci.testling.com/dominictarr/pull-paramap.png)
](http://ci.testling.com/dominictarr/pull-paramap)

## example

``` js
var pull = require('pull-stream')
var paramap = require('pull-paramap')

pull(
  pull.values([....]),
  //perform an async job in parallel,
  //but return results in the same order as they went in.
  paramap(function (data, cb) {
    asyncJob(data, cb)
  }, width), //optional number.
             //limits stream to process width items at once
  pull.collect(cb)
)

pull(
  pull.values([....]),
  //perform an async job in parallel,
  //and return results in the order they arrive
  paramap(function (data, cb) {
    asyncJob(data, cb)
  }, null, false), // optional flag `inOrder`, default true
  pull.collect(cb)
)
```

## License

MIT
