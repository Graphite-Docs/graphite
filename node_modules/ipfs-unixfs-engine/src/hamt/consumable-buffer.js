'use strict'

const START_MASKS = [
  0b11111111,
  0b11111110,
  0b11111100,
  0b11111000,
  0b11110000,
  0b11100000,
  0b11000000,
  0b10000000
]

const STOP_MASKS = [
  0b00000001,
  0b00000011,
  0b00000111,
  0b00001111,
  0b00011111,
  0b00111111,
  0b01111111,
  0b11111111
]

module.exports = class ConsumableBuffer {
  constructor (value) {
    this._value = value
    this._currentBytePos = value.length - 1
    this._currentBitPos = 7
  }

  availableBits () {
    return this._currentBitPos + 1 + this._currentBytePos * 8
  }

  totalBits () {
    return this._value.length * 8
  }

  take (bits) {
    let pendingBits = bits
    let result = 0
    while (pendingBits && this._haveBits()) {
      const byte = this._value[this._currentBytePos]
      const availableBits = this._currentBitPos + 1
      const taking = Math.min(availableBits, pendingBits)
      const value = byteBitsToInt(byte, availableBits - taking, taking)
      result = (result << taking) + value

      pendingBits -= taking

      this._currentBitPos -= taking
      if (this._currentBitPos < 0) {
        this._currentBitPos = 7
        this._currentBytePos--
      }
    }

    return result
  }

  untake (bits) {
    this._currentBitPos += bits
    while (this._currentBitPos > 7) {
      this._currentBitPos -= 8
      this._currentBytePos += 1
    }
  }

  _haveBits () {
    return this._currentBytePos >= 0
  }
}

function byteBitsToInt (byte, start, length) {
  const mask = maskFor(start, length)
  return (byte & mask) >>> start
}

function maskFor (start, length) {
  return START_MASKS[start] & STOP_MASKS[Math.min(length + start - 1, 7)]
}
