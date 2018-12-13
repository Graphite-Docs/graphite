**NOTE:** Starting from Node.js v.8.0.0, the promisify method is now included in the `util` native library.

On Node.js, the usage of the native method is recommended!

```
// Native promisify example
const util = require('util');
const readfile = util.promisify(fs.readFile);
```

# ES6 Promisify
## This is a library to promisify callback-style functions to ES6 promises. You can also use it on the client-side.

### Install it with:

    npm i --save promisify-es6
    or
    git clone https://github.com/manuel-di-iorio/promisify-es6.git

### Example:

```javascript
var promisify = require("promisify-es6");
var fs = require("fs");
var readFile = promisify(fs.readFile);

readFile("test.js")
 .then(function(content) {
    console.log(content.toString());
 })
 .catch(function(err) {
    console.error(err);
 });
```

A promisified function is still callable with the callback style:

```javascript
readFile("test.js", function(err, content) { //etc...
```

You can even promisify entire modules or arrays:

```javascript
var readFile = promisify(require("fs")).readFile;
```

## API

```javascript
promisify(method[, options])
```
    *Method* can be a function or an array/map of functions to promisify

    *Options* can have the following properties:

        `context`: The context which to apply the called function (by default is the function itself)
        `replace`: When an array/map is passed and this is truthy, it will replace the original object

### Test with Mocha:

    npm test
