let createHash = require('create-hash')
let createHmac = require('create-hmac')

function hash160 (buffer) {
  return createHash('rmd160').update(
    createHash('sha256').update(buffer).digest()
  ).digest()
}

function hmacSHA512 (key, data) {
  return createHmac('sha512', key).update(data).digest()
}

module.exports = { hash160, hmacSHA512 }
