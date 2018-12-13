/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multibase = require('multibase')
const CIDTool = require('../../')

describe('core bases', () => {
  it('should return list of multibase names and codes', () => {
    const bases = CIDTool.bases()
    expect(multibase.names.every(name => bases.find(b => b.name === name)))
      .to.be.true()
  })
})
