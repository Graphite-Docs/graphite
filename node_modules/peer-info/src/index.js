'use strict'

const PeerId = require('peer-id')
const ensureMultiaddr = require('./utils').ensureMultiaddr
const MultiaddrSet = require('./multiaddr-set')
const assert = require('assert')

// Peer represents a peer on the IPFS network
class PeerInfo {
  constructor (peerId) {
    assert(peerId, 'Missing peerId. Use Peer.create(cb) to create one')

    this.id = peerId
    this.multiaddrs = new MultiaddrSet()
    this.protocols = new Set()
    this._connectedMultiaddr = undefined
  }

  // only stores the current multiaddr being used
  connect (ma) {
    ma = ensureMultiaddr(ma)
    if (!this.multiaddrs.has(ma) && ma.toString() !== `/ipfs/${this.id.toB58String()}`) {
      throw new Error('can\'t be connected to missing multiaddr from set')
    }
    this._connectedMultiaddr = ma
  }

  disconnect () {
    this._connectedMultiaddr = undefined
  }

  isConnected () {
    return this._connectedMultiaddr
  }
}

PeerInfo.create = (peerId, callback) => {
  if (typeof peerId === 'function') {
    callback = peerId
    peerId = null

    PeerId.create((err, id) => {
      if (err) {
        return callback(err)
      }

      callback(null, new PeerInfo(id))
    })
    return
  }

  // Already a PeerId instance
  if (typeof peerId.toJSON === 'function') {
    callback(null, new PeerInfo(peerId))
  } else {
    PeerId.createFromJSON(peerId, (err, id) => callback(err, new PeerInfo(id)))
  }
}

PeerInfo.isPeerInfo = (peerInfo) => {
  return Boolean(typeof peerInfo === 'object' &&
    peerInfo.id &&
    peerInfo.multiaddrs)
}

module.exports = PeerInfo
