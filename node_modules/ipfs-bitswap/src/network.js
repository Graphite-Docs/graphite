'use strict'

const lp = require('pull-length-prefixed')
const pull = require('pull-stream')
const waterfall = require('async/waterfall')
const each = require('async/each')
const setImmediate = require('async/setImmediate')

const Message = require('./types/message')
const CONSTANTS = require('./constants')
const logger = require('./utils').logger

const BITSWAP100 = '/ipfs/bitswap/1.0.0'
const BITSWAP110 = '/ipfs/bitswap/1.1.0'

class Network {
  constructor (libp2p, bitswap, options, stats) {
    this._log = logger(libp2p.peerInfo.id, 'network')
    options = options || {}
    this.libp2p = libp2p
    this.bitswap = bitswap
    this.b100Only = options.b100Only || false

    this._stats = stats
    this._running = false
  }

  start (callback) {
    this._running = true
    // bind event listeners
    this._onPeerConnect = this._onPeerConnect.bind(this)
    this._onPeerDisconnect = this._onPeerDisconnect.bind(this)

    this._onConnection = this._onConnection.bind(this)
    this.libp2p.handle(BITSWAP100, this._onConnection)
    if (!this.b100Only) { this.libp2p.handle(BITSWAP110, this._onConnection) }

    this.libp2p.on('peer:connect', this._onPeerConnect)
    this.libp2p.on('peer:disconnect', this._onPeerDisconnect)

    // All existing connections are like new ones for us
    this.libp2p.peerBook
      .getAllArray()
      .filter((peer) => peer.isConnected())
      .forEach((peer) => this._onPeerConnect((peer)))

    setImmediate(() => callback())
  }

  stop (callback) {
    this._running = false

    this.libp2p.unhandle(BITSWAP100)
    if (!this.b100Only) { this.libp2p.unhandle(BITSWAP110) }

    this.libp2p.removeListener('peer:connect', this._onPeerConnect)
    this.libp2p.removeListener('peer:disconnect', this._onPeerDisconnect)

    setImmediate(() => callback())
  }

  // Handles both types of bitswap messgages
  _onConnection (protocol, conn) {
    if (!this._running) { return }
    this._log('incomming new bitswap connection: %s', protocol)

    pull(
      conn,
      lp.decode(),
      pull.asyncMap((data, cb) => Message.deserialize(data, cb)),
      pull.asyncMap((msg, cb) => {
        conn.getPeerInfo((err, peerInfo) => {
          if (err) { return cb(err) }

          // this._log('data from', peerInfo.id.toB58String())
          this.bitswap._receiveMessage(peerInfo.id, msg, cb)
        })
      }),
      pull.onEnd((err) => {
        this._log('ending connection')
        if (err) {
          this.bitswap._receiveError(err)
        }
      })
    )
  }

  _onPeerConnect (peerInfo) {
    if (!this._running) { return }

    this.bitswap._onPeerConnected(peerInfo.id)
  }

  _onPeerDisconnect (peerInfo) {
    if (!this._running) { return }

    this.bitswap._onPeerDisconnected(peerInfo.id)
  }

  findProviders (cid, maxProviders, callback) {
    // TODO
    // consider if we want to trickleDown maxProviders, currently this is
    // not an exposed option:
    // https://github.com/libp2p/js-libp2p-kad-dht/blob/master/src/index.js#L416
    this.libp2p.contentRouting.findProviders(cid, CONSTANTS.providerRequestTimeout, callback)
  }

  findAndConnect (cid, callback) {
    waterfall([
      (cb) => this.findProviders(cid, CONSTANTS.maxProvidersPerRequest, cb),
      (provs, cb) => {
        this._log('connecting to providers', provs.map((p) => p.id.toB58String()))
        each(provs, (p, cb) => this.connectTo(p, cb))
      }
    ], callback)
  }

  provide (cid, callback) {
    this.libp2p.contentRouting.provide(cid, callback)
  }

  // Connect to the given peer
  // Send the given msg (instance of Message) to the given peer
  sendMessage (peer, msg, callback) {
    if (!this._running) { return callback(new Error(`network isn't running`)) }

    const stringId = peer.toB58String() ? peer.toB58String() : peer.id.toB58String()
    this._log('sendMessage to %s', stringId, msg)

    this._dialPeer(peer, (err, conn, protocol) => {
      if (err) {
        return callback(err)
      }

      let serialized
      switch (protocol) {
        case BITSWAP100:
          serialized = msg.serializeToBitswap100()
          break
        case BITSWAP110:
          serialized = msg.serializeToBitswap110()
          break
        default:
          return callback(new Error('Unkown protocol: ' + protocol))
      }
      // TODO: why doesn't the error get propageted back??
      writeMessage(conn, serialized, (err) => {
        if (err) {
          this._log.error(err)
        }
      })
      callback()
      this._updateSentStats(peer, msg.blocks)
    })
  }

  connectTo (peer, callback) {
    if (!this._running) { return callback(new Error(`network isn't running`)) }

    this.libp2p.dial(peer, callback)
  }

  // Dial to the peer and try to use the most recent Bitswap
  _dialPeer (peer, callback) {
    // Attempt Bitswap 1.1.0
    this.libp2p.dialProtocol(peer, BITSWAP110, (err, conn) => {
      if (err) {
        // Attempt Bitswap 1.0.0
        this.libp2p.dialProtocol(peer, BITSWAP100, (err, conn) => {
          if (err) { return callback(err) }

          callback(null, conn, BITSWAP100)
        })

        return
      }

      callback(null, conn, BITSWAP110)
    })
  }

  _updateSentStats (peer, blocks) {
    const peerId = peer.toB58String()
    if (this._stats) {
      blocks.forEach((block) => this._stats.push(peerId, 'dataSent', block.data.length))
      this._stats.push(peerId, 'blocksSent', blocks.size)
    }
  }
}

function writeMessage (conn, msg, callback) {
  pull(
    pull.values([msg]),
    lp.encode(),
    conn,
    pull.onEnd(callback)
  )
}

module.exports = Network
