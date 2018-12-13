'use strict'
/* eslint max-nested-callbacks: ["error", 5] */

const ethTxResolver = require('../eth-tx')
const createTrieResolver = require('../util/createTrieResolver')

const ethTxTrieResolver = createTrieResolver('eth-tx-trie', ethTxResolver)

module.exports = ethTxTrieResolver
