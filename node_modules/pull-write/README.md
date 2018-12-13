# pull-write

base class for creating generic pull-sinks
that write to some device via an async call.


## Write(asyncWrite, reduce, max, cb)

### asyncWrite(ary, cb)

async function called with an array of items to output.
This function will only ever be called once at a time (per instance),
and while it is working `pull-write` will buffer any subsequent writes,
until the buffer has the length of at most `max`,
or `asyncWrite` has called back.

### reduce (queue, item)

`queue` is the current backlog of data the `pull-write` is getting ready to write.
`item` is the next incoming item. `reduce` must add `item` into `queue`
in whatever way is appropiate. If `queue` is empty, then it will be `null`.
Your `reduce` function must handle that case and set an initial value.

by default, `reduce` will be a function that initializes a buffer,
and then pushes the new items onto that buffer, this means `max` will be
compared to the number of items in that buffer.

### max

A number, when the `.length` property of the `queue` returned by `reduce`
gets this big `pull-write` will stop reading more, until asyncWrite
calls back.

## example

Suppose we want a to take a stream of values from one leveldb,
and write it to another. If we have the timestamp they where written
to the first, we can track that in the second, then it's easy to keep
them both up to date. We just need to always output latest ts separately.

``` js
var Write = require('pull-write')

var LevelWrite = function (db, cb) {
  var max = 100
  return Write(function (ary, cb) {
    db.batch(ary, cb)
  }, function (queue, data) {
    if(!queue)
      queue = [{key: '~meta~ts', value: 0, type: 'put'}]
    queue.push({key:data.key, value: data.value, type: 'put'})
    //the record of the current sequence is always the first value
    //in the batch, so we can update it easily.
    queue[0].value = data.ts
    return queue
  }, max, cb)
}

```


## License

MIT










