'use strict'

var crypto = require('crypto')
var KBucket = require('../')

function getNextId () {
  seed = crypto.createHash('sha256').update(seed).digest()
  return seed
}

var seed = process.env.SEED || crypto.randomBytes(32).toString('hex')
console.log('Seed: ' + seed)
getNextId()
var bucket = new KBucket()
for (var j = 0; j < 1e4; ++j) bucket.add({ id: getNextId() })

console.time('KBucket.closest')
for (var i = 0; i < 1e4; i++) {
  bucket.closest(seed, 10)
}
console.timeEnd('KBucket.closest')
console.log('Memory: ', process.memoryUsage())
