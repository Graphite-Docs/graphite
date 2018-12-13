'use strict'

const CIDTool = require('../../')

module.exports = {
  command: 'codecs',

  describe: 'List available CID codec names.',

  builder: {
    numeric: {
      describe: 'Display the numeric code as well as the codec name',
      type: 'booelan',
      default: false
    }
  },

  handler (argv) {
    CIDTool.codecs().forEach(({ name, code }) => {
      if (argv.numeric) {
        console.log(`${code} ${name}`)
      } else {
        console.log(name)
      }
    })
  }
}
