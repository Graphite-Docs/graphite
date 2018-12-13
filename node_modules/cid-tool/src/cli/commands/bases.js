'use strict'

const CIDTool = require('../../')

module.exports = {
  command: 'bases',

  describe: 'List available multibase encoding names.',

  builder: {
    prefix: {
      describe: 'Display the single letter encoding codes as well as the encoding name.',
      type: 'boolean',
      default: false
    },
    numeric: {
      describe: 'Display the numeric encoding code as well as the encoding name',
      type: 'booelan',
      default: false
    }
  },

  handler (argv) {
    CIDTool.bases().forEach(({ name, code }) => {
      if (argv.prefix && argv.numeric) {
        console.log(`${code} ${code.charCodeAt(0)} ${name}`)
      } else if (argv.prefix) {
        console.log(`${code} ${name}`)
      } else if (argv.numeric) {
        console.log(`${code.charCodeAt(0)} ${name}`)
      } else {
        console.log(name)
      }
    })
  }
}
