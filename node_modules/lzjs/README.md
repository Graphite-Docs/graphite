lzjs
========

[![Build Status](https://travis-ci.org/polygonplanet/lzjs.svg)](https://travis-ci.org/polygonplanet/lzjs)


Compression by LZ algorithm in JavaScript.

This is useful when storing the large data in a size limited storage (e.g., localStorage, cookie etc.).

## Installation

### In a browser:

```html
<script src="lzjs.js"></script>
```

or

```html
<script src="lzjs.min.js"></script>
```

The object named "**lzjs**" will defined in the global scope.


### In Node.js:

```bash
npm install -g lzjs
```

```javascript
var lzjs = require('lzjs');
```

### bower:

```bash
bower install lzjs
```

## Usage

### compress/decompress

* {_string_} lzjs.**compress** ( data )  
  Compress data.  
  @param {_string_|_Buffer_} _data_ Input data  
  @return {_string_} Compressed data

* {_string_} lzjs.**decompress** ( data )  
  Decompress data.  
  @param {_string_} _data_ Input data  
  @return {_string_} Decompressed data

### compressToBase64 / decompressFromBase64

* {_string_} lzjs.**compressToBase64** ( data )  
  Compress data to base64 string.  
  @param {_string_|_Buffer_} _data_ Input data  
  @return {_string_} Compressed data

* {_string_} lzjs.**decompressFromBase64** ( data )  
  Decompress data from base64 string.  
  @param {_string_} _data_ Input data  
  @return {_string_} Decompressed data


```javascript
var data = 'hello hello hello';
var compressed = lzjs.compress(data);
console.log(compressed); // Outputs a compressed binary string
var decompressed = lzjs.decompress(compressed);
console.log(decompressed === data); // true
```

## Command Line:

After `npm install -g lzjs`

Note that command line compression is only valid the UTF-8 encoded file.

### Add file to archive

```bash
lzjs -a something.txt
```

### Extract file

```bash
lzjs -x something.txt.lzjs
```


## Demo

* [Demo](http://polygonplanet.github.io/lzjs/demo/)

## License

MIT


