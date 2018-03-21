'use strict'

class RTFSpan {
  constructor (opts) {
    if (!opts) opts = {}
    this.value = opts.value
    this.style = opts.style || {}
  }
}

module.exports = RTFSpan
