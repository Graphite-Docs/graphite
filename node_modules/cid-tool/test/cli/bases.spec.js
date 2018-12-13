/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multibase = require('multibase')
const CIDToolCli = require('./utils/cid-tool-cli')

describe('cli bases', () => {
  it('should list multibase names', async () => {
    const cli = CIDToolCli()
    const expectedOutput = multibase.names.join('\n') + '\n'
    const { stdout } = await cli('bases')
    expect(stdout).to.equal(expectedOutput)
  })

  it('should list multibase codes and names', async () => {
    const cli = CIDToolCli()
    const expectedOutput = multibase.names
      .map((name, i) => `${multibase.codes[i]} ${name}`)
      .join('\n') + '\n'
    const { stdout } = await cli('bases --prefix')
    expect(stdout).to.equal(expectedOutput)
  })

  it('should list multibase numeric codes and names', async () => {
    const cli = CIDToolCli()
    const expectedOutput = multibase.names
      .map((name, i) => `${multibase.codes[i].charCodeAt(0)} ${name}`)
      .join('\n') + '\n'
    const { stdout } = await cli('bases --numeric')
    expect(stdout).to.equal(expectedOutput)
  })

  it('should list multibase codes, numeric codes and names', async () => {
    const cli = CIDToolCli()
    const expectedOutput = multibase.names
      .map((name, i) => `${multibase.codes[i]} ${multibase.codes[i].charCodeAt(0)} ${name}`)
      .join('\n') + '\n'
    const { stdout } = await cli('bases --prefix --numeric')
    expect(stdout).to.equal(expectedOutput)
  })
})
