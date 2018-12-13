'use strict'

const path = require('path')
const execa = require('execa')
const binPath = path.join(process.cwd(), 'src', 'cli', 'bin.js')

module.exports = options => {
  const config = Object.assign({}, {
    stripEof: false,
    env: Object.assign({}, process.env),
    timeout: 60 * 1000
  }, options)

  return (...args) => {
    if (args.length === 1) {
      args = args[0].split(' ')
    }
    return execa(binPath, args, config)
  }
}
