'use strict'
/* eslint max-nested-callbacks: ["error", 5] */

const ethAccountSnapshotResolver = require('../eth-account-snapshot')
const createTrieResolver = require('../util/createTrieResolver')

const ethStateTrieResolver = createTrieResolver('eth-state-trie', ethAccountSnapshotResolver)

module.exports = ethStateTrieResolver
