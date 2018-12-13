'use strict'

const toPull = require('stream-to-pull-stream')

let createRabin

module.exports = (options) => {
  if (!createRabin) {
    try {
      createRabin = require('rabin')
    } catch (error) {
      error.message = `Rabin chunker not supported, it may have failed to install - ${error.message}`

      throw error
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
