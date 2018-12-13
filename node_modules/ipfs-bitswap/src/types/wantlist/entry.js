'use strict'

const assert = require('assert')
const CID = require('cids')

class WantListEntry {
  constructor (cid, priority) {
    assert(CID.isCID(cid), 'must be valid CID')

    // Keep track of how many requests we have for this key
    this._refCounter = 1

    this.cid = cid
    this.priority = priority || 1
  }

  inc () {
    this._refCounter += 1
  }

  dec () {
    this._refCounter = Math.max(0, this._refCounter - 1)
  }

  hasRefs () {
    return this._refCounter > 0
  }

  // So that console.log prints a nice description of this object
  get [Symbol.toStringTag] () {
    const cidStr = this.cid.toBaseEncodedString()
    return `WantlistEntry <key: ${cidStr}, priority: ${this.priority}, refs: ${this._refCounter}>`
  }

  equals (other) {
    return (this._refCounter === other._refCounter) &&
      this.cid.equals(other.cid) &&
      this.priority === other.priority
  }
}

module.exports = WantListEntry
