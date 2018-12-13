'use strict'

const debug = require('debug')
const log = debug('libp2p:websocket-star:listener')
const multiaddr = require('multiaddr')
const io = require('socket.io-client')
const sp = require('socket.io-pull-stream')
const uuid = require('uuid')
const series = require('async/series')
const EE = require('events').EventEmitter
const Connection = require('interface-connection').Connection
const once = require('once')
const setImmediate = require('async/setImmediate')
const utils = require('./utils')
const cleanUrlSIO = utils.cleanUrlSIO
const crypto = require('libp2p-crypto')
const pull = require('pull-stream')
const ERRORS = require('./errors')

const noop = once(() => {})

const sioOptions = {
  transports: ['websocket'],
  'force new connection': true
}

/**
  * Listener for signalling server
  * @class
  * @param {Object} options - Options for the listener
  * @param {PeerId} options.id - Id for the crypto challenge
  * @param {function} options.handler - Incomming connection handler
  */
class Listener extends EE {
  constructor (options) {
    super()
    this.id = options.id
    this.log = log.bind(log, 'listener#offline')
    this.canCrypto = Boolean(options.id)
    this._handler = options.handler || noop
    this.listeners_list = options.listeners || {}
    this.flag = options.flag
    this.conns = []
    this.connected = false
  }

  // "private" functions
  /**
    * Connects to the signalling server
    * @param {function} cb - callback
    * @returns {undefined}
    * @private
    */
  _up (cb) {
    cb = cb ? once(cb) : noop
    if (this.io) {
      return cb()
    }

    this.log = log.bind(log, 'listener#' + this.server)
    this.log('dialing to signalling server')
    const _io = this.io = io.connect(this.server, sioOptions)

    sp(_io, { codec: 'buffer' })
    _io.once('error', cb)
    _io.once('connect_error', cb)
    _io.once('connect', cb)

    const proto = new utils.Protocol(this.log)

    proto.addRequest('ws-peer', ['multiaddr'], (socket, peer) => this.emit('peer', peer))
    proto.addRequest('ss-incomming', ['string', 'multiaddr', 'function'], this._incommingDial.bind(this))
    proto.handleSocket(_io)
  }

  /**
    * Disconnects from signalling server
    * @returns {undefined}
    * @private
    */
  _down () {
    if (!this.io) {
      return
    }

    this.io.disconnect()
    this.emit('close')
    delete this.io
  }

  /**
    * Performs a cryptoChallenge
    * @param {function} callback - callback
    * @returns {undefined}
    * @private
    */
  _cryptoChallenge (callback) {
    if (!this.io) {
      return callback(new Error('Not connected'))
    }

    const pubKeyStr = this.canCrypto ? crypto.keys.marshalPublicKey(this.id.pubKey).toString('hex') : ''

    const maStr = this.ma.toString()

    this.io.emit('ss-join', maStr, pubKeyStr, (err, sig) => {
      if (err) { return callback(err) }

      if (sig) {
        if (!this.canCrypto) {
          this._down()
          return callback(new Error("Can't sign cryptoChallenge: No id provided"))
        }

        this.log('performing cryptoChallenge')

        this.id.privKey.sign(Buffer.from(sig), (err, signature) => {
          if (err) {
            return callback(err)
          }
          this.signature = signature.toString('hex')
          this._join(callback)
        })
      } else {
        if (!this.flag) {
          this._down()
          return callback(new Error('Tried to listen on a server with crypto challenge disabled!\n    This is prohibited by default and can lead to security issues!\n    Please set "allowJoinWithDisabledChallenge" to true in the constructor options (but only if you know what you are doing)!'))
        }
        this.signature = '_'
        callback()
      }
    })
  }

  /**
    * Performs a cryptoChallenge when no signature is found
    * @param {function} cb - callback
    * @returns {undefined}
    * @private
    */
  _crypto (cb) {
    cb = cb ? once(cb) : noop

    this.log('joining')

    if (!this.io) {
      return cb(new Error('Not connected'))
    }

    if (this.signature) {
      this._join((err, needNewChallenge) => {
        if (needNewChallenge) {
          return this.cryptoChallenge(cb)
        }
        cb(err)
      })
    } else {
      this._cryptoChallenge(cb)
    }
  }

  /**
    * Emits ss-join with the multiaddr and signature
    *
    * @param {function} cb - callback
    * @returns {undefined}
    * @private
    */
  _join (cb) {
    this.io.emit('ss-join', this.ma.toString(), this.signature, cb)
  }

