/* eslint-env mocha */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multiaddr = require('multiaddr')

const WebSocketStar = require('../src')

describe('filter', () => {
  it('filters non valid websocket-star multiaddrs', () => {
    const ws = new WebSocketStar()

    const maArr = [
      multiaddr('/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo1'),
      multiaddr('/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star'),
      multiaddr('/dnsaddr/libp2p.io/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo1'),
      multiaddr('/dnsaddr/signal.libp2p.io/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo1'),
      multiaddr('/dnsaddr/signal.libp2p.io/wss/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo1'),
      multiaddr('/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo2'),
      multiaddr('/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo3'),
      multiaddr('/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4'),
      multiaddr('/ip4/127.0.0.1/tcp/9090/ws/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4'),
      multiaddr('/ip4/127.0.0.1/tcp/9090/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4'),
      multiaddr('/p2p-websocket-star/ip4/127.0.0.1/tcp/9090/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4')
    ]

    const filtered = ws.filter(maArr)
    expect(filtered.length).to.not.equal(maArr.length)
    expect(filtered.length).to.equal(8)
  })

  it('filter a single addr for this transport', () => {
    const ws = new WebSocketStar()
    const ma = multiaddr('/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo1')

    const filtered = ws.filter(ma)
    expect(filtered.length).to.equal(1)
  })
})
