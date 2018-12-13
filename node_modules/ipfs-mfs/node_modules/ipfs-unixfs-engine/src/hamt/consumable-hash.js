'use strict'

const whilst = require('async/whilst')
const ConsumableBuffer = require('./consumable-buffer')

module.exports = function wrapHash (hashFn) {
  return function hashing (value) {
    if (value instanceof InfiniteHash) {
      // already a hash. return it
      return value
    } else {
      return new InfiniteHash(value, hashFn)
    }
  }
}

class InfiniteHash {
  constructor (value, hashFn) {
    if ((typeof value) !== 'string' && !Buffer.isBuffer(value)) {
      throw new Error('can only hash strings or buffers')
    }
    this._value = value
    this._hashFn = hashFn
    this._depth = -1
    this._availableBits = 0
    this._currentBufferIndex = 0
    this._buffers = []
  }

  take (bits, callback) {
    let pendingBits = bits
    whilst(
      () => this._availableBits < pendingBits,
      (callback) => {
        this._produceMoreBits(callback)
      },
      (err) => {
        if (err) {
          callback(err)
          return // early
        }

        let result = 0

        // TODO: this is sync, no need to use whilst
        whilst(
          () => pendingBits > 0,
          (callback) => {
            const hash = this._buffers[this._currentBufferIndex]
            const available = Math.min(hash.availableBits(), pendingBits)
            const took = hash.take(available)
            result = (result << available) + took
            pendingBits -= available
            this._availableBits -= available
            if (hash.availableBits() === 0) {
              this._currentBufferIndex++
            }
            callback()
          },
          (err) => {
            if (err) {
              callback(err)
              return // early
            }

            process.nextTick(() => callback(null, result))
          }
        )
      }
    )
  }

  untake (bits) {
    let pendingBits = bits
    while (pendingBits > 0) {
      const hash = this._buffers[this._currentBufferIndex]
      const availableForUntake = Math.min(hash.totalBits() - hash.availableBits(), pendingBits)
      hash.untake(availableForUntake)
      pendingBits -= availableForUntake
      this._availableBits += availableForUntake
      if (this._currentBufferIndex > 0 && hash.totalBits() === hash.availableBits()) {
        this._depth--
        this._currentBufferIndex--
      }
    }
  }

  _produceMoreBits (callback) {
    this._depth++
    const value = this._depth ? this._value + this._depth : this._value
    this._hashFn(value, (err, hashValue) => {
      if (err) {
        callback(err)
        return // early
      }

      const buffer = new ConsumableBuffer(hashValue)
      this._buffers.push(buffer)
      this._availableBits += buffer.availableBits()
      callback()
    })
  }
}