  /**
    * Handles incomming dials
    * @listens ss-incomming
    * @param {socket.io_client} socket
    * @param {string} dialId - Unique id for this dial
    * @param {string} dialFrom - Multiaddr as string
    * @param {function} cb - callback
    * @returns {undefined}
    * @private
    */
  _incommingDial (socket, dialId, dialFrom, cb) {
    this.log('dial#' + dialId + ' incomming from', dialFrom)
    const ma = multiaddr(dialFrom)
    const source = this.io.createSource(dialId + '.dialer')
    const sink = this.io.createSink(dialId + '.listener')

    cb()

    const conn = new Connection(
      {
        sink: sink,
        source: source
      }, {
        getObservedAddrs: (cb) => cb(null, [ma])
      }
    )
    this.emit('connection', conn)
    this._handler(conn)
  }

  // public functions
  /**
    * Listens on a multiaddr
    * @param {Multiaddr} ma
    * @param {function} callback
    * @returns {undefined}
    */
  listen (ma, callback) {
    this.ma = ma
    this.server = cleanUrlSIO(ma)
    this.listeners_list[this.server] = this
    callback = callback ? once(callback) : noop

    if (this.connected) { // listener was .close()'d yet not all conns disconnected. we're still connected, so don't do anything
      this.closing = false
      return setImmediate(() => callback())
    }

    series([
      (cb) => this._up(cb),
      (cb) => this._crypto(cb)
    ], (err) => {
      if (err) {
        // Error connecting to WebSocket
        if (err.description && err.description.code === 'ENOTFOUND') {
          const hostname = err.description.hostname

          err = Object.assign(new Error(`WebSocket connection failed on ${hostname}`), {
            code: ERRORS.ERR_WS_STAR_WEBSOCKET_CONNECTION
          })
        }

        this.log('error', err)
        if (!(err instanceof Error)) err = new Error(err)
        this._down()
        this.emit('error', err)
        this.emit('close')
        return callback(err)
      }

      this.log('success')
      this.connected = true

      this.io.on('reconnect', () => {
        // force to get a new signature
        this.signature = null
        this._crypto((err) => {
          if (err) {
            this.log('reconnect error', err)
            this.emit('error', err)
          } else this.log('reconnected')
        })
      })

      this.emit('listening')
      callback()
    })
  }

  /**
    * Gets the addresses the listener listens on
    * @param {function} callback
    * @returns {undefined}
    */
  getAddrs (callback) {
    setImmediate(() => callback(null, this.ma ? [this.ma] : []))
  }

  get activeConnections () {
    this.conns = this.conns.filter(c => c.sink || c.source)
    return Boolean(this.conns.length)
  }

  maybeClose () {
    if (!this.activeConnections && this.closing) {
      this.connected = false
      this.closing = false
      this.log('no more connections and listener is offline - closing')
      this._down()
    }
  }

  close (callback) {
    callback = callback ? once(callback) : noop

    this.closing = true // will close once the last connection quits
    this.maybeClose()

    callback()
  }

  stateWatch (sink, source) {
    let cstate = {sink: true, source: true}
    const watch = (name) => pull.through(v => v, e => {
      cstate[name] = false
      if (!cstate.sink && !cstate.source) {
        this.maybeClose()
      }
    })

    this.conns.push(cstate)

    return {
      sink: pull(
        watch('sink'),
        sink
      ),
      source: pull(
        source,
        watch('source')
      )
    }
  }

  // called from transport
  /**
    * Dials a peer
    * @param {Multiaddr} ma - Multiaddr to dial to
    * @param {Object} options
    * @param {function} callback
    * @returns {undefined}
    */
  dial (ma, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    const _ma = multiaddr(ma)

    const conn = new Connection(null)

    const dialId = uuid()
    const dlog = this.log.bind(log, 'dial#' + dialId)

    callback = callback ? once(callback) : noop

    let io = this.io

    if (!io) {
      return callback(new Error('Not listening'))
    }

    const sink = io.createSink(dialId + '.dialer')

    dlog('dialing', ma.toString())

    // "multiaddr", "multiaddr", "string", "function" - dialFrom, dialTo, dialId, cb
    io.emit('ss-dial', this.ma.toString(), ma.toString(), dialId, err => {
      if (err) return callback(err instanceof Error ? err : new Error(err))
      dlog(err ? 'error: ' + err.toString() : 'success')
      const source = io.createSource(dialId + '.listener')

      conn.setInnerConn(this.stateWatch(sink, source), { getObservedAddrs: (cb) => cb(null, [_ma]) })
      callback(null, conn)
    })

    return conn
  }
}

module.exports = Listener
