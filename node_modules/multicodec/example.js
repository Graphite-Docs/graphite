'use strict'

const multicodec = require('multicodec')

const prefixedProtobuf = multicodec.addPrefix('protobuf', Buffer.from('some protobuf code'))

console.log(prefixedProtobuf)
// => prefixedProtobuf 0x50...
