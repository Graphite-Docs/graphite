'use strict'

const CIDTool = require('../../')

module.exports = {
  command: 'format [cids...]',

  describe: 'Format and convert a CID in various useful ways.',

  builder: {
    format: {
      describe: `Printf style format string:

%% literal %
%b multibase name
%B multibase code
%v version string
%V version number
%c codec name
%C codec code
%h multihash name
%H multihash code
%L hash digest length
%m multihash encoded in base %b (with multibase prefix)
%M multihash encoded in base %b without multibase prefix
%d hash digest encoded in base %b (with multibase prefix)
%D hash digest encoded in base %b without multibase prefix
%s cid string encoded in base %b (1)
%S cid string encoded in base %b without multibase prefix
%P cid prefix: %v-%c-%h-%L

(1) For CID version 0 the multibase must be base58btc and no prefix is used. For Cid version 1 the multibase prefix is included.`,
      alias: 'f',
      type: 'string',
      default: '%s'
    },
    'cid-version': {
      describe: 'CID version to convert to.',
      alias: 'v',
      type: 'number'
    },
    base: {
      describe: 'Multibase to display output in.',
      alias: 'b',
      type: 'string'
    }
  },

  handler (argv) {
    const options = {
      format: argv.format,
      cidVersion: argv.cidVersion,
      base: argv.base
    }

    if (argv.cids && argv.cids.length) {
      return argv.cids.forEach(cid => console.log(CIDTool.format(cid, options)))
    }

    process.stdin.on('data', data => {
      const cid = data.toString().trim()
      console.log(CIDTool.format(cid, options))
    })
  }
}
