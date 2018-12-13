/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const CID = require('cids')
const CIDTool = require('../../')

describe('core codecs', () => {
  it('should return list of CID codec names and codes', () => {
    const codecs = CIDTool.codecs()

    expect(Object.keys(CID.codecs).every(name => {
      return codecs.find(c => {
        return c.name === name &&
          c.code === parseInt(CID.codecs[name].toString('hex'), 16)
      })
    })).to.be.true()
  })
})
