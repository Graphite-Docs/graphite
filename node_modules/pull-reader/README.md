# pull-reader

read bytes from a binary pull-stream


## example

``` js
var Reader = require('pull-reader')
var File = require('pull-file')
var reader = Reader(1000) //1 second timeout, abort upstream if read takes longer than this.


pull(
  File('./package.json'),
  reader
)

//read the first byte of a file
reader.read(1, function (err, data) {
  console.log(data.toString()) // => {
})

```

## License

MIT
