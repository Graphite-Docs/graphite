# is-pull-stream

check what sort of pull-stream a thing is.

## api

### isSource (stream)

return true if stream is a source.

### isSink (stream)

return true if stream is a sink.

### isDuplex (stream)

return true if stream is a duplex steam.


### through

a through stream is a sink that returns a source,
so don't know if it's not a sink until you pass a source to it.


## License

MIT

