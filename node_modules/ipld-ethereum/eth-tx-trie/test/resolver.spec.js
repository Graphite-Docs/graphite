/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const async = require('async')
const EthBlock = require('ethereumjs-block')
const EthTx = require('ethereumjs-tx')
const Trie = require('merkle-patricia-tree')
const ipldEthStateTrie = require('../index')
const isExternalLink = require('../../util/isExternalLink')
const resolver = ipldEthStateTrie.resolver

describe('IPLD format resolver (local)', () => {
  // setup test trie
  let ethBlock
  let trie
  let trieNodes = []
  let dagNodes
  before((done) => {
    trie = new Trie()
    async.waterfall([
      (cb) => populateTrie(cb),
      (cb) => dumpTrieDbNodes(trie, trieNodes, cb),
      (cb) => async.map(trieNodes, ipldEthStateTrie.util.serialize, cb)
    ], (err, result) => {
      if (err) return done(err)
      dagNodes = result
      done()
    })
  })

  function populateTrie (cb) {
    ethBlock = new EthBlock()
    // taken from block 0xc596cb892b649b4917da8c6b78611346d55daf7bcf4375da86a2d98810888e84
    ethBlock.transactions = [
      new EthTx({
        to: new Buffer('0c7c0b72004a7a66ffa780637427fed0c4faac47', 'hex'),
        from: new Buffer('41959417325160f8952bc933ae8317b4e5140dda', 'hex'),
        gas: new Buffer('5e1b', 'hex'),
        gasPrice: new Buffer('098bca5a00', 'hex'),
        input: null,
        nonce: new Buffer('00', 'hex'),
        value: new Buffer('44004c09e76a0000', 'hex'),
        r: new Buffer('7150d00a9dcd8a8287ad220010c52ff2608906b746de23c993999768091ff210', 'hex'),
        s: new Buffer('5585fabcd1dc415e1668d4cbc2d419cf0381bf9707480ad2f86d0800732f6d7e', 'hex'),
        v: new Buffer('1b', 'hex')
      }),
      new EthTx({
        to: new Buffer('f4702bb51b8270729db362b0d4f82a56bdd66c65', 'hex'),
        from: new Buffer('56ce1399be2831f8a3f918a0408c05bbad658ef3', 'hex'),
        gas: new Buffer('5208', 'hex'),
        gasPrice: new Buffer('04e3b29200', 'hex'),
        input: null,
        nonce: new Buffer('9d', 'hex'),
        value: new Buffer('120a871cc0020000', 'hex'),
        r: new Buffer('5d92c10b5789801d4ce0fc558eedc6e6cccbaf0105a7c1f909feabcedfe56cd9', 'hex'),
        s: new Buffer('72cc370fa5fd3b43c2ba4e9e70fea1b5e950b4261ab4274982d8ae15a3403a33', 'hex'),
        v: new Buffer('1b', 'hex')
      }),
      new EthTx({
        to: new Buffer('b8201140a49b0d5b65a23b4b2fa8a6efff87c576', 'hex'),
        from: new Buffer('1e9939daaad6924ad004c2560e90804164900341', 'hex'),
        gas: new Buffer('9858', 'hex'),
        gasPrice: new Buffer('04a817c800', 'hex'),
        input: null,
        nonce: new Buffer('022f5d', 'hex'),
        value: new Buffer('0de4ea09ac8f1e88', 'hex'),
        r: new Buffer('7ee15b226f6c767ccace78a4b5b4cbf0be6ec20a899e058d3c95977bacd0cbd5', 'hex'),
        s: new Buffer('27e75bcd3bfd199e8c3e3f0c90b0d39f01b773b3da64060e06c0d568ae5c7523', 'hex'),
        v: new Buffer('1b', 'hex')
      }),
      new EthTx({
        to: new Buffer('c4f381af25c41786110242623373cc9c7647f3f1', 'hex'),
        from: new Buffer('ea674fdde714fd979de3edf0f56aa9716b898ec8', 'hex'),
        gas: new Buffer('015f90', 'hex'),
        gasPrice: new Buffer('04a817c800', 'hex'),
        input: null,
        nonce: new Buffer('0fc02d', 'hex'),
        value: new Buffer('0e139507cd50c018', 'hex'),
        r: new Buffer('059934eeace580cc2bdc292415976692c751f0bcb025930bd40fcc31e91208f3', 'hex'),
        s: new Buffer('77ff34a10a3de0d906a0363b4bdbc0e9a06cb4378476d96dfd446225d8d9949c', 'hex'),
        v: new Buffer('1c', 'hex')
      })
    ]
    ethBlock.genTxTrie((err) => {
      if (err) return cb(err)
      trie = ethBlock.txTrie
      cb()
    })
  }

  it('multicodec is eth-tx-trie', () => {
    expect(resolver.multicodec).to.equal('eth-tx-trie')
  })

  it('defaultHashAlg is keccak-256', () => {
    expect(resolver.defaultHashAlg).to.equal('keccak-256')
  })

  describe('resolver.resolve', () => {
    it('root node resolving first tx value', (done) => {
      let rootNode = dagNodes[0]
      resolver.resolve(rootNode, '8/0/value', (err, result) => {
        expect(err).to.not.exist()
        let trieNode = result.value
        expect(result.remainderPath).to.eql('0/value')
        expect(isExternalLink(trieNode)).to.eql(true)
        done()
      })
    })

    it('"8" branch node resolves down to tx value', (done) => {
      let branchNode = dagNodes[2]
      resolver.resolve(branchNode, '0/value', (err, result) => {
        expect(err).to.not.exist()
        let trieNode = result.value
        expect(result.remainderPath).to.eql('')
        expect(isExternalLink(trieNode)).to.eql(false)
        expect(Buffer.isBuffer(result.value)).to.eql(true)
        let firstTx = ethBlock.transactions[0]
        expect(result.value.toString('hex')).to.eql(firstTx.value.toString('hex'))
        done()
      })
    })
  })

  describe('resolver.tree', () => {
    it('root has two children', (done) => {
      let rootNode = dagNodes[0]
      resolver.tree(rootNode, {}, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.eql(2)
        done()
      })
    })
  })
})

function dumpTrieDbNodes (trie, fullNodes, cb) {
  trie._findDbNodes((root, node, key, next) => {
    fullNodes.push(node)
    next()
  }, cb)
}
