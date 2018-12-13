'use strict'

const assert = require('assert')
const withIs = require('class-is')
const CID = require('cids')

class DAGNode {
  constructor (data, links, serialized, multihash) {
    assert(serialized, 'DAGNode needs its serialized format')
    assert(multihash, 'DAGNode needs its multihash')

    this._cid = new CID(multihash)
    this._data = data || Buffer.alloc(0)
    this._links = links || []
    this._serialized = serialized
  }

  toJSON () {
    if (!this._json) {
      this._json = Object.freeze({
        data: this.data,
        links: this.links.map((l) => l.toJSON()),
        multihash: this._cid.toBaseEncodedString(),
        size: this.size
      })
    }

    return Object.assign({}, this._json)
  }

  toString () {
    return `DAGNode <${this._cid.toBaseEncodedString()} - data: "${this.data.toString()}", links: ${this.links.length}, size: ${this.size}>`
  }

  get data () {
    return this._data
  }

  set data (data) {
    throw new Error("Can't set property: 'data' is immutable")
  }

  get links () {
    return this._links
  }

  set links (links) {
    throw new Error("Can't set property: 'links' is immutable")
  }

  get serialized () {
    return this._serialized
  }

  set serialized (serialized) {
    throw new Error("Can't set property: 'serialized' is immutable")
  }

  get size () {
    if (this._size === undefined) {
      this._size = this.links.reduce((sum, l) => sum + l.size, this.serialized.length)
    }

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

exports = module.exports = withIs(DAGNode, { className: 'DAGNode', symbolName: '@ipld/js-ipld-dag-pb/dagnode' })
exports.create = require('./create')
exports.clone = require('./clone')
exports.addLink = require('./addLink')
exports.rmLink = require('./rmLink')
