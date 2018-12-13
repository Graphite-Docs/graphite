/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const async = require('async')
const Account = require('ethereumjs-account')
const Trie = require('merkle-patricia-tree')
const TrieNode = require('merkle-patricia-tree/trieNode')
const multihashing = require('multihashing-async')
const CID = require('cids')
const cidFromHash = require('../../util/cidFromHash')
const ipldEthStateTrie = require('../index')
const isExternalLink = require('../../util/isExternalLink')
const resolver = ipldEthStateTrie.resolver

describe('IPLD format resolver (local)', () => {
  // setup contract test data
  let testContract
  let testContractData = {
    balance: new Buffer('012345', 'hex'),
    codeHash: new Buffer('abcd04a817c80004a817c80004a817c80004a817c80004a817c80004a817c800', 'hex'),
    stateRoot: new Buffer('012304a817c80004a817c80004a817c80004a817c80004a817c80004a817c800', 'hex')
  }
  function prepareTestContract (done) {
    testContract = new Account(testContractData)
    done()
  }

  // setup external account test data
  let testExternalAccount
  let testExternalAccountData = {
    balance: new Buffer('abcdef', 'hex'),
    nonce: new Buffer('02', 'hex')
  }
  function prepareTestExternalAccount (done) {
    testExternalAccount = new Account(testExternalAccountData)
    done()
  }

  // setup test trie
  let trie
  let trieNodes = {}
  let dagNodes = {}
  before((done) => {
    trie = new Trie()
    async.waterfall([
      (cb) => prepareTestContract(cb),
      (cb) => prepareTestExternalAccount(cb),
      (cb) => populateTrie(trie, cb),
      (cb) => dumpTrieNonInlineNodes(trie, trieNodes, cb),
      // (cb) => logTrie(trie, cb),
      (cb) => async.mapValues(trieNodes, (node, key, cb) => {
        ipldEthStateTrie.util.serialize(node, cb)
      }, cb)
    ], (err, result) => {
      if (err) {
        return done(err)
      }
      dagNodes = result
      done()
    })
  })

  function populateTrie (trie, cb) {
    async.series([
      (cb) => trie.put(new Buffer('000a0a00', 'hex'), testExternalAccount.serialize(), cb),
      (cb) => trie.put(new Buffer('000a0a01', 'hex'), testExternalAccount.serialize(), cb),
      (cb) => trie.put(new Buffer('000a0a02', 'hex'), testExternalAccount.serialize(), cb),
      (cb) => trie.put(new Buffer('000a0b00', 'hex'), testExternalAccount.serialize(), cb),
      (cb) => trie.put(new Buffer('000b0a00', 'hex'), testContract.serialize(), cb),
      (cb) => trie.put(new Buffer('000b0b00', 'hex'), testContract.serialize(), cb),
      (cb) => trie.put(new Buffer('000c0a00', 'hex'), testContract.serialize(), cb)
    ], (err) => {
      if (err) return cb(err)
      cb()
    })
  }

  function cid (data, cb) {
    multihashing(data, 'keccak-256', (err, hash) => {
      if (err) {
        return cb(err)
      }
      const cid = new CID(1, resolver.multicodec, hash)
      cb(null, cid)
    })
  }

  it('multicodec is eth-state-trie', () => {
    expect(resolver.multicodec).to.equal('eth-state-trie')
  })

  it('defaultHashAlg is keccak-256', () => {
    expect(resolver.defaultHashAlg).to.equal('keccak-256')
  })

  describe('resolver.resolve', () => {
    it('root node resolves to branch', (done) => {
      let rootNode = dagNodes['']
      resolver.resolve(rootNode, '0/0/0/c/0/a/0/0/codeHash', (err, result) => {
        expect(err).to.not.exist()
        let trieNode = result.value
        expect(result.remainderPath).to.eql('c/0/a/0/0/codeHash')
        expect(isExternalLink(trieNode)).to.eql(true)
        cid(dagNodes['0/0/0'], (err, cid) => {
          expect(err).to.not.exist()
          expect(trieNode['/']).to.eql(cid.toBaseEncodedString())
          done()
        })
      })
    })

    it('neck node resolves down to c branch', (done) => {
      let neckNode = dagNodes['0/0/0']
      resolver.resolve(neckNode, 'c/0/a/0/0/codeHash', (err, result) => {
        expect(err).to.not.exist()
        let trieNode = result.value
        expect(result.remainderPath).to.eql('0/a/0/0/codeHash')
        expect(isExternalLink(trieNode)).to.eql(true)
        cid(dagNodes['0/0/0/c'], (err, cid) => {
          expect(err).to.not.exist()
          expect(trieNode['/']).to.eql(cid.toBaseEncodedString())
          done()
        })
      })
    })

    it('"c" branch node resolves down to account data', (done) => {
      let cBranchNode = dagNodes['0/0/0/c']
      resolver.resolve(cBranchNode, '0/a/0/0/codeHash', (err, result) => {
        expect(err).to.not.exist()
        let trieNode = result.value
        expect(result.remainderPath).to.eql('')
        expect(isExternalLink(trieNode)).to.eql(false)
        expect(Buffer.isBuffer(result.value)).to.eql(true)
        expect(result.value.toString('hex')).to.eql(testContract.codeHash.toString('hex'))
        done()
      })
    })
  })

  describe('resolver.tree', () => {
    it('"c" branch node lists account paths', (done) => {
      let cBranchNode = dagNodes['0/0/0/c']
      resolver.tree(cBranchNode, (err, childPaths) => {
        expect(err).to.not.exist()
        expect(Array.isArray(childPaths)).to.eql(true)
        childPaths.forEach((path) =>{
          expect(typeof path).to.eql('string')
        })
        expect(childPaths.length).to.eql(9)
        expect(childPaths).to.contain('0/a/0/0/balance')
        done()
      })
    })
  })
})


function dumpTrieNonInlineNodes (trie, fullNodes, cb) {
  trie._findDbNodes((nodeRef, node, key, next) => {
    fullNodes[nibbleToPath(key)] = node
    next()
  }, cb)
}

function logTrie (trie, cb) {
  trie._walkTrie(trie.root, (nodeRef, node, key, walkController) => {
    console.log('node:', nibbleToPath(key), node.type, TrieNode.isRawNode(nodeRef) ? 'raw':'hashed', 'ref:'+cidFromHash('eth-state-trie', nodeRef).toBaseEncodedString())
    var children = node.getChildren()
    if (node.type === 'leaf') {
      console.log(' + value')
    }
    children.forEach((childData, index) => {
      var keyExtension = childData[0]
      var childRef = childData[1]
      console.log(' -', nibbleToPath(keyExtension), TrieNode.isRawNode(childRef) ? 'raw':'hashed', 'ref:'+cidFromHash('eth-state-trie', childRef).toBaseEncodedString())
    })
    walkController.next()
  }, cb)
}

function nibbleToPath (data) {
  return data.map((num) => num.toString(16)).join('/')
}

function contains (array, item) {
  return array.indexOf(item) !== -1
}
