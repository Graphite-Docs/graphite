'use strict'

const protons = require('protons')
const Block = require('ipfs-block')
const isEqualWith = require('lodash.isequalwith')
const assert = require('assert')
const each = require('async/each')
const CID = require('cids')
const codecName = require('multicodec/src/name-table')
const vd = require('varint-decoder')
const multihashing = require('multihashing-async')

const pbm = protons(require('./message.proto'))
const Entry = require('./entry')

class BitswapMessage {
  constructor (full) {
    this.full = full
    this.wantlist = new Map()
    this.blocks = new Map()
  }

  get empty () {
    return this.blocks.size === 0 &&
           this.wantlist.size === 0
  }

  addEntry (cid, priority, cancel) {
    assert(cid && CID.isCID(cid), 'must be a valid cid')
    const cidStr = cid.buffer.toString()

    const entry = this.wantlist.get(cidStr)

    if (entry) {
      entry.priority = priority
      entry.cancel = Boolean(cancel)
    } else {
      this.wantlist.set(cidStr, new Entry(cid, priority, cancel))
    }
  }

  addBlock (block) {
    assert(Block.isBlock(block), 'must be a valid cid')
    const cidStr = block.cid.buffer.toString()
    this.blocks.set(cidStr, block)
  }

  cancel (cid) {
    assert(CID.isCID(cid), 'must be a valid cid')
    const cidStr = cid.buffer.toString()
    this.wantlist.delete(cidStr)
    this.addEntry(cid, 0, true)
  }

  /*
   * Serializes to Bitswap Message protobuf of
   * version 1.0.0
   */
  serializeToBitswap100 () {
    const msg = {
      wantlist: {
        entries: Array.from(this.wantlist.values()).map((entry) => {
          return {
            block: entry.cid.buffer, // cid
            priority: Number(entry.priority),
            cancel: Boolean(entry.cancel)
          }
        })
      },
      blocks: Array.from(this.blocks.values())
        .map((block) => block.data)
    }

    if (this.full) {
      msg.wantlist.full = true
    }

    return pbm.Message.encode(msg)
  }

  /*
   * Serializes to Bitswap Message protobuf of
   * version 1.1.0
   */
  serializeToBitswap110 () {
    const msg = {
      wantlist: {
        entries: Array.from(this.wantlist.values()).map((entry) => {
          return {
            block: entry.cid.buffer, // cid
            priority: Number(entry.priority),
            cancel: Boolean(entry.cancel)
          }
        })
      },
      payload: []
    }

    if (this.full) {
      msg.wantlist.full = true
    }

    this.blocks.forEach((block) => {
      msg.payload.push({
        prefix: block.cid.prefix,
        data: block.data
      })
    })

    return pbm.Message.encode(msg)
  }

  equals (other) {
    const cmp = (a, b) => {
      if (a.equals && typeof a.equals === 'function') {
        return a.equals(b)
      }
    }

    if (this.full !== other.full ||
        !isEqualWith(this.wantlist, other.wantlist, cmp) ||
        !isEqualWith(this.blocks, other.blocks, cmp)
    ) {
      return false
    }

    return true
  }

  get [Symbol.toStringTag] () {
    const list = Array.from(this.wantlist.keys())
    const blocks = Array.from(this.blocks.keys())
    return `BitswapMessage <full: ${this.full}, list: ${list}, blocks: ${blocks}>`
  }
}

BitswapMessage.deserialize = (raw, callback) => {
  let decoded
  try {
    decoded = pbm.Message.decode(raw)
  } catch (err) {
    return setImmediate(() => callback(err))
  }

  const isFull = (decoded.wantlist && decoded.wantlist.full) || false
  const msg = new BitswapMessage(isFull)

  if (decoded.wantlist) {
    decoded.wantlist.entries.forEach((entry) => {
      // note: entry.block is the CID here
      let cid
      try {
        cid = new CID(entry.block)
      } catch (err) {
        return callback(err)
      }
      msg.addEntry(cid, entry.priority, entry.cancel)
    })
  }

  // Bitswap 1.0.0
  // decoded.blocks are just the byte arrays
  if (decoded.blocks.length > 0) {
    return each(decoded.blocks, (b, cb) => {
      multihashing(b, 'sha2-256', (err, hash) => {
        if (err) {
          return cb(err)
        }
        let cid
        try {
          cid = new CID(hash)
        } catch (err) {
          return callback(err)
        }
        msg.addBlock(new Block(b, cid))
        cb()
      })
    }, (err) => {
      if (err) {
        return callback(err)
      }
      callback(null, msg)
    })
  }

  // Bitswap 1.1.0
  if (decoded.payload.length > 0) {
    return each(decoded.payload, (p, cb) => {
      if (!p.prefix || !p.data) {
        cb()
      }
      const values = vd(p.prefix)
      const cidVersion = values[0]
      const multicodec = values[1]
      const hashAlg = values[2]
      // const hashLen = values[3] // We haven't need to use this so far
      multihashing(p.data, hashAlg, (err, hash) => {
        if (err) {
          return cb(err)
        }

        let cid
        try {
          cid = new CID(cidVersion, codecName[multicodec.toString('16')], hash)
        } catch (err) {
          return callback(err)
        }

        msg.addBlock(new Block(p.data, cid))
        cb()
      })
    }, (err) => {
      if (err) {
        return callback(err)
      }
      callback(null, msg)
    })
  }

  callback(null, msg)
}

BitswapMessage.Entry = Entry
module.exports = BitswapMessage
