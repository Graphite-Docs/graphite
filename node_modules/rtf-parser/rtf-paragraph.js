'use strict'

class RTFParagraph {
  constructor (opts) {
    if (!opts) opts = {}
    this.style = opts.style || {}
    this.content = []
  }
}

module.exports = RTFParagraph
