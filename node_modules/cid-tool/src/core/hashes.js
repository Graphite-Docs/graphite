'use strict'

const multihash = require('multihashes')

// TODO: list only safe hashes https://github.com/ipfs/go-verifcid
module.exports = function hashes () {
  return Object.keys(multihash.names).map(name => {
    return { name, code: multihash.names[name] }
  })
}
