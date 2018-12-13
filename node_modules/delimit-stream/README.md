# delimit-stream [![Build Status](https://travis-ci.org/jasonkuhrt/delimit-stream.png)](https://travis-ci.org/jasonkuhrt/delimit-stream) [![Dependency Status](https://gemnasium.com/jasonkuhrt/delimit-stream.png)](https://gemnasium.com/jasonkuhrt/delimit-stream) [![NPM version](https://badge.fury.io/js/delimit-stream.png)](http://badge.fury.io/js/delimit-stream)
> Push messages from a stream partitioned by the given delimiter

### Install
```
npm install delimit-stream
```

### Example
```js
var DelimitStream = require('delimit-stream')
var net = require('net')

net.createServer(function(socket){
  var delimitStream = new DelimitStream('\r\n', { objectMode: true })
  socket
    .pipe(delimitStream)
    .on('data', function(message){
      console.log('Got message: %j', message)
    })
})
```

### API
##### `DelimitStream(delimiter, [options])`
> `delimiter` `<String>`
  The character(s) that define the delimiter. DelimitStream will push its buffer every time this delimiter is found in the stream
>
  `options` `<Object>`
  The stream.Transform [options](http://nodejs.org/api/stream.html#stream_class_stream_transform). DelimitStream does not add any new options.

### Run Tests
```
npm test
```
