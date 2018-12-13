'use strict'
/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const ipldRaw = require('../src/index')
const resolver = ipldRaw.resolver
const multihash = require('multihashes')

describe('raw codec', () => {
  let testData = Buffer.from('test data')
  let testBlob

  before((done) => {
    ipldRaw.util.serialize(testData, (err, result) => {
      expect(err).to.not.exist()
      testBlob = result
      done()
    })
  })

  it('multicodec is raw', () => {
    expect(resolver.multicodec).to.equal('raw')
  })

  it('defaultHashAlg is sha2-256', () => {
    expect(resolver.defaultHashAlg).to.equal('sha2-256')
  })

  it('resolver.resolve', () => {
    resolver.resolve(testBlob, 'a/b/c/d', (err, result) => {
      expect(err).to.not.exist()
      expect(result.value.toString('hex')).to.equal(testData.toString('hex'))
      expect(result.remainderPath).to.equal('')
    })
  })

  it('resolver.tree', () => {
    resolver.tree(testBlob, {}, (err, paths) => {
      expect(err).to.not.exist()
      expect(Array.isArray(paths)).to.eql(true)
      expect(paths.length).to.eql(0)
    })
  })

  it('resolver.tree option parameter can be ignored', () => {
    resolver.tree(testBlob, (err, paths) => {
      expect(err).to.not.exist()
      expect(Array.isArray(paths)).to.eql(true)
      expect(paths.length).to.eql(0)
    })
  })
})

describe('raw util', () => {
  let rawData = Buffer.from('some raw data')

  it('serialize is noop', (done) => {
    ipldRaw.util.serialize(rawData, (err, result) => {
      expect(err).to.not.exist()
      expect(result).to.equal(rawData)
      done()
    })
  })

  it('deserialize is noop', (done) => {
    ipldRaw.util.deserialize(rawData, (err, result) => {
      expect(err).to.not.exist()
      expect(result).to.equal(rawData)
      done()
    })
  })

  it('create cid', (done) => {
    ipldRaw.util.cid(rawData, (err, cid) => {
      expect(err).to.not.exist()
      expect(cid.version).to.equal(1)
      expect(cid.codec).to.equal('raw')
      expect(cid.multihash).to.exist()
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).to.equal('sha2-256')
      done()
    })
  })

  it('create cid with hashAlg', (done) => {
    ipldRaw.util.cid(rawData, { hashAlg: 'sha2-512' }, (err, cid) => {
      expect(err).to.not.exist()
      expect(cid.version).to.equal(1)
      expect(cid.codec).to.equal('raw')
      expect(cid.multihash).to.exist()
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).to.equal('sha2-512')
      done()
    })
  })
})
