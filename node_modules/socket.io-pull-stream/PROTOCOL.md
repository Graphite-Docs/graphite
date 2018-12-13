# SocketIO pull-stream protocol

Note: The socket.io events used in this protocol have their own spec.

## Events

Note: ID is the Id of the connection

### Source

Creates and returns a pull-stream source
Emits `socket.io-pull-stream.accept.ID` on creation

- On `socket.io-pull-stream.error.ID`:
  - If arg1 is a boolean close the stream
  - If arg1 is a string emit that as an error

  - Do not accept any data after that event

- On `socket.io-pull-stream.queue.ID`:
  - Add arg1 to output data

### Sink

Creates and returns a pull-stream sink
Queues data until `socket.io-pull-stream.accept.ID` occurs
 - If incoming data is an error emits `socket.io-pull-stream.error.ID`
 - If incoming data is not an error emits `socket.io-pull-stream.queue.ID`

### Proxy
Creates a source on the source socket and pipes it into the destination sink on the destination socket.
Basically:
```js
function proxy(from, to, id) {
  pull(
    from.createSource(id),
    to.createSink(id)
  )
}
```
