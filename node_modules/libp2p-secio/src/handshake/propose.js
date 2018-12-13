'use strict'

const debug = require('debug')
const waterfall = require('async/waterfall')

const support = require('../support')
const crypto = require('./crypto')

const log = debug('libp2p:secio')
log.error = debug('libp2p:secio:error')

// step 1. Propose
// -- propose cipher suite + send pubkeys + nonce
module.exports = function propose (state, callback) {
  log('1. propose - start')

  log('1. propose - writing proposal')
  support.write(state, crypto.createProposal(state))

  waterfall([
    (cb) => support.read(state.shake, cb),
    (msg, cb) => {
      log('1. propose - reading proposal', msg)
      crypto.identify(state, msg, cb)
    },
    (cb) => crypto.selectProtocols(state, cb)
  ], (err) => {
    if (err) {
      return callback(err)
    }

    log('1. propose - finish')
    callback()
  })
}
