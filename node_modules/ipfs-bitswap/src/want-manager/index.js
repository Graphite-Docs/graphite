'use strict'

const setImmediate = require('async/setImmediate')

const Message = require('../types/message')
const Wantlist = require('../types/wantlist')
const CONSTANTS = require('../constants')
const MsgQueue = require('./msg-queue')
const logger = require('../utils').logger

module.exports = class WantManager {
  constructor (peerId, network, stats) {
    this.peers = new Map()
    this.wantlist = new Wantlist(stats)

    this.network = network
    this._stats = stats

    this._peerId = peerId
    this._log = logger(peerId, 'want')
  }

  _addEntries (cids, cancel, force) {
    const entries = cids.map((cid, i) => {
      return new Message.Entry(cid, CONSTANTS.kMaxPriority - i, cancel)
    })

    entries.forEach((e) => {
      // add changes to our wantlist
      if (e.cancel) {
        if (force) {
          this.wantlist.removeForce(e.cid)
        } else {
          this.wantlist.remove(e.cid)
        }
      } else {
        this._log('adding to wl')
        this.wantlist.add(e.cid, e.priority)
      }
    })

    // broadcast changes
    for (let p of this.peers.values()) {
      p.addEntries(entries)
    }
  }

  _startPeerHandler (peerId) {
    let mq = this.peers.get(peerId.toB58String())

    if (mq) {
      mq.refcnt++
      return
    }

    mq = new MsgQueue(this._peerId, peerId, this.network)

    // new peer, give them the full wantlist
    const fullwantlist = new Message(true)

    for (let entry of this.wantlist.entries()) {
      fullwantlist.addEntry(entry[1].cid, entry[1].priority)
    }

    mq.addMessage(fullwantlist)

    this.peers.set(peerId.toB58String(), mq)
    return mq
  }

  _stopPeerHandler (peerId) {
    const mq = this.peers.get(peerId.toB58String())

    if (!mq) {
      return
    }

    mq.refcnt--
    if (mq.refcnt > 0) {
      return
    }

    this.peers.delete(peerId.toB58String())
  }

  // add all the cids to the wantlist
  wantBlocks (cids) {
    this._addEntries(cids, false)
  }

  // remove blocks of all the given keys without respecting refcounts
  unwantBlocks (cids) {
    this._log('unwant blocks: %s', cids.length)
    this._addEntries(cids, true, true)
  }

  // cancel wanting all of the given keys
  cancelWants (cids) {
    this._log('cancel wants: %s', cids.length)
    this._addEntries(cids, true)
  }

  // Returns a list of all currently connected peers
  connectedPeers () {
    return Array.from(this.peers.keys())
  }

  connected (peerId) {
    this._startPeerHandler(peerId)
  }

  disconnected (peerId) {
    this._stopPeerHandler(peerId)
  }

  start (callback) {
    // resend entire wantlist every so often
    this.timer = setInterval(() => {
      this._log('resend full-wantlist')
      const fullwantlist = new Message(true)
      this.wantlist.forEach((entry) => {
        fullwantlist.addEntry(entry.cid, entry.priority)
      })

      this.peers.forEach((p) => p.addMessage(fullwantlist))
    }, 60 * 1000)

    setImmediate(() => callback())
  }

  stop (callback) {
    this.peers.forEach((mq) => this.disconnected(mq.peerId))

    clearInterval(this.timer)
    setImmediate(() => callback())
  }
}
