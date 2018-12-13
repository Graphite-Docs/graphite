# pull-handshake

Create handshakes for binary protocols with pull streams.

# Example

``` js
var stream = handshake()
var shake = stream.handshake

// Pull some amount of data out of the stream
shake.read(32, function (err, data) {

  // Write a response...
  shake.write(new Buffer('hello there'))

  shake.read(32, function (err, data) {
    // Get a confirmation,
    // and then attach the application
    var stream = createApplicationStream()

    pull(stream, shake.rest(), stream)
    // shake.rest() returns a duplex binary stream.
  })
})


// shake is itself a duplex pull-stream.
pull(shake, stream, shake)
```

## API

### `handshake([opts], [callback])`

#### opts

Type: `Object`<br>
Default: `{timeout: 5e3}`

The allowed duration for the handshake to take place.

#### callback

Type: `Function`<br>
Default: `function noop () {}`

This will be called when the handshake completes, or fails. In the case of failure it is called with an `error`.

## License

MIT
