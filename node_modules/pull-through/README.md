# pull-through

[through](https://github.com/dominictarr/through) ported to 
[pull-stream](https://github.com/dominictarr/pull-stream) style.

## Example

Same Good Old Api, Brand New Underlying Mechanism.

``` js
var through = require('pull-through')

var ts = through(function (data) {
  this.queue(data)
}, function (end) {
  this.queue(null)
})
```

## Incompatibility

### DON'T
use `var self = this`, don't keep a reference.

``` js
var WRONG = through(function (data) { WRONG.queue(data) })
```

### DO

``` js
through(function (data) { this.queue(data) })
```

Maybe this will change. this is a little more tricky with pull-streams, though.

## License

MIT
