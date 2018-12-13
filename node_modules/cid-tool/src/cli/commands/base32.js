'use strict'

const CIDTool = require('../../')

module.exports = {
  command: 'base32 [cids...]',

  describe: 'Convert CIDs to base 32 CID version 1.',

  handler (argv) {
    if (argv.cids && argv.cids.length) {
      return argv.cids.forEach(cid => console.log(CIDTool.base32(cid)))
    }

    process.stdin.on('data', data => {
      const cid = data.toString().trim()
      console.log(CIDTool.base32(cid))
    })
  }
}
