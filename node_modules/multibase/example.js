'use strict'

const multibase = require('multibase')

const encodedBuf = multibase.encode('base58btc', Buffer.from('hey, how is it going'))

const decodedBuf = multibase.decode(encodedBuf)
console.log(decodedBuf.toString()) // eslint-disable-line no-console
// => hey, how it going
