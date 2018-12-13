'use strict'

const debug = require('debug')
const log = debug('libp2p:websocket-star')
const multiaddr = require('multiaddr')
const EE = require('events').EventEmitter
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Connection = require('interface-connection').Connection
const setImmediate = require('async/setImmediate')
const utils = require('./utils')
const Listener = require('./listener')
const cleanUrlSIO = utils.cleanUrlSIO
const mafmt = require('mafmt')
const withIs = require('class-is')

class WebsocketStar {
  /**
    * WebsocketStar Transport
    * @class
    * @param {Object} options - Options for the listener
    * @param {PeerId} options.id - Id for the crypto challenge
    */
  constructor (options) {
    options = options || {}

    this.id = options.id
    this.flag = options.allowJoinWithDisabledChallenge // let's just refer to it as "flag"

    this.discovery = new EE()
    this.discovery.tag = 'websocketStar'
    this.discovery.start = (callback) => {
      setImmediate(callback)
    }
    this.discovery.stop = (callback) => {
      setImmediate(callback)
    }

    this.listeners_list = {}
    this._peerDiscovered = this._peerDiscovered.bind(this)
  }

  /**
    * Sets the id after transport creation (aka the lazy way)
    * @param {PeerId} id
    * @returns {undefined}
    */
  lazySetId (id) {
    if (!id) return
    this.id = id
    this.canCrypto = true
  }

  /**
    * Dials a peer
    * @param {Multiaddr} ma - Multiaddr to dial to
    * @param {Object} options
    * @param {function} callback
    * @returns {Connection}
    */
  dial (ma, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    let url
    try {
      url = cleanUrlSIO(ma)
    } catch (err) {
      return callback(err) // early
    }
    const listener = this.listeners_list[url]
    if (!listener) {
      callback(new Error('No listener for this server'))
      return new Connection()
    }
    return listener.dial(ma, options, callback)
  }

  /**
    * Creates a listener
    * @param {Object} options
    * @param {function} handler
    * @returns {Listener}
    */
  createListener (options, handler) {
    if (typeof options === 'function') {
      handler = options
      options = {}
    }

    const listener = new Listener({
      id: this.id,
      handler,
      listeners: this.listeners_list,
      flag: this.flag
    })

    listener.on('peer', this._peerDiscovered)

    return listener
  }

  /**
    * Filters multiaddrs
    * @param {Multiaddr[]} multiaddrs
    * @returns {boolean}
    */
  filter (multiaddrs) {
    if (!Array.isArray(multiaddrs)) {
      multiaddrs = [multiaddrs]
    }

    return multiaddrs.filter((ma) => mafmt.WebSocketStar.matches(ma))
  }

  /**
    * Used to fire peer events on the discovery part
    * @param {Multiaddr} maStr
    * @fires Discovery#peer
    * @returns {undefined}
    * @private
    */
  _peerDiscovered (maStr) {
    log('Peer Discovered:', maStr)
    const peerIdStr = maStr.split('/ipfs/').pop()
    const peerId = PeerId.createFromB58String(peerIdStr)
    const peerInfo = new PeerInfo(peerId)

    peerInfo.multiaddrs.add(multiaddr(maStr))
    this.discovery.emit('peer', peerInfo)
  }
}

module.exports = withIs(WebsocketStar, { className: 'WebsocketStar', symbolName: '@libp2p/js-libp2p-websocket-star/websocketstar' })
