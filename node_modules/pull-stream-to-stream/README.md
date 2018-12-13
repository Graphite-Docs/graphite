# pull-stream-to-stream

turn a pull-stream into a regular node stream.

## example

``` js
var toStream = require('pull-stream-to-stream')

//if the pull-stream is duplex (an object with two streams: {source, sink})

stream = toStream(pullDuplex)

//if the stream is a sink ("writable")
stream = toStream.sink(pullSink)

//if the stream is a source ("readable")

stream = toStream.source(pullSource)

```


## License

MIT
