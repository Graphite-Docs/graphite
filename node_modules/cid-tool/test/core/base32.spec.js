/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const CID = require('cids')
const CIDTool = require('../../')
const TestCID = require('../fixtures/test-cid')

describe('core base32', () => {
  it('should convert CIDs to base32', () => {
    const inputs = [
      TestCID.v0,
      new CID(TestCID.v0),
      new CID(TestCID.v0).buffer,
      TestCID.b32,
      new CID(TestCID.b32),
      new CID(TestCID.b32).buffer,
      TestCID.b58,
      new CID(TestCID.b58),
      new CID(TestCID.b58).buffer,
      TestCID.b64,
      new CID(TestCID.b64),
      new CID(TestCID.b64).buffer
    ]

    inputs.forEach(input => {
      expect(CIDTool.base32(input)).to.eql(TestCID.b32)
    })
  })

  it('should throw error for invalid CID', () => {
    expect(() => CIDTool.base32('INVALID_CID')).to.throw(/^invalid cid/)
  })
})
