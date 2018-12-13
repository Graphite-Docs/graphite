# signed-varint

store signed integers efficiently, as per protocol-buffers.

For unsigned integers use
[varint](https://github.com/chrisdickinson/varint).

Integers are mapped to positive integers, so that positive integers
become positive even numbers (n*2)
and negative integers become positive odd numbers. (n*-2 - 1)

This is the same as moving the sign bit from the most significant
possition to the least significant. Otherwise, varint will encode
negative numbers as large integers.

``` js
var varint = require('varint')
var svarint = require('signed-varint')

console.log('unsigned', varint.encode(-1))
console.log('signed', svarint.encode(-1))

//=> unsigned [255,255,255, 15]
//   signed [1]
```
## License

MIT
