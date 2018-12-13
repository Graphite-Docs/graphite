'use strict'

const series = require('async/series')

const propose = require('./propose')
const exchange = require('./exchange')
const finish = require('./finish')

// Performs initial communication over insecure channel to share keys, IDs,
// and initiate communication, assigning all necessary params.
module.exports = function handshake (state, callback) {
  series([
    (cb) => propose(state, cb),
    (cb) => exchange(state, cb),
    (cb) => finish(state, cb)
  ], (err) => {
    state.cleanSecrets()

    if (err) {
      if (err === true) {
        err = new Error('Stream ended prematurely')
      }
      state.shake.abort(err)
    }

    // signal when the handshake is finished so that plumbing can happen
    callback(err)
  })

  return state.stream
}
