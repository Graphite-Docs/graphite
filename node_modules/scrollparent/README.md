# scrollparent.js

> A function to get the scrolling parent of an html element.

## Install

```bash
npm install scrollparent --save
```

## Example

```js
var Scrollparent = require("scrollparent");

Scrollparent(document.getElementById("content")) // HTMLHtmlElement or HTMLBodyElement as appropriate
```

```js
var Scrollparent = require("scrollparent");

Scrollparent(document.getElementById("inside-a-scrolling-div")) // HTMLDivElement
```

## Note about the root scrolling element

Internally, the root scrolling element is determined in this library
as the result of

```js
document.scrollingElement || document.documentElement;
```

This should give a usable result in most browsers today
but if you want to ensure full support
you should use a `document.scrollingElement` polyfill such as
[this one](https://github.com/mathiasbynens/document.scrollingElement).

## Contributors

* Ola Holmström (@olahol)
* Bart Nagel (@tremby)
* Daniel White (@danbrianwhite)

## License

MIT
