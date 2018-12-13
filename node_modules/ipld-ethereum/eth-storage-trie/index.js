'use strict'
/* eslint max-nested-callbacks: ["error", 5] */

const createTrieResolver = require('../util/createTrieResolver')

const ethStorageTrieResolver = createTrieResolver('eth-storage-trie')

module.exports = ethStorageTrieResolver
