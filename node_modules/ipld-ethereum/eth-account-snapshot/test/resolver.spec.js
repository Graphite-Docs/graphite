/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const dagEthAccount = require('../index')
const resolver = dagEthAccount.resolver
const Account = require('ethereumjs-account')
const emptyCodeHash = require('../../util/emptyCodeHash')

describe('IPLD format resolver (local)', () => {
  let testBlob
  let testData = {
    nonce: new Buffer('02', 'hex'),
    balance: new Buffer('04a817c800', 'hex'),
    codeHash: emptyCodeHash,
    stateRoot: new Buffer('012304a817c80004a817c80004a817c80004a817c80004a817c80004a817c800', 'hex')
  }

  before((done) => {
    const testAccount = new Account(testData)
    dagEthAccount.util.serialize(testAccount, (err, result) => {
      if (err) return done(err)
      testBlob = result
      done()
    })
  })

  it('multicodec is eth-account-snapshot', () => {
    expect(resolver.multicodec).to.equal('eth-account-snapshot')
  })

  it('defaultHashAlg is keccak-256', () => {
    expect(resolver.defaultHashAlg).to.equal('keccak-256')
  })

  describe('resolver.resolve', () => {
    it('path within scope', () => {
      resolver.resolve(testBlob, 'nonce', (err, result) => {
        expect(err).to.not.exist
        expect(result.value.toString('hex')).to.equal(testData.nonce.toString('hex'))
      })
    })

    it('resolves empty code', () => {
      resolver.resolve(testBlob, 'code', (err, result) => {
        expect(err).to.not.exist
        expect(result.remainderPath).to.equal('')
        expect(Buffer.isBuffer(result.value)).to.equal(true)
        expect(result.value.length).to.equal(0)
      })
    })
  })

  describe('resolver.tree', () => {
    it('basic sanity test', () => {
      resolver.tree(testBlob, (err, paths) => {
        expect(err).to.not.exist
        expect(Array.isArray(paths)).to.eql(true)
      })
    })
  })
})
