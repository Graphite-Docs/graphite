/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multihash = require('multihashes')
const CIDTool = require('../../')

describe('core hashes', () => {
  it('should return list of multihash hashing algorithm names and codes', () => {
    const hashes = CIDTool.hashes()

    expect(Object.keys(multihash.names).every(name => {
      return hashes.find(h => h.name === name && h.code === multihash.names[name])
    })).to.be.true()
  })
})
