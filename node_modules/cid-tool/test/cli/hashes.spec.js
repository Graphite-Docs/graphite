/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multihash = require('multihashes')
const CIDToolCli = require('./utils/cid-tool-cli')

describe('cli hashes', () => {
  it('should list multihash hashing algorithm names', async () => {
    const cli = CIDToolCli()
    const expectedOutput = Object.keys(multihash.names).join('\n') + '\n'
    const { stdout } = await cli('hashes')
    expect(stdout).to.equal(expectedOutput)
  })

  it('should list multihash hashing algorithm codes and names', async () => {
    const cli = CIDToolCli()
    const expectedOutput = Object.keys(multihash.names)
      .map(name => {
        const code = multihash.names[name]
        return `${code} ${name}`
      })
      .join('\n') + '\n'
    const { stdout } = await cli('hashes --numeric')
    expect(stdout).to.equal(expectedOutput)
  })
})
