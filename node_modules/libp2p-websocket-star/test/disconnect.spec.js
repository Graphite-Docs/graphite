/* eslint-env mocha */

'use strict'

const multiaddr = require('multiaddr')
const series = require('async/series')
const pull = require('pull-stream')

const WebSocketStar = require('../src')

describe('disconnect', () => {
  let ws1
  const ma1 = multiaddr('/ip4/127.0.0.1/tcp/15001/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo5a')

  let ws2
  const ma2 = multiaddr('/ip4/127.0.0.1/tcp/15001/ws/p2p-websocket-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo5b')

  let conn
  let otherConn

  before((done) => {
    series([first, second], dial)

    function first (next) {
      ws1 = new WebSocketStar({ allowJoinWithDisabledChallenge: true })

      const listener = ws1.createListener((conn) => pull(conn, conn))
      listener.listen(ma1, next)
    }

    function second (next) {
      ws2 = new WebSocketStar({ allowJoinWithDisabledChallenge: true })

      const listener = ws2.createListener((conn) => (otherConn = conn))
      listener.listen(ma2, next)
    }

    function dial () {
      conn = ws1.dial(ma2, done)
    }
  })

  it('all conns die when one peer quits', (done) => {
    pull(
      conn,
      pull.collect(err => {
        if (err) return done(err)
        pull(
          otherConn,
          pull.collect(err => {
            if (err) return done(err)
            done()
          })
        )
      })
    )
    const url = Object.keys(ws2.listeners_list).shift()
    ws2.listeners_list[url]._down()
  })
})
