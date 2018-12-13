'use strict'

const multiaddr = require('multiaddr')
const pull = require('pull-stream')
const WS = require('libp2p-websockets')
const PeerId = require('peer-id')

const secio = require('./src')

const peerNodeJSON = require('./test/fixtures/peer-node.json')
const ma = multiaddr('/ip4/127.0.0.1/tcp/9090/ws')
let listener

module.exports = {
  hooks: {
    browser: {
      pre: (done) => {
        PeerId.createFromJSON(peerNodeJSON, (err, peerId) => {
          if (err) { throw err }

          const ws = new WS()

          listener = ws.createListener((conn) => {
            const encryptedConn = secio.encrypt(peerId, conn, undefined, (err) => {
              if (err) { throw err }
            })

            // echo
            pull(encryptedConn, encryptedConn)
          })

          listener.listen(ma, done)
        })
      },
      post: (done) => {
        listener.close(done)
      }
    }
  }
}
