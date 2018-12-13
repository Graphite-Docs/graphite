# pull-pair

A pair of {source, sink} streams that are internally connected,
(what goes into the sink comes out the source)

This can be used to construct pipelines that are connected.

``` js
var pull = require('pull-stream')
var pair = require('pull-pair')

var p = pair()

//read values into this sink...
pull(pull.values([1, 2, 3]), p.sink)

//but that should become the source over here.
pull(p.source, pull.collect(function (err, values) {
  if(err) throw err
  console.log(values) //[1, 2, 3]
}))

```

This is particularily useful for creating duplex streams especilaly
around servers. Use `pull-pair/duplex` to get two duplex streams
that are attached to each other.

``` js
var DuplexPair = require('pull-pair/duplex')

var d = DuplexPair()

//the "client": pipe to the first duplex and get the response.
pull(
  pull.values([1,2,3]),
  d[0],
  pull.collect(console.log) // => 10, 20, 30
)

//the "server": pipe from the second stream back to itself
//(in this case) appling a transformation.
pull(
  d[1],
  pull.map(function (e) {
    return e*10
  }),
  d[1]
)
```

## License

MIT

