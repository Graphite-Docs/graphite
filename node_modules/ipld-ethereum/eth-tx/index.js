'use strict'
const EthTx = require('ethereumjs-tx')
const createResolver = require('../util/createResolver')

module.exports = createResolver('eth-tx', EthTx, mapFromEthObj)


function mapFromEthObj (tx, options, callback) {
  const paths = []

  // external links (none)

  // external links as data (none)

  // internal data

  paths.push({
    path: 'nonce',
    value: tx.nonce
  })
  paths.push({
    path: 'gasPrice',
    value: tx.gasPrice
  })
  paths.push({
    path: 'gasLimit',
    value: tx.gasLimit
  })
  paths.push({
    path: 'toAddress',
    value: tx.to
  })
  paths.push({
    path: 'value',
    value: tx.value
  })
  paths.push({
    path: 'data',
    value: tx.data
  })
  paths.push({
    path: 'v',
    value: tx.v
  })
  paths.push({
    path: 'r',
    value: tx.r
  })
  paths.push({
    path: 's',
    value: tx.s
  })

  // helpers

  paths.push({
    path: 'fromAddress',
    value: tx.from
  })

  paths.push({
    path: 'signature',
    value: [tx.v, tx.r, tx.s]
  })

  paths.push({
    path: 'isContractPublish',
    value: tx.toCreationAddress()
  })

  callback(null, paths)
}
