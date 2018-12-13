'use strict'

const multihash = require('multihashes')
const buf = Buffer.from('0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33', 'hex')

const encoded = multihash.encode(buf, 'sha1')
console.log(encoded)
// => <Buffer 11 14 0b ee c7 b5 ea 3f 0f db c9 5d 0d d4 7f 3c 5b c2 75 da 8a 33>

multihash.decode(encoded)
// => {
//      code: 17,
//      name: 'sha1',
//      length: 20,
//      digest: <Buffer 0b ee c7 b5 ea 3f 0f db c9 5d 0d d4 7f 3c 5b c2 75 da 8a 33>
//    }
