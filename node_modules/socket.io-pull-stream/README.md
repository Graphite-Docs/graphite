# socket.io-pull-stream

Pull Streams for socket.io

# API

-   `sp(io[, opt])`

    Will add the functions below to `io`

    -   `io`: Socket.io-client instance

    -   `opt`: Default options for every stream

-   `.createSink([id, opt])`

    Will create a sink with `id`.
    If no id is provided a new id will be generated and can be found under `sink.id`

    -   `opt`: Object. Config for stream

        -   `codec`: Codec to use.

            Either string (`hex, plain, buffer`) or object (`{encode: data => ..., decode: data => ...}`).

            Default: `plain`

    Returns: Sink Function

-   `.createSource(id[, opt])`

    Will create a source that reads from a sink with id `id` on the other side.

    -   `opt`: Object. Config for stream

        -   `codec`: Codec to use.

            Either string (`hex, plain, buffer`) or object (`{encode: data => ..., decode: data => ...}`).

            Default: `plain`

    Returns: Source Function

-   `.createProxy(id, to)`

    Will proxy the stream `id` to socket `to`

# Examples

## File Stream

Server:

```js
const sp = require('socket.io-pull-stream')
const fs = require('fs')
const toPull = require('stream-to-pull-stream')
const pull = require('pull-stream')

io.on('connection', client => {
  sp(client)
  const ws = toPull.source(fs.createReadStream('some_file.txt'))
  const sink = client.createSink()
  client.emit('file', sink.id) // to send the stream just emit the id (IMPORTANT: EMIT THE ID FIRST, LATER CREATE THE SOURCE IN SYNC)
  pull(
    ws,
    sink
  )
})
```

Client:

```js
const sp = require('socket.io-pull-stream')
const pull = require('pull-stream')

sp(io)

io.on('file', id => {
  pull(
    io.createSource(id), // to recieve just create a source with the id (IMPORTANT: DO THAT SYNC)
    pull.collect((err, data) => {
      if (err) throw err
      console.log(Buffer.from(data).toString()) // our data
    })
  )
})
```

To send streams between clients the stream need to be proxied

```js
// TODO :add
```
