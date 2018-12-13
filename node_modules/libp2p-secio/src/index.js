'use strict'

const pull = require('pull-stream')
const Connection = require('interface-connection').Connection
const assert = require('assert')
const PeerInfo = require('peer-info')
const debug = require('debug')
const once = require('once')
const log = debug('libp2p:secio')
log.error = debug('libp2p:secio:error')

const handshake = require('./handshake')
const State = require('./state')

module.exports = {
  tag: '/secio/1.0.0',
  encrypt (localId, conn, remoteId, callback) {
    assert(localId, 'no local private key provided')
    assert(conn, 'no connection for the handshake  provided')

    if (typeof remoteId === 'function') {
      callback = remoteId
      remoteId = undefined
    }

    callback = once(callback || function (err) {
      if (err) { log.error(err) }
    })

    const timeout = 60 * 1000 * 5

    const state = new State(localId, remoteId, timeout, callback)

    function finish (err) {
      if (err) { return callback(err) }

      conn.getPeerInfo((err, peerInfo) => {
        encryptedConnection.setInnerConn(new Connection(state.secure, conn))

        if (err) { // no peerInfo yet, means I'm the receiver
          encryptedConnection.setPeerInfo(new PeerInfo(state.id.remote))
        }

        callback()
      })
    }

    const encryptedConnection = new Connection(undefined, conn)

    pull(
      conn,
      handshake(state, finish),
      conn
    )

    return encryptedConnection
  }
}
