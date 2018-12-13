'use strict'

const ensureMultiaddr = require('./utils').ensureMultiaddr
const uniqBy = require('lodash.uniqby')

// Because JavaScript doesn't let you overload the compare in Set()..
class MultiaddrSet {
  constructor (multiaddrs) {
    this._multiaddrs = multiaddrs || []
    this._observedMultiaddrs = []
  }

  add (ma) {
    ma = ensureMultiaddr(ma)

    if (!this.has(ma)) {
      this._multiaddrs.push(ma)
    }
  }

  // addSafe - prevent multiaddr explosion™
  // Multiaddr explosion is when you dial to a bunch of nodes and every node
  // gives you a different observed address and you start storing them all to
  // share with other peers. This seems like a good idea until you realize that
  // most of those addresses are unique to the subnet that peer is in and so,
  // they are completely worthless for all the other peers. This method is
  // exclusively used by identify.
  addSafe (ma) {
    ma = ensureMultiaddr(ma)

    const check = this._observedMultiaddrs.some((m, i) => {
      if (m.equals(ma)) {
        this.add(ma)
        this._observedMultiaddrs.splice(i, 1)
        return true
      }
    })
    if (!check) {
      this._observedMultiaddrs.push(ma)
    }
  }

  toArray () {
    return this._multiaddrs.slice()
  }

  get size () {
    return this._multiaddrs.length
  }

  forEach (fn) {
    return this._multiaddrs.forEach(fn)
  }

  filterBy (maFmt) {
    if (typeof maFmt !== 'object' ||
      typeof maFmt.matches !== 'function' ||
      typeof maFmt.partialMatch !== 'function' ||
      typeof maFmt.toString !== 'function') return []

    return this._multiaddrs.filter((ma) => maFmt.matches(ma))
  }

  has (ma) {
    ma = ensureMultiaddr(ma)
    return this._multiaddrs.some((m) => m.equals(ma))
  }

  delete (ma) {
    ma = ensureMultiaddr(ma)

    this._multiaddrs.some((m, i) => {
      if (m.equals(ma)) {
        this._multiaddrs.splice(i, 1)
        return true
      }
    })
  }

  // replaces selected existing multiaddrs with new ones
  replace (existing, fresh) {
    if (!Array.isArray(existing)) {
      existing = [existing]
    }
    if (!Array.isArray(fresh)) {
      fresh = [fresh]
    }
    existing.forEach((m) => this.delete(m))
    fresh.forEach((m) => this.add(m))
  }

  clear () {
    this._multiaddrs = []
  }

  // this only really helps make ip6 and ip4 multiaddrs distinct if they are
  // different
  // TODO this is not an ideal solution, probably this code should just be
  // in libp2p-tcp
  distinct () {
    return uniqBy(this._multiaddrs, (ma) => {
      return [ma.toOptions().port, ma.toOptions().transport].join()
    })
  }
}

module.exports = MultiaddrSet
