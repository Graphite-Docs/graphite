# pull-many

Combine many streams into one stream, as they come, while respecting back pressure.

A chunk is read from each stream,
and the next available chunk is
selected in a round-robbin.

If a any stream errors, then all the remaining streams are aborted,
and then the sink is passed the error. If you want instead to drop the
erroring stream, and continue reading from the other streams, you should
pipe each stream through a stream that handles the error(ignores, logs, whatever)
and then ends normally.

## Example

``` js

var pull = require('pull-stream')
var many = require('pull-many')

pull(
  many([
    pull.values([1,2,3]),
    pull.values([1,3,5]),
    pull.values([2,4,6])
  ]),
  pull.collect(function (err, ary) {
    if(err) throw err
    console.log(ary)
    //=> [1, 1, 2, 2, 3, 4, 3, 5, 6]
  })
)

// add streams later too
var m = many()

pull(
  m,
  pull.collect(function (err, ary) {
    if(err) throw err
    console.log(ary)
    //=> [1,2,3,4,5,6]
  })
)

m.add(pull.values([1,2,3]))
m.add(pull.values([4,5,6]))
```

## License

MIT
