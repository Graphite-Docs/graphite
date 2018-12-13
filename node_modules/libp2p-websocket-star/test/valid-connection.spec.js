/* eslint-env mocha */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const multiaddr = require('multiaddr')
const series = require('async/series')
const pull = require('pull-stream')

const WebSocketStar = require('../src')

describe('valid Connection', () => {
  let ws1
  const ma1 = multiaddr('/ip4/127.0.0.1/tcp/15001/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo5a')

  let ws2
  const ma2 = multiaddr('/ip4/127.0.0.1/tcp/15001/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo5b')

  let conn

  before((done) => {
    series([first, second], dial)

    function first (next) {
      ws1 = new WebSocketStar({ allowJoinWithDisabledChallenge: true })

      const listener = ws1.createListener((conn) => pull(conn, conn))
      listener.listen(ma1, next)
    }

    function second (next) {
      ws2 = new WebSocketStar({ allowJoinWithDisabledChallenge: true })

      const listener = ws2.createListener((conn) => pull(conn, conn))
      listener.listen(ma2, next)
    }

    function dial () {
      conn = ws1.dial(ma2, done)
    }
  })

  it('get observed addrs', (done) => {
    conn.getObservedAddrs((err, addrs) => {
      expect(err).to.not.exist()
      expect(addrs[0].toString()).to.equal(ma2.toString())
      done()
    })
  })

  it('get Peer Info', (done) => {
    conn.getPeerInfo((err, peerInfo) => {
      expect(err).to.exist()
      done()
    })
  })

  it('set Peer Info', (done) => {
    conn.setPeerInfo('info')
    conn.getPeerInfo((err, peerInfo) => {
      expect(err).to.not.exist()
      expect(peerInfo).to.equal('info')
      done()
    })
  })
})
