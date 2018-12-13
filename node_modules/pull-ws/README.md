# pull-ws

Use websockets via pull-stream interface. both client and server.

[![NPM](https://nodei.co/npm/pull-ws.png)](https://nodei.co/npm/pull-ws/)

[![unstable](https://img.shields.io/badge/stability-unstable-yellowgreen.svg)](https://github.com/dominictarr/stability#unstable) [![Build Status](https://img.shields.io/travis/DamonOehlman/pull-ws.svg?branch=master)](https://travis-ci.org/DamonOehlman/pull-ws) 

## example - client
``` js
var connect = require('pull-ws/client')
// OR: require('pull-ws').connect

connect(WS_URL, function (err, stream) {
  if(err) throw err //handle err
  pull(source, stream, sink)
})

```
## example - server

``` js
var createServer = require('pull-ws/server')
createServer(function (stream) {
  //pipe the stream somewhere.
  //eg, echo server
  pull(stream, stream)
}).listen(PORT)
```

## api

### `connect = require('pull-ws/client')`

`connect(url, cb | {binary: boolean, onConnect: cb})`

Create a websocket client connection. set binary: true
to get a stream of arrayBuffers (on the browser).
defaults to true on node, but to strings on the browser.
this may cause a problems if your application assumes binary.

else, just provide the callback.

``` js
connect(url, function (err, stream) {
  ...
})
```


### `createServer = require('pull-ws/server')`

create pull stream websocket servers.
the servers take a lot more options than clients.

`createServer(opts?, onConnection)`

`onConnect(stream)` is called every time a connection is received.

`opts` takes the same server options as [ws module](https://github.com/websockets/ws/blob/master/doc/ws.md#new-wsserveroptions-callback)


#### example

one duplex service you may want to use this with is [muxrpc](https://github.com/dominictarr/muxrpc)

``` js
var ws = require('pull-ws-server')
var pull = require('pull-stream')

ws.createServer(function (stream) {
  //pipe duplex style to your service.
  pull(stream, service.createStream(), stream)
})
.listen(9999)

var stream = ws.connect('ws://localhost:9999')

pull(stream, client.createStream(), stream)
```

if the connection fails, the first read from the stream will be an error,
otherwise, to get a handle of stream end/error pass a callback to connect.

``` js
ws.connect('ws://localhost:9999', function (err, stream) {
  if(err) return handleError(err)
  //stream is now ready
})

```

To run the server over TLS:

```js
var tlsOpts = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
};
ws.createServer(tlsOpts, function (stream) {
  //pipe duplex style to your service.
  pull(stream, service.createStream(), stream)
})
.listen(9999)
```

To add client-authentication to the server, you can set `verifyClient`.
[Documentation here](https://github.com/websockets/ws/blob/master/doc/ws.md#optionsverifyclient).

```js
function verifyClient (info) {
  return info.secure == true
}
ws.createServer({ verifyClient: verifyClient }, onStream)
```

## use with an http server

if you have an http server that you also need to serve stuff
over, and want to use a single port, use the `server` option.

``` js
var http = require('http')
var server = http.createServer(function(req, res){...}).listen(....)
ws.createServer({server: server}, function (stream) { ... })

```

### core, websocket wrapping functions

these modules are used internally, to wrap a websocket.
you probably won't need to touch these,
but they are documented anyway.

### `require('pull-ws/duplex')(socket, opts?)`

turn a websocket into a duplex pull stream.
If provided, `opts` is passed to `pws.sink(socket, opts)`.

Websockets do not support half open mode.
[see allowHalfOpen option in net module](
http://nodejs.org/api/net.html#net_net_createserver_options_connectionlistener)

If you have a protocol that assumes halfOpen connections, but are using
a networking protocol like websockets that does not support it, I suggest
using [pull-goodbye](https://github.com/dominictarr/pull-goodbye) with your
protocol.

The duplex stream will also contain a copy of the properties from
the http request that became the websocket. they are `method`, `url`,
`headers` and `upgrade`.

also exposed at: `var duplex = require('pull-ws')`

### `require('pull-ws/sink')(socket, opts?)`

Create a pull-stream `Sink` that will write data to the `socket`.
`opts` may be `{closeOnEnd: true, onClose: onClose}`.
`onClose` will be called when the sink ends. If `closeOnEnd=false`
the stream will not close, it will just stop emitting data.
(by default `closeOnEnd` is true)

If `opts` is a function, then `onClose = opts; opts.closeOnEnd = true`.

```js
var pull = require('pull-stream');
var wsSink = require('pull-ws');

// connect to the echo endpoint for test/server.js
var socket = new WebSocket('wss://echo.websocket.org');

// write values to the socket
pull(
  pull.infinite(function() {
    return 'hello @ ' + Date.now()
  }),
  // throttle so it doesn't go nuts
  pull.asyncMap(function(value, cb) {
    setTimeout(function() {
      cb(null, value);
    }, 100);
  }),
  wsSink(socket)
);

socket.addEventListener('message', function(evt) {
  console.log('received: ' + evt.data);
});

```

also exposed at `require('pull-ws').sink`

### `require('pull-ws/source')(socket)`

Create a pull-stream `Source` that will read data from the `socket`.

```js
var pull = require('pull-stream');

// we just need the source, so cherrypick
var wsSource = require('pull-ws/source');

pull(
  // connect to the test/server.js endpoint
  wsSource(new WebSocket('ws://localhost:3000/read')),
  pull.log()
);

```

also exposed at `require('pull-ws').source`

# LICENSE

MIT








