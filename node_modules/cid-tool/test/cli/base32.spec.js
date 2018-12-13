/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const CIDToolCli = require('./utils/cid-tool-cli')
const TestCID = require('../fixtures/test-cid')

describe('cli base32', () => {
  it('should convert CIDs to base32', async () => {
    const cli = CIDToolCli()
    const input = Object.keys(TestCID).map(k => TestCID[k])
    const expectedOutput = input.map(() => TestCID.b32).join('\n') + '\n'
    const { stdout } = await cli(`base32 ${input.join(' ')}`)
    expect(stdout).to.equal(expectedOutput)
  })

  it('should print error for invalid CID', async () => {
    const cli = CIDToolCli()

    try {
      await cli('base32 INVALID_CID')
    } catch (err) {
      return expect(err.stderr).to.contain('invalid cid')
    }

    throw new Error('did no fail on invalid CID')
  })
})
