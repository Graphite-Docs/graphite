/* eslint-env mocha */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multiaddr = require('multiaddr')
const each = require('async/each')

const WebSocketStar = require('../src')

describe('peer discovery', () => {
  let listeners = []
  let ws1
  const ma1 = multiaddr('/ip4/127.0.0.1/tcp/15001/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo3A')

  let ws2
  const ma2 = multiaddr('/ip4/127.0.0.1/tcp/15003/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo3B')

  it('listen on the first', (done) => {
    ws1 = new WebSocketStar({ allowJoinWithDisabledChallenge: true })

    const listener = ws1.createListener((/* conn */) => {})

    listeners.push(listener)
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

    const listener = ws2.createListener((/* conn */) => {})

    listeners.push(listener)
    listener.listen(ma2, (err) => {
      expect(err).to.not.exist()
    })
  }).timeout(5000)

  after(done => each(listeners, (l, next) => l.close(next), done))
})
