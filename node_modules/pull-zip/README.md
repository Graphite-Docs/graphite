# pull-zip

zip [pull-stream](https://github.com/dominictarr/pull-stream)

combine N streams into N length tuples.

## Example

``` js
var pull = require('pull')
var zip  = require('pull-zip')

pull(
  zip(pull.values([1, 2, 3]), pull.values(['A', 'B', 'C'])),
  pull.log()
)
// [1, 'A']
// [2, 'B']
// [3, 'C']
```

## License

MIT

