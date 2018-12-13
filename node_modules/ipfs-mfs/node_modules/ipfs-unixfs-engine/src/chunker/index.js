'use strict'

const chunkers = {
  fixed: require('../chunker/fixed-size'),
  rabin: require('../chunker/rabin')
}

module.exports = chunkers
