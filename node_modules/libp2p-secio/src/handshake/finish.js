'use strict'

const pull = require('pull-stream')
const handshake = require('pull-handshake')
const debug = require('debug')

const log = debug('libp2p:secio')
log.error = debug('libp2p:secio:error')

const etm = require('../etm')
const crypto = require('./crypto')

// step 3. Finish
// -- send expected message to verify encryption works (send local nonce)
module.exports = function finish (state, callback) {
  log('3. finish - start')

  const proto = state.protocols
  const stream = state.shake.rest()
  const shake = handshake({timeout: state.timeout}, (err) => {
    if (err) {
      throw err
    }
  })

  pull(
    stream,
    etm.createUnboxStream(proto.remote.cipher, proto.remote.mac),
    shake,
    etm.createBoxStream(proto.local.cipher, proto.local.mac),
    stream
  )

  shake.handshake.write(state.proposal.in.rand)
  shake.handshake.read(state.proposal.in.rand.length, (err, nonceBack) => {
    const fail = (err) => {
      log.error(err)
      state.secure.resolve({
        source: pull.error(err),
        sink (read) {
        }
      })
      callback(err)
    }

    if (err) return fail(err)

    try {
      crypto.verifyNonce(state, nonceBack)
    } catch (err) {
      return fail(err)
    }

    log('3. finish - finish')

    // Awesome that's all folks.
    state.secure.resolve(shake.handshake.rest())
    callback()
  })
}
