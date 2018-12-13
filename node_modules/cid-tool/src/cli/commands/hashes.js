'use strict'

const CIDTool = require('../../')

module.exports = {
  command: 'hashes',

  describe: 'List available multihash hashing algorithm names.',

  builder: {
    numeric: {
      describe: 'Display the numeric code as well as the hashing algorithm name',
      type: 'booelan',
      default: false
    }
  },

  handler (argv) {
    CIDTool.hashes().forEach(({ name, code }) => {
      if (argv.numeric) {
        console.log(`${code} ${name}`)
      } else {
        console.log(name)
      }
    })
  }
}
