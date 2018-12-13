'use strict'

const toPull = require('stream-to-pull-stream')
const through = require('pull-through')

let createRabin

module.exports = (options) => {
  if (!createRabin) {
    try {
      createRabin = require('rabin')

      if (typeof createRabin !== 'function') {
        throw new Error('createRabin was not a function')
      }
    } catch (err) {
      const error = new Error(`Rabin chunker not available, it may have failed to install or not be supported on this platform`)

      return through(function () {
        this.emit('error', error)
      })
    }
  }

  let min, max, avg
  if (options.minChunkSize && options.maxChunkSize && options.avgChunkSize) {
    avg = options.avgChunkSize
    min = options.minChunkSize
    max = options.maxChunkSize
  } else {
    avg = options.avgChunkSize
    min = avg / 3
    max = avg + (avg / 2)
  }

  const sizepow = Math.floor(Math.log2(avg))
  const rabin = createRabin({
    min: min,
    max: max,
    bits: sizepow,
    window: options.window || 16,
    polynomial: options.polynomial || '0x3DF305DFB2A805'
  })

  return toPull.duplex(rabin)
}
