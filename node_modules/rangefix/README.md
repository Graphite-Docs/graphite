Workaround for browser bugs in Range.prototype.getClientRects and Range.prototype.getBoundingClientRect.

In particular:

* A Chrome bug which results in selections spanning multiple nodes returning rects for all the parents of the endContainer. See https://code.google.com/p/chromium/issues/detail?id=324437. This bug was fixed in Chrome 55.
* A similar bug in Firefox but only triggered with images near the edge of a node.
* A regression in Chrome 55 where images get no rectangle when they are wrapped in a node and you select across them.
* A bug in IE (<=10) which results in scaled rectangles when using the browser's zoom feature.

Install
=======

```bash
$ npm install rangefix
```

Usage
=====

**CommonJS**

```javascript
var RangeFix = require( 'rangefix' );
```

**AMD**

```javascript
define( [ 'rangefix' ], function( Rangefix ) {
	// ...
} );
```

**Browser global**

```html
<script src="path/to/rangefix.js"></script>
```

Replace instances of `Range.prototype.getClientRects`/`getBoundingClientRect` with `RangeFix.getClientRects`/`getBoundingClientRect`:

```javascript
range = document.getSelection().getRangeAt( 0 );

// Before
rects = range.getClientRects();
boundingRect = range.getBoundingClientRect();

// After
rects = RangeFix.getClientRects( range );
boundingRect = RangeFix.getBoundingClientRect( range );
```

Demo
====
http://edg2s.github.io/rangefix/
