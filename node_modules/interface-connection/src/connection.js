'use strict'

const defer = require('pull-defer/duplex')

module.exports = class Connection {
  constructor (conn, info) {
    this.peerInfo = null
    this.conn = defer()

    if (conn) {
      this.setInnerConn(conn, info)
    } else if (info) {
      this.info = info
    }
  }

  get source () {
    return this.conn.source
  }

  get sink () {
    return this.conn.sink
  }

  getPeerInfo (callback) {
    if (this.info && this.info.getPeerInfo) {
      return this.info.getPeerInfo(callback)
    }

    if (!this.peerInfo) {
      return callback(new Error('Peer Info not set yet'))
    }

    callback(null, this.peerInfo)
  }

  setPeerInfo (peerInfo) {
    if (this.info && this.info.setPeerInfo) {
      return this.info.setPeerInfo(peerInfo)
    }

    this.peerInfo = peerInfo
  }

  getObservedAddrs (callback) {
    if (this.info && this.info.getObservedAddrs) {
      return this.info.getObservedAddrs(callback)
    }
    callback(null, [])
  }

  setInnerConn (conn, info) {
    this.conn.resolve(conn)
    if (info) {
      this.info = info
    } else {
      this.info = conn
    }
  }
}
