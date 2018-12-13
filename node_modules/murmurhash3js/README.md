[![NPM version](https://badge.fury.io/js/murmurhash3js.png)](http://badge.fury.io/js/murmurhash3js) [![Build Status](https://travis-ci.org/pid/murmurHash3js.png)](https://travis-ci.org/pid/murmurhash3js)

MurmurHash3js
=============

**A javascript implementation of [MurmurHash3](http://code.google.com/p/smhasher/source/browse/trunk/MurmurHash3.cpp?spec=svn145&r=144)'s hashing algorithms.**

Installation
============

> npm install murmurhash3js
>
> bower install murmurhash3js

Usage
-----

```javascript
    // browser
        <script type="text/javascript" src="murmurhash3js.min.js"></script>
    // server
        var murmurHash3 = require("murmurhash3js");
```

```javascript
// Return a 32bit hash as a unsigned int:
> murmurHash3.x86.hash32("I will not buy this record, it is scratched.")
  2832214938

// Return a 128bit hash as a unsigned hex:
> murmurHash3.x86.hash128("I will not buy this tobacconist's, it is scratched.")
  "9b5b7ba2ef3f7866889adeaf00f3f98e"
> murmurHash3.x64.hash128("I will not buy this tobacconist's, it is scratched.")
  "d30654abbd8227e367d73523f0079673"

// Specify a seed (defaults to 0):
> murmurHash3.x86.hash32("My hovercraft is full of eels.", 25)
  2520298415

// Rebind murmurHash3:
> somethingCompletelyDifferent = murmurHash3.noConflict()
> murmurHash3
  undefined
> somethingCompletelyDifferent.version
  "3.0.1" // get version
```

Authors
-------

-	[Karan Lyons](https://github.com/karanlyons/)
-	[Sascha Droste](https://github.com/pid/)

Changlog
--------

[CHANGLELOG.md](https://github.com/pid/murmurHash3js/blob/master/CHANGELOG.md)

MIT License
-----------

Copyright © 2012-2015 Karan Lyons, Sascha Droste

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
