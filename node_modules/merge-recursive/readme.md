# node-merge-recursive

## Install

```bash
$ npm install merge-recursive
```

## Usage

```javascript
var merge = require('merge-recursive');

// Flat merge
merge(
	{ a: 'a', b: 'b' },
	{ b: 'c', c: 'd' }
);
// returns: { a: 'a', b: 'c', c: 'd' }

// Recursive merge
merge.recursive(
	{ o: { a: 'a', b: 'b' } },
	{ o: { b: 'c', c: 'd' } }
);
// returns: { o: { a: 'a', b: 'c', c: 'd' } }

// Selective merge
merge.selective(
	['a'],
	{ a: 'a', b: 'b' },
	{ a: 'c', b: 'd' }
);
// returns: { a: 'c', b: 'b' }
```

## MIT License

Copyright (c) 2012 Umbra Engineering LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

