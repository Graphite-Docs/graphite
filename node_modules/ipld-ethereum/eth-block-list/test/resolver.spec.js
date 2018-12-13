/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const multihash = require('multihashes')
const RLP = require('rlp')
const EthBlock = require('ethereumjs-block')
const EthBlockFromRpc = require('ethereumjs-block/from-rpc')
const dagEthBlockList = require('../index')
const resolver = dagEthBlockList.resolver
const block97Data = require('./data/block97.json')
const ommerData0 = require('./data/ommer0.json')
const ommerData1 = require('./data/ommer1.json')

describe('IPLD format resolver (local)', () => {
  let testBlob
  let ethBlock = EthBlockFromRpc(block97Data, [ommerData0, ommerData1])

  before((done) => {
    dagEthBlockList.util.serialize(ethBlock.uncleHeaders, (err, result) => {
      if (err) return done(err)
      testBlob = result
      done()
    })
  })

  it('multicodec is eth-block-list', () => {
    expect(resolver.multicodec).to.equal('eth-block-list')
  })

  it('defaultHashAlg is keccak-256', () => {
    expect(resolver.defaultHashAlg).to.equal('keccak-256')
  })

  describe('resolver.resolve', () => {
    it('uncle #0', (done) => {
      resolver.resolve(testBlob, '0', (err, result) => {
        expect(err).to.not.exist()
        expect(result.value.hash().toString('hex')).to.equal('acfa207ce9d5139b85ecfdc197f8d283fc241f95f176f008f44aab35ef1f901f')
        expect(result.remainderPath).to.equal('')
        done()
      })
    })

    it('uncle #1', (done) => {
      resolver.resolve(testBlob, '1', (err, result) => {
        expect(err).to.not.exist()
        expect(result.value.hash().toString('hex')).to.equal('fe426f2eb0adc88f05ea737da1ebb79e03bca546563ad74bda7bffeb37ad4d6a')
        expect(result.remainderPath).to.equal('')
        done()
      })
    })

    it('uncle count', (done) => {
      resolver.resolve(testBlob, 'count', (err, result) => {
        expect(err).to.not.exist()
        expect(result.value).to.equal(2)
        expect(result.remainderPath).to.equal('')
        done()
      })
    })

    it('resolve block data off uncle #0', (done) => {
      resolver.resolve(testBlob, '0/timestamp', (err, result) => {
        expect(err).to.not.exist()
        expect(result.remainderPath.length).to.equal(0)
        expect(result.value.toString('hex')).to.equal('55ba43df')
        expect(result.remainderPath).to.equal('')
        done()
      })
    })
  })

  describe('resolver.tree', () => {
    it('returns all uncles', (done) => {
      resolver.tree(testBlob, (err, paths) => {
        expect(err).to.not.exist()
        expect(typeof paths).to.eql('object')
        expect(Array.isArray(paths)).to.eql(true)
        const expectedPaths = ethBlock.uncleHeaders.length * 21 + 1
        expect(paths.length).to.eql(expectedPaths)
        done()
      })
    })
  })

  describe('util', () => {
    it('generates correct cid', (done) => {
      dagEthBlockList.util.cid(ethBlock.uncleHeaders, (err, cid) => {
        expect(err).to.not.exist()
        expect(cid.version).to.equal(1)
        expect(cid.codec).to.equal('eth-block-list')
        const mhash = multihash.decode(cid.multihash)
        expect(mhash.name).to.equal('keccak-256')
        expect(mhash.digest.toString('hex')).to.equal(ethBlock.header.uncleHash.toString('hex'))
        done()
      })
    })

    it('should create CID, no options', (done) => {
      dagEthBlockList.util.cid(ethBlock.uncleHeaders, (err, cid) => {
        expect(err).to.not.exist()
        expect(cid.version).to.equal(1)
        expect(cid.codec).to.equal('eth-block-list')
        expect(cid.multihash).to.exist()
        const mh = multihash.decode(cid.multihash)
        expect(mh.name).to.equal('keccak-256')
        done()
      })
    })

    it('should create CID, empty options', (done) => {
      dagEthBlockList.util.cid(ethBlock.uncleHeaders, {}, (err, cid) => {
        expect(err).to.not.exist()
        expect(cid.version).to.equal(1)
        expect(cid.codec).to.equal('eth-block-list')
        expect(cid.multihash).to.exist()
        const mh = multihash.decode(cid.multihash)
        expect(mh.name).to.equal('keccak-256')
        done()
      })
    })

    it('should create CID, hashAlg', (done) => {
      dagEthBlockList.util.cid(ethBlock.uncleHeaders, { hashAlg: 'keccak-512' }, (err, cid) => {
        expect(err).to.not.exist()
        expect(cid.version).to.equal(1)
        expect(cid.codec).to.equal('eth-block-list')
        expect(cid.multihash).to.exist()
        const mh = multihash.decode(cid.multihash)
        expect(mh.name).to.equal('keccak-512')
        done()
      })
    })

  })
})
