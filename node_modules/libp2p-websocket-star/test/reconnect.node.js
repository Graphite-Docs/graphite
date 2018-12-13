/* eslint-env mocha */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const multiaddr = require('multiaddr')
const rendezvous = require('libp2p-websocket-star-rendezvous')

const WebSocketStar = require('../src')

const SERVER_PORT = 13580

describe('reconnect to signaling server', () => {
  let r
  let ws1
  const ma1 = multiaddr('/ip4/127.0.0.1/tcp/13580/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo6A')

  let ws2
  const ma2 = multiaddr('/ip4/127.0.0.1/tcp/13580/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo6B')

  let ws3
  const ma3 = multiaddr('/ip4/127.0.0.1/tcp/13580/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo6C')

  before((done) => {
    r = rendezvous.start({
      port: SERVER_PORT,
      cryptoChallenge: false
    }, done)
  })

  after((done) => r.stop(done))

  it('listen on the first', (done) => {
    ws1 = new WebSocketStar({ allowJoinWithDisabledChallenge: true })

    const listener = ws1.createListener((conn) => {})
    listener.listen(ma1, (err) => {
      expect(err).to.not.exist()
      done()
    })
  })

  it('listen on the second, discover the first', (done) => {
    ws2 = new WebSocketStar({ allowJoinWithDisabledChallenge: true })

    ws1.discovery.once('peer', (peerInfo) => {
      expect(peerInfo.multiaddrs.has(ma2)).to.equal(true)
      done()
    })

    const listener = ws2.createListener((conn) => {})
    listener.listen(ma2, (err) => {
      expect(err).to.not.exist()
    })
  })

  it('stops the server', (done) => {
    r.stop(done)
  })

  it('starts the server again', (done) => {
    r = rendezvous.start({ port: SERVER_PORT, cryptoChallenge: false }, done)
  })

  it('wait a bit for clients to reconnect', (done) => {
    setTimeout(done, 1990)
  })

  it('listen on the third, first discovers it', (done) => {
    ws3 = new WebSocketStar({ allowJoinWithDisabledChallenge: true })

    const listener = ws3.createListener((conn) => {})
    listener.listen(ma3, (err) => expect(err).to.not.exist())

    ws1.discovery.once('peer', (peerInfo) => {
      expect(peerInfo.multiaddrs.has(ma3)).to.equal(true)
      done()
    })
  })
})
