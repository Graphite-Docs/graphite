/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const CID = require('cids')
const EthBlockHeader = require('ethereumjs-block/header')
const multihashing = require('multihashing-async')
const multihash = require('multihashes')
const waterfall = require('async/waterfall')
const asyncify = require('async/asyncify')

const ipldEthBlock = require('../index')
const isExternalLink = require('../../util/isExternalLink')
const resolver = ipldEthBlock.resolver

describe('IPLD format resolver (local)', () => {
  let testBlob
  let testEthBlock
  let testData = {
    //                            12345678901234567890123456789012
    parentHash: new Buffer('0100000000000000000000000000000000000000000000000000000000000000', 'hex'),
    uncleHash: new Buffer('0200000000000000000000000000000000000000000000000000000000000000', 'hex'),
    coinbase: new Buffer('0300000000000000000000000000000000000000', 'hex'),
    stateRoot: new Buffer('0400000000000000000000000000000000000000000000000000000000000000', 'hex'),
    transactionsTrie: new Buffer('0500000000000000000000000000000000000000000000000000000000000000', 'hex'),
    receiptTrie: new Buffer('0600000000000000000000000000000000000000000000000000000000000000', 'hex'),
    // bloom:            new Buffer('07000000000000000000000000000000', 'hex'),
    difficulty: new Buffer('0800000000000000000000000000000000000000000000000000000000000000', 'hex'),
    number: new Buffer('0900000000000000000000000000000000000000000000000000000000000000', 'hex'),
    gasLimit: new Buffer('1000000000000000000000000000000000000000000000000000000000000000', 'hex'),
    gasUsed: new Buffer('1100000000000000000000000000000000000000000000000000000000000000', 'hex'),
    timestamp: new Buffer('1200000000000000000000000000000000000000000000000000000000000000', 'hex'),
    extraData: new Buffer('1300000000000000000000000000000000000000000000000000000000000000', 'hex'),
    mixHash: new Buffer('1400000000000000000000000000000000000000000000000000000000000000', 'hex'),
    nonce: new Buffer('1500000000000000000000000000000000000000000000000000000000000000', 'hex')
  }

  before((done) => {
    testEthBlock = new EthBlockHeader(testData)

    waterfall([
      (cb) => ipldEthBlock.util.serialize(testEthBlock, cb),
      (serialized, cb) => multihashing(serialized, 'keccak-256', (err, hash) => {
        if (err) {
          return cb(err)
        }
        testBlob = serialized
        cb()
      })
    ], done)
  })

  it('multicodec is eth-block', () => {
    expect(resolver.multicodec).to.equal('eth-block')
  })

  it('defaultHashAlg is keccak-256', () => {
    expect(resolver.defaultHashAlg).to.equal('keccak-256')
  })

  it('can parse the cid', (done) => {
    ipldEthBlock.util.cid(testEthBlock, (err, cid) => {
      expect(err).not.to.exist()
      let encodedCid = cid.toBaseEncodedString()
      let reconstructedCid = new CID(encodedCid)
      expect(cid.version).to.equal(reconstructedCid.version)
      expect(cid.codec).to.equal(reconstructedCid.codec)
      expect(cid.multihash.toString('hex')).to.equal(reconstructedCid.multihash.toString('hex'))
      done()
    })
  })

  describe('resolver.resolve', () => {
    it('path within scope', () => {
      resolver.resolve(testBlob, 'number', (err, result) => {
        expect(err).not.to.exist()
        expect(result.value.toString('hex')).to.equal(testData.number.toString('hex'))
      })
    })
  })

  it('resolver.tree', () => {
    resolver.tree(testBlob, (err, paths) => {
      expect(err).not.to.exist()
      expect(Array.isArray(paths)).to.eql(true)
      expect(paths.length).to.eql(20)
      paths.forEach((path) => {
        expect(typeof path).to.eql('string')
      })
    })
  })

  describe('util', () => {
    it('should create CID, no options', (done) => {
      ipldEthBlock.util.cid(testEthBlock, (err, cid) => {
        expect(err).to.not.exist()
        expect(cid.version).to.equal(1)
        expect(cid.codec).to.equal('eth-block')
        expect(cid.multihash).to.exist()
        const mh = multihash.decode(cid.multihash)
        expect(mh.name).to.equal('keccak-256')
        done()
      })
    })

    it('should create CID, empty options', (done) => {
      ipldEthBlock.util.cid(testEthBlock, {}, (err, cid) => {
        expect(err).to.not.exist()
        expect(cid.version).to.equal(1)
        expect(cid.codec).to.equal('eth-block')
        expect(cid.multihash).to.exist()
        const mh = multihash.decode(cid.multihash)
        expect(mh.name).to.equal('keccak-256')
        done()
      })
    })

    it('should create CID, hashAlg', (done) => {
      ipldEthBlock.util.cid(testEthBlock, { hashAlg: 'keccak-512' }, (err, cid) => {
        expect(err).to.not.exist()
        expect(cid.version).to.equal(1)
        expect(cid.codec).to.equal('eth-block')
        expect(cid.multihash).to.exist()
        const mh = multihash.decode(cid.multihash)
        expect(mh.name).to.equal('keccak-512')
        done()
      })
    })
  })
})

