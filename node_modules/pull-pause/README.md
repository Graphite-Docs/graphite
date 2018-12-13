# pull-pause

a through pull-stream that can be turned on and off like a tap.

## Example

``` js

var pull = require('pull-stream')
var pause = require('pull-pause')()


pull(
  source,
  pause,
  sink
)

pause.pause() //stop reading.

pause.resume() //resume reading.


```

## License

MIT
