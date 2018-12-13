'use strict'

const bs58 = require('bs58')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')

function getB58Str (peer) {
  let b58Str

  if (typeof peer === 'string') {
    b58Str = peer
  } else if (Buffer.isBuffer(peer)) {
    b58Str = bs58.encode(peer).toString()
  } else if (PeerId.isPeerId(peer)) {
    b58Str = peer.toB58String()
  } else if (PeerInfo.isPeerInfo(peer)) {
    b58Str = peer.id.toB58String()
  } else {
    throw new Error('not valid PeerId or PeerInfo, or B58Str')
  }

  return b58Str
}

class PeerBook {
  constructor () {
    this._peers = {}
  }

  // checks if peer exists
  // peer can be PeerId, b58String or PeerInfo
  has (peer) {
    const b58Str = getB58Str(peer)
    return Boolean(this._peers[b58Str])
  }

  /**
   * Stores a peerInfo, if already exist, merges the new into the old.
   *
   * @param {PeerInfo} peerInfo
   * @param {Boolean} replace
   * @returns {PeerInfo}
   */
  put (peerInfo, replace) {
    const localPeerInfo = this._peers[peerInfo.id.toB58String()]

    // insert if doesn't exist or replace if replace flag is true
    if (!localPeerInfo || replace) {
      this._peers[peerInfo.id.toB58String()] = peerInfo
      return peerInfo
    }

    // peerInfo.replace merges by default if none to replace are passed
    peerInfo.multiaddrs.forEach((ma) => localPeerInfo.multiaddrs.add(ma))

    // pass active connection state
    const ma = peerInfo.isConnected()
    if (ma) {
      localPeerInfo.connect(ma)
    }

    // pass known protocols
    peerInfo.protocols.forEach((p) => localPeerInfo.protocols.add(p))

    if (!localPeerInfo.id.privKey && peerInfo.id.privKey) {
      localPeerInfo.id.privKey = peerInfo.id.privKey
    }

    if (!localPeerInfo.id.pubKey && peerInfo.id.pubKey) {
      localPeerInfo.id.pubKey = peerInfo.id.pubKey
    }

    return localPeerInfo
  }

  /**
   * Get the info to the given PeerId, PeerInfo or b58Str id
   *
   * @param {PeerId} peer
   * @returns {PeerInfo}
   */
  get (peer) {
    const b58Str = getB58Str(peer)

    const peerInfo = this._peers[b58Str]

    if (peerInfo) {
      return peerInfo
    }
    throw new Error('PeerInfo not found')
  }

  getAll () {
    return this._peers
  }

  getAllArray () {
    return Object.keys(this._peers).map((b58Str) => this._peers[b58Str])
  }

  getMultiaddrs (peer) {
    const info = this.get(peer)
    return info.multiaddrs.toArray()
  }

  remove (peer) {
    const b58Str = getB58Str(peer)

    if (this._peers[b58Str]) {
      delete this._peers[b58Str]
    }
  }
}

module.exports = PeerBook
