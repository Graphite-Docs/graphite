/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const CIDToolCli = require('./utils/cid-tool-cli')
const TestCID = require('../fixtures/test-cid')

describe('cli format', () => {
  it('should format CID and change to CIDv1', async () => {
    const cli = CIDToolCli()
    const expectedOutput = TestCID.b58 + '\n'
    const { stdout } = await cli(`format ${TestCID.v0} --cid-version=1`)
    expect(stdout).to.equal(expectedOutput)
  })

  it('should format CID and change to base64', async () => {
    const cli = CIDToolCli()
    const expectedOutput = TestCID.b64 + '\n'
    const { stdout } = await cli(`format ${TestCID.b32} --base=base64`)
    expect(stdout).to.equal(expectedOutput)
  })

  it('should format CID and change to CIDv1 and base32', async () => {
    const cli = CIDToolCli()
    const expectedOutput = TestCID.b32 + '\n'
    const { stdout } = await cli(`format ${TestCID.v0} --cid-version=1 --base=base32`)
    expect(stdout).to.equal(expectedOutput)
  })
})
