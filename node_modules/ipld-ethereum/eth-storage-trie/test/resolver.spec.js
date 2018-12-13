/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const async = require('async')
const Trie = require('merkle-patricia-tree')
const TrieNode = require('merkle-patricia-tree/trieNode')
const ipldEthStateTrie = require('../index')
const isExternalLink = require('../../util/isExternalLink')
const resolver = ipldEthStateTrie.resolver

describe('IPLD format resolver (local)', () => {
  // setup test trie
  let trie
  let trieNodes = []
  let dagNodes
  before((done) => {
    trie = new Trie()
    async.waterfall([
      (cb) => populateTrie(trie, cb),
      (cb) => dumpTrieNonInlineNodes(trie, trieNodes, cb),
      (cb) => async.map(trieNodes, ipldEthStateTrie.util.serialize, cb)
    ], (err, result) => {
      if (err) return done(err)
      dagNodes = result
      done()
    })
  })

  function populateTrie (trie, cb) {
    async.series([
      (cb) => trie.put(new Buffer('000a0a00', 'hex'), new Buffer('cafe01', 'hex'), cb),
      (cb) => trie.put(new Buffer('000a0a01', 'hex'), new Buffer('cafe02', 'hex'), cb),
      (cb) => trie.put(new Buffer('000a0a02', 'hex'), new Buffer('cafe03', 'hex'), cb),
      (cb) => trie.put(new Buffer('000a0b00', 'hex'), new Buffer('cafe04', 'hex'), cb),
      (cb) => trie.put(new Buffer('000b0a00', 'hex'), new Buffer('cafe05', 'hex'), cb),
      (cb) => trie.put(new Buffer('000b0b00', 'hex'), new Buffer('cafe06', 'hex'), cb),
      (cb) => trie.put(new Buffer('000c0a00', 'hex'), new Buffer('cafe07', 'hex'), cb)
    ], (err) => {
      if (err) return cb(err)
      cb()
    })
  }

  // function logTrie(cb){
  //   async.each(dagNodes, (node, next) => {
  //     let index = dagNodes.indexOf(node)
  //     let trieNode = trieNodes[index]
  //     resolver.tree(node, (err, paths) => {
  //       if (err) return next(err)
  //       let cidForHash = require('ipld-eth-trie/src/common').cidForHash
  //       let cid = cidForHash('eth-storage-trie', trieNode.hash())
  //       console.log(index, paths.map(path => path.path), cid.toBaseEncodedString())
  //       next()
  //     })
  //   }, cb)
  // }

  it('multicodec is eth-storage-trie', () => {
    expect(resolver.multicodec).to.equal('eth-storage-trie')
  })

  it('defaultHashAlg is keccak-256', () => {
    expect(resolver.defaultHashAlg).to.equal('keccak-256')
  })

  describe('resolver.resolve', () => {
    it('root node resolves to neck', (done) => {
      let rootNode = dagNodes[0]
      resolver.resolve(rootNode, '0/0/0/c/0/a/0/0/', (err, result) => {
        expect(err).to.not.exist()
        let trieNode = result.value
        expect(result.remainderPath).to.eql('c/0/a/0/0/')
        expect(isExternalLink(trieNode)).to.eql(true)
        done()
      })
    })

    it('neck node resolves "c" down to buffer', (done) => {
      let node = dagNodes[1]
      resolver.resolve(node, 'c/0/a/0/0/', (err, result) => {
        expect(err).to.not.exist()
        let trieNode = result.value
        expect(result.remainderPath).to.eql('')
        expect(isExternalLink(trieNode)).to.eql(false)
        expect(Buffer.isBuffer(result.value)).to.eql(true)
        done()
      })
    })

    it('neck node resolves "b" down to branch', (done) => {
      let node = dagNodes[1]
      resolver.resolve(node, 'b/0/a/0/0/', (err, result) => {
        expect(err).to.not.exist()
        let trieNode = result.value
        expect(result.remainderPath).to.eql('0/a/0/0/')
        expect(isExternalLink(trieNode)).to.eql(true)
        done()
      })
    })

    it('neck node resolves "a" down to branch', (done) => {
      let node = dagNodes[1]
      resolver.resolve(node, 'a/0/a/0/0/', (err, result) => {
        expect(err).to.not.exist()
        let trieNode = result.value
        expect(result.remainderPath).to.eql('0/a/0/0/')
        expect(isExternalLink(trieNode)).to.eql(true)
        done()
      })
    })
  })
})

function dumpTrieNonInlineNodes (trie, fullNodes, cb) {
  trie._findDbNodes((nodeRef, node, key, next) => {
    fullNodes.push(node)
    next()
  }, cb)
}

function contains (array, item) {
  return array.indexOf(item) !== -1
}
