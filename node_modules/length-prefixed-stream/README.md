# length-prefixed-stream

Streaming equivalent of [length-prefixed-message](https://github.com/sorribas/length-prefixed-message).
This module allow you to send buffers with a varint length prefix to ensure that they will arrive unpartioned

```
npm install length-prefixed-stream
```

[![build status](https://travis-ci.org/mafintosh/length-prefixed-stream.svg?branch=master)](https://travis-ci.org/mafintosh/length-prefixed-stream)

## Usage

``` js
var lpstream = require('length-prefixed-stream')

var encode = lpstream.encode() // create an encode stream to send data
var decode = lpstream.decode() // create an decode stream to receive data

encode.write('hello world') // send "hello world"

decode.on('data', function(data) {
  console.log(data.toString()) // will always print "hello world"
})

encode.pipe(decode) // for testing just pipe to our selves
```

## API

#### `transformStream = lpstream.encode()`

Creates a new encoder transform stream.

#### `transformStream = lpstream.decode()`

Creates a new decoder transform stream.

## License

MIT
