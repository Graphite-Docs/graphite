'use strict'

const multiaddr = require('multiaddr')

function ensureMultiaddr (ma) {
  if (multiaddr.isMultiaddr(ma)) {
    return ma
  }

  return multiaddr(ma)
}

module.exports = {
  ensureMultiaddr: ensureMultiaddr
}
