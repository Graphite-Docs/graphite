'use strict'

module.exports = class Dir {
  constructor (props, _options) {
    this._options = _options || {}
    Object.assign(this, props)
  }
}
