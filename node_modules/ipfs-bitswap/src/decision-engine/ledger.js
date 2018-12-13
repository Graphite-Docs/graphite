'use strict'

const Wantlist = require('../types/wantlist')

class Ledger {
  constructor (peerId) {
    this.partner = peerId
    this.wantlist = new Wantlist()

    this.exchangeCount = 0
    this.sentToPeer = new Map()

    this.accounting = {
      bytesSent: 0,
      bytesRecv: 0
    }
  }

  sentBytes (n) {
    this.exchangeCount++
    this.lastExchange = (new Date()).getTime()
    this.accounting.bytesSent += n
  }

  receivedBytes (n) {
    this.exchangeCount++
    this.lastExchange = (new Date()).getTime()
    this.accounting.bytesRecv += n
  }

  wants (cid, priority) {
    this.wantlist.add(cid, priority)
  }

  cancelWant (cid) {
    this.wantlist.remove(cid)
  }

  wantlistContains (cid) {
    return this.wantlist.contains(cid)
  }

  debtRatio () {
    return (this.accounting.bytesSent / (this.accounting.bytesRecv + 1)) // +1 is to prevent division by zero
  }
}

module.exports = Ledger
