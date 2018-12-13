# Bessel.JS

Pure-JS implementation of the Bessel functions (J,Y,I,K), for node and browser

The standard notation is used here:

 - J is the Bessel function of the first kind
 - Y is the Bessel function of the second kind
 - I is the modified Bessel function of the first kind
 - K is the modified Bessel function of the first kind

# Usage

The functions `besselj`, `bessely`, `besseli`, `besselk` are exposed when you include
the script `bessel.js`:

```html>
<script src="bessel.js"></script>
<script>console.log(besselj(1,2));</script>
```

See `test.html` for an example

In node, those four functions are exported:

```js>
var besselj01 = require('bessel').besselj(0,1);
```

Each function follows Excel semantics `(value, function-order)`.  For example,

```js>
bessel.besselj(1.5, 1)
```

is the value of the bessel function J1 at the point x=1.5
