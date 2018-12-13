# explain-error

wrap errors in explainations.

In node sometimes something fails because of some internal detail,
but then this error may be passed back somewhere else, too often,
context is lost.

## example

``` js
var explain = require('explain-error')

//stat a file that does not exist. this will error, add an explaination.
function explainedError(cb) {
  require('fs').stat('neoatuhrcoahkrcophkr', function (err) {
    if(err) cb(explain(err, 'asked for a file that certainly did not exist'))
    else cb()
  })
}

//show that this works even with multiple layers of explainations.
explainedError(function (err) {
  throw explain(err, 'called an function that was expected to fail')
})
```

output:

`fs.stat` does not show where it was called from,
but at least now you know what happened after that.

```
Error: called an function that was expected to fail
    at /home/dominic/c/explain-error/example.js:11:9
    at /home/dominic/c/explain-error/example.js:5:13
  Error: asked for a file that certainly did not exist
    at /home/dominic/c/explain-error/example.js:5:16
    at Object.oncomplete (fs.js:107:15)
  Error: ENOENT, stat neoatuhrcoahkrcophkr

```

## parsing stack traces

of course, this adds lines to your errors that will do not look like normal js errors.
will this break all your tools? if so please post an issue.

## License

MIT
