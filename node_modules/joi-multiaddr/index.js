const Multiaddr = require('multiaddr')
const mafmt = require('mafmt')

module.exports = {
  name: 'multiaddr',
  language: {
    invalid: '{{message}}',
    fmt: 'must be in {{fmt}} format'
  },
  pre (value, state, options) {
    if (value == null) {
      return this.createError('multiaddr.invalid', { v: value, message: 'addr must be a string, Buffer, or another Multiaddr' }, state, options)
    }

    let ma

    try {
      ma = Multiaddr(value)
    } catch (err) {
      return this.createError('multiaddr.invalid', { v: value, message: err.message }, state, options)
    }

    return options.convert ? ma : value
  },
  rules: Object.keys(mafmt).map(fmt => ({
    name: fmt,
    validate (params, value, state, options) {
      return mafmt[fmt].matches(value)
        ? value
        : this.createError(`multiaddr.fmt`, { v: value, fmt }, state, options)
    }
  }))
}
