'use strict'
const EthBlockHeader = require('ethereumjs-block/header')
const cidFromHash = require('../util/cidFromHash')
const createResolver = require('../util/createResolver')

module.exports = createResolver('eth-block', EthBlockHeader, mapFromEthObj)


function mapFromEthObj (ethObj, options, callback) {
  const paths = []

  // external links
  paths.push({
    path: 'parent',
    value: { '/': cidFromHash('eth-block', ethObj.parentHash).toBaseEncodedString() }
  })
  paths.push({
    path: 'ommers',
    value: { '/': cidFromHash('eth-block-list', ethObj.uncleHash).toBaseEncodedString() }
  })
  paths.push({
    path: 'transactions',
    value: { '/': cidFromHash('eth-tx-trie', ethObj.transactionsTrie).toBaseEncodedString() }
  })
  paths.push({
    path: 'transactionReceipts',
    value: { '/': cidFromHash('eth-tx-receipt-trie', ethObj.receiptTrie).toBaseEncodedString() }
  })
  paths.push({
    path: 'state',
    value: { '/': cidFromHash('eth-state-trie', ethObj.stateRoot).toBaseEncodedString() }
  })

  // external links as data
  paths.push({
    path: 'parentHash',
    value: ethObj.parentHash
  })
  paths.push({
    path: 'ommerHash',
    value: ethObj.uncleHash
  })
  paths.push({
    path: 'transactionTrieRoot',
    value: ethObj.transactionsTrie
  })
  paths.push({
    path: 'transactionReceiptTrieRoot',
    value: ethObj.receiptTrie
  })
  paths.push({
    path: 'stateRoot',
    value: ethObj.stateRoot
  })

  // internal data
  paths.push({
    path: 'authorAddress',
    value: ethObj.coinbase
  })
  paths.push({
    path: 'bloom',
    value: ethObj.bloom
  })
  paths.push({
    path: 'difficulty',
    value: ethObj.difficulty
  })
  paths.push({
    path: 'number',
    value: ethObj.number
  })
  paths.push({
    path: 'gasLimit',
    value: ethObj.gasLimit
  })
  paths.push({
    path: 'gasUsed',
    value: ethObj.gasUsed
  })
  paths.push({
    path: 'timestamp',
    value: ethObj.timestamp
  })
  paths.push({
    path: 'extraData',
    value: ethObj.extraData
  })
  paths.push({
    path: 'mixHash',
    value: ethObj.mixHash
  })
  paths.push({
    path: 'nonce',
    value: ethObj.nonce
  })

  callback(null, paths)
}