describe('manual ancestor walking', () => {
  let ethBlock1
  let ethBlock2
  let ethBlock3
  let cid1
  let cid2
  let cid3

  before((done) => {

    waterfall([
      asyncify(() => {
        return ethBlock1 = new EthBlockHeader({
          number: 1
        })
      }),
      ipldEthBlock.util.cid,
      asyncify((cid) => { cid1 = cid }),

      asyncify(() => {
        return ethBlock2 = new EthBlockHeader({
          number: 2,
          parentHash: ethBlock1.hash()
        })
      }),
      ipldEthBlock.util.cid,
      asyncify((cid) => { cid2 = cid }),

      asyncify(() => {
        return ethBlock3 = new EthBlockHeader({
          number: 3,
          parentHash: ethBlock2.hash()
        })
      }),
      ipldEthBlock.util.cid,
      asyncify((cid) => { cid3 = cid }),
    ], done)
  })

  it('root path (same as get)', (done) => {
    ipldEthBlock.resolver._resolveFromEthObject(ethBlock1, '/', (err, result) => {
      expect(err).to.not.exist()

      ipldEthBlock.util.cid(result.value, (err, cid) => {
        expect(err).to.not.exist()
        expect(cid).to.eql(cid1)
        done()
      })
    })
  })

  it('value within 1st node scope', (done) => {
    ipldEthBlock.resolver._resolveFromEthObject(ethBlock3, 'number', (err, result) => {
      expect(err).to.not.exist()
      expect(result.remainderPath).to.eql('')
      expect(isExternalLink(result.value)).to.eql(false)
      expect(result.value.toString('hex')).to.eql('03')
      done()
    })
  })

  it('value within nested scope (1 level)', (done) => {
    ipldEthBlock.resolver._resolveFromEthObject(ethBlock3, 'parent/number', (err, result) => {
      expect(err).to.not.exist()
      expect(result.remainderPath).to.eql('number')
      expect(isExternalLink(result.value)).to.eql(true)
      expect(result.value['/']).to.eql(cid2.toBaseEncodedString())
      ipldEthBlock.resolver._resolveFromEthObject(ethBlock2, result.remainderPath, (err, result) => {
        expect(err).to.not.exist()
        expect(result.remainderPath).to.eql('')
        expect(isExternalLink(result.value)).to.eql(false)
        expect(result.value.toString('hex')).to.eql('02')
        done()
      })
    })
  })

  it('value within nested scope (1 level)', (done) => {
    ipldEthBlock.resolver._resolveFromEthObject(ethBlock3, 'parent/parent/number', (err, result) => {
      expect(err).to.not.exist()
      expect(result.remainderPath).to.eql('parent/number')
      expect(isExternalLink(result.value)).to.eql(true)
      expect(result.value['/']).to.eql(cid2.toBaseEncodedString())
      ipldEthBlock.resolver._resolveFromEthObject(ethBlock2, result.remainderPath, (err, result) => {
        expect(err).to.not.exist()
        expect(result.remainderPath).to.eql('number')
        expect(isExternalLink(result.value)).to.eql(true)
        expect(result.value['/']).to.eql(cid1.toBaseEncodedString())
        ipldEthBlock.resolver._resolveFromEthObject(ethBlock1, result.remainderPath, (err, result) => {
          expect(err).to.not.exist()
          expect(result.remainderPath).to.eql('')
          expect(isExternalLink(result.value)).to.eql(false)
          expect(result.value.toString('hex')).to.eql('01')
          done()
        })
      })
    })
  })
})


