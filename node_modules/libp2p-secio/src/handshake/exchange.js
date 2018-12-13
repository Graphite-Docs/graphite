'use strict'

const debug = require('debug')
const waterfall = require('async/waterfall')

const support = require('../support')
const crypto = require('./crypto')

const log = debug('libp2p:secio')
log.error = debug('libp2p:secio:error')

// step 2. Exchange
// -- exchange (signed) ephemeral keys. verify signatures.
module.exports = function exchange (state, callback) {
  log('2. exchange - start')

  log('2. exchange - writing exchange')
  waterfall([
    (cb) => crypto.createExchange(state, cb),
    (ex, cb) => {
      support.write(state, ex)
      support.read(state.shake, cb)
    },
    (msg, cb) => {
      log('2. exchange - reading exchange')
      crypto.verify(state, msg, cb)
    },
    (cb) => crypto.generateKeys(state, cb)
  ], (err) => {
    if (err) { return callback(err) }

    log('2. exchange - finish')
    callback()
  })
}
