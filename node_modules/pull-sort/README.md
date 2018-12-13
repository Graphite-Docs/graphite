# pull-sort

sort a pull-stream, necessarily, this buffers the stream and then streams
the sorted stream.

## example

``` js
var Sort = require('pull-sort')
var pull = require('pull-stream/pull')

pull(
  source,
  Sort(compare),
  sink
)

```

`Sort` takes an optional comparitor, the same signature as `Array#sort` 

## License

MIT
