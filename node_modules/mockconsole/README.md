# mockconsole

## What is this?

A tiny browser module that builds and returns an object with the same methods as `console` but with no-op functions.

Suitable for use with browserify/CommonJS on the client. 

If you want to use as a standalone or with AMD use mockconsole.umd.js.

Can be handy for modules that export constructors where you wnat to be able to pass in a logger as an option.

## Installing

```
npm install mockconsole
```

## Demo / How to use it


```js
var mockconsole = require('mockconsole');


// this way someone can pass in `window.console` or something
// like github.com/latentflip/bows as the logger for logging
// If it's not passed in no code needs to change.
function Human(options) {
    this.console = options.logger || mockconsole;
}

Human.prototype.dance = function () {
    this.console.log('dance human!');   
};
```

## License

MIT

## Created By

If you like this, follow: [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter.

