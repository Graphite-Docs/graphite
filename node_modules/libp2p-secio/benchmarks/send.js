'use strict'

const Benchmark = require('benchmark')
const pull = require('pull-stream')
const Connection = require('interface-connection').Connection
const parallel = require('async/parallel')
const pair = require('pull-pair/duplex')
const PeerId = require('peer-id')

const secio = require('../src')

const suite = new Benchmark.Suite('secio')
let peers

function sendData (a, b, opts, finish) {
  opts = Object.assign({ times: 1, size: 100 }, opts)

  pull(
    pull.infinite(() => Buffer.allocUnsafe(opts.size)),
    pull.take(opts.times),
    a
  )

  let length = 0

  pull(
    b,
    pull.drain((data) => {
      length += data.length
    }, () => {
      if (length !== opts.times * opts.size) {
        throw new Error('Did not receive enough chunks')
      }
      finish.resolve()
    })
  )
}

function ifErr (err) {
  if (err) {
    throw err
  }
}

suite.add('create peers for test', (deferred) => {
  parallel([
    (cb) => PeerId.createFromJSON(require('./peer-a'), cb),
    (cb) => PeerId.createFromJSON(require('./peer-b'), cb)
  ], (err, _peers) => {
    if (err) { throw err }
    peers = _peers

    deferred.resolve()
  })
}, { defer: true })

suite.add('establish an encrypted channel', (deferred) => {
  const p = pair()

  const peerA = peers[0]
  const peerB = peers[1]

  const aToB = secio.encrypt(peerA, new Connection(p[0]), peerB, ifErr)
  const bToA = secio.encrypt(peerB, new Connection(p[1]), peerA, ifErr)

  sendData(aToB, bToA, {}, deferred)
}, { defer: true })

const cases = [
  [10, 262144],
  [100, 262144],
  [1000, 262144]
  // [10000, 262144],
  // [100000, 262144],
  // [1000000, 262144]
]
cases.forEach((el) => {
  const times = el[0]
  const size = el[1]

  suite.add(`send plaintext ${times} x ${size} bytes`, (deferred) => {
    const p = pair()

    sendData(p[0], p[1], { times: times, size: size }, deferred)
  }, { defer: true })

  suite.add(`send encrypted ${times} x ${size} bytes`, (deferred) => {
    const p = pair()

    const peerA = peers[0]
    const peerB = peers[1]

    const aToB = secio.encrypt(peerA, new Connection(p[0]), peerB, ifErr)
    const bToA = secio.encrypt(peerB, new Connection(p[1]), peerA, ifErr)

    sendData(aToB, bToA, { times: times, size: size }, deferred)
  }, { defer: true })
})

suite.on('cycle', (event) => {
  console.log(String(event.target))
})

// run async
suite.run({ async: true })
