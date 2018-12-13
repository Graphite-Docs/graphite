'use strict'
const EthAccount = require('ethereumjs-account')
const cidFromHash = require('../util/cidFromHash')
const createResolver = require('../util/createResolver')
const emptyCodeHash = require('../util/emptyCodeHash')

module.exports = createResolver('eth-account-snapshot', EthAccount, mapFromEthObj)


function mapFromEthObj (account, options, callback) {
  const paths = []

  // external links

  paths.push({
    path: 'storage',
    value: { '/': cidFromHash('eth-storage-trie', account.stateRoot).toBaseEncodedString() }
  })

  // resolve immediately if empty, otherwise link to code
  if (emptyCodeHash.equals(account.codeHash)) {
    paths.push({
      path: 'code',
      value: Buffer.from(''),
    })
  } else {
    paths.push({
      path: 'code',
      value: { '/': cidFromHash('raw', account.codeHash).toBaseEncodedString() }
    })
  }

  // external links as data

  paths.push({
    path: 'stateRoot',
    value: account.stateRoot
  })

  paths.push({
    path: 'codeHash',
    value: account.codeHash
  })

  // internal data

  paths.push({
    path: 'nonce',
    value: account.nonce
  })

  paths.push({
    path: 'balance',
    value: account.balance
  })

  // helpers

  paths.push({
    path: 'isEmpty',
    value: account.isEmpty()
  })

  paths.push({
    path: 'isContract',
    value: account.isContract()
  })

  callback(null, paths)
}
