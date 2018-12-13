# pull-traverse

[![travis](https://travis-ci.org/dominictarr/pull-traverse.png?branch=master)](https://travis-ci.org/dominictarr/pull-traverse)

## depthFirst, widthFirst, leafFirst (start, createStream)

Traverse a tree structure. `start` is a value that represents
a node. `createStream` is a function that returns
a pull-stream of the children of a node.
`start` must be the same type output by `createStream`.

``` js
var pull = require('pull-stream')
var pt   = require('pull-traverse')

pull(
  pt.widthFirst(objects, function (object) {
    if(object && 'object' === typeof object)
      return pull.values(object)
    return pull.empty()
  }),
  pull.log()
)
```

## License

MIT
