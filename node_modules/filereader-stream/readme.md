# filereader-stream

Given an HTML5 File object (from e.g. HTML5 drag and drops), turn it into a readable stream.


# install

Use it with npm & [browserify](/substack/node-browserify)

```bash
$ npm install filereader-stream
```

# example
```js
var drop = require('drag-and-drop-files')
var concat = require('concat-stream')
var fileReaderStream = require('filereader-stream')

test('should read file when one is dropped', function(t) {
  drop(document.body, function(files) {
    var first = files[0]
    fileReaderStream(first).pipe(concat(function(contents) {
      // contents is the contents of the entire file
    }))
  })
})
```

# usage

```js
var fileReaderStream = require('filereader-stream')
var readStream = fileReaderStream(file, [options])
```

`fileReaderStream` is a Streams 2 Readable Stream, so you can do all the streamy things with it like `.pipe` etc.

`options`:

* `chunkSize` - default `1024 * 1024` (1MB) - How many bytes will be read at a time
* `offset` - default `0` - Where in the file to start reading

# run the tests

```
npm install
npm test
```

then open your browser to the address provided, open your JS console, and drag and drop files onto the page until the test suite passes/fails
