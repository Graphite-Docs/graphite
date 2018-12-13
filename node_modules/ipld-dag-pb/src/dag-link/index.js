'use strict'

const CID = require('cids')
const assert = require('assert')
const withIs = require('class-is')

// Link represents an IPFS Merkle DAG Link between Nodes.
class DAGLink {
  constructor (name, size, multihash) {
    assert(multihash, 'A link requires a multihash to point to')
    // assert(size, 'A link requires a size')
    //  note - links should include size, but this assert is disabled
    //  for now to maintain consistency with go-ipfs pinset

    this._name = name || ''
    this._size = size
    this._cid = new CID(multihash)
  }

  toString () {
    return `DAGLink <${this._cid.toBaseEncodedString()} - name: "${this.name}", size: ${this.size}>`
  }

  toJSON () {
    if (!this._json) {
      this._json = Object.freeze({
        name: this.name,
        size: this.size,
        multihash: this._cid.toBaseEncodedString()
      })
    }

    return Object.assign({}, this._json)
  }

  get name () {
    return this._name
  }

  set name (name) {
    throw new Error("Can't set property: 'name' is immutable")
  }

  get size () {
    return this._size
  }

  set size (size) {
    throw new Error("Can't set property: 'size' is immutable")
  }

  get multihash () {
    return this._cid.buffer
  }

  set multihash (multihash) {
    throw new Error("Can't set property: 'multihash' is immutable")
  }

  get cid () {
    return this._cid
  }

  set cid (cid) {
    throw new Error("Can't set property: 'cid' is immutable")
  }
}

exports = module.exports = withIs(DAGLink, { className: 'DAGLink', symbolName: '@ipld/js-ipld-dag-pb/daglink' })
exports.create = require('./create')
exports.util = require('./util')
