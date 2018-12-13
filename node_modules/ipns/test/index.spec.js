/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const chaiBytes = require('chai-bytes')
const chaiString = require('chai-string')
const expect = chai.expect
chai.use(dirtyChai)
chai.use(chaiBytes)
chai.use(chaiString)

const ipfs = require('ipfs')
const DaemonFactory = require('ipfsd-ctl')
const crypto = require('libp2p-crypto')
const { fromB58String } = require('multihashes')

const ipns = require('../src')
const ERRORS = require('../src/errors')

const df = DaemonFactory.create({ type: 'proc', exec: ipfs })

describe('ipns', function () {
  this.timeout(20 * 1000)

  const cid = 'QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq'

  let ipfs = null
  let ipfsd = null
  let ipfsId = null
  let rsa = null

  const spawnDaemon = (cb) => {
    df.spawn({ initOptions: { bits: 512 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api

      ipfs.id((err, id) => {
        if (err) {
          return cb(err)
        }

        ipfsId = id
        cb()
      })
    })
  }

  before(function (done) {
    crypto.keys.generateKeyPair('RSA', 2048, (err, keypair) => {
      expect(err).to.not.exist()
      rsa = keypair

      spawnDaemon(done)
    })
  })

  after(function (done) {
    if (ipfsd) {
      ipfsd.stop(() => done())
    } else {
      done()
    }
  })

  it('should create an ipns record correctly', (done) => {
    const sequence = 0
    const validity = 1000000

    ipns.create(rsa, cid, sequence, validity, (err, entry) => {
      expect(err).to.not.exist()
      expect(entry).to.deep.include({
        value: cid,
        sequence: sequence
      })
      expect(entry).to.have.a.property('validity')
      expect(entry).to.have.a.property('signature')
      expect(entry).to.have.a.property('validityType')

      done()
    })
  })

  it('should be able to create a record with a fixed expiration', (done) => {
    const sequence = 0
    // 2033-05-18T03:33:20.000000000Z
    const expiration = 2000000000 * 1000000000

    ipns.createWithExpiration(rsa, cid, sequence, expiration, (err, entry) => {
      expect(err).to.not.exist()

      ipns.validate(rsa.public, entry, (err) => {
        expect(err).to.not.exist()
        expect(entry).to.have.a.property('validity')
        expect(entry.validity).to.equal('2033-05-18T03:33:20.000000000Z')
        done()
      })
    })
  })

  it('should create an ipns record and validate it correctly', (done) => {
    const sequence = 0
    const validity = 1000000

    ipns.create(rsa, cid, sequence, validity, (err, entry) => {
      expect(err).to.not.exist()

      ipns.validate(rsa.public, entry, (err) => {
        expect(err).to.not.exist()

        done()
      })
    })
  })

  it('should fail to validate a bad record', (done) => {
    const sequence = 0
    const validity = 1000000

    ipns.create(rsa, cid, sequence, validity, (err, entry) => {
      expect(err).to.not.exist()

      // corrupt the record by changing the value to random bytes
      entry.value = crypto.randomBytes(46).toString()

      ipns.validate(rsa.public, entry, (err) => {
        expect(err).to.exist()
        expect(err).to.include({
          code: ERRORS.ERR_SIGNATURE_VERIFICATION
        })

        done()
      })
    })
  })

  it('should create an ipns record with a validity of 1 nanosecond correctly and it should not be valid 1ms later', (done) => {
    const sequence = 0
    const validity = 0.00001

    ipns.create(rsa, cid, sequence, validity, (err, entry) => {
      expect(err).to.not.exist()

      setTimeout(() => {
        ipns.validate(rsa.public, entry, (err, res) => {
          expect(err).to.exist()
          done()
        })
      }, 1)
    })
  })

  it('should create an ipns record, marshal and unmarshal it, as well as validate it correctly', (done) => {
    const sequence = 0
    const validity = 1000000

    ipns.create(rsa, cid, sequence, validity, (err, entryDataCreated) => {
      expect(err).to.not.exist()

      const marshalledData = ipns.marshal(entryDataCreated)
      const unmarshalledData = ipns.unmarshal(marshalledData)

      expect(entryDataCreated.value).to.equal(unmarshalledData.value.toString())
      expect(entryDataCreated.validity).to.equal(unmarshalledData.validity.toString())
      expect(entryDataCreated.validityType).to.equal(unmarshalledData.validityType)
      expect(entryDataCreated.signature).to.equalBytes(unmarshalledData.signature)
      expect(entryDataCreated.sequence).to.equal(unmarshalledData.sequence)

      ipns.validate(rsa.public, unmarshalledData, (err, res) => {
        expect(err).to.not.exist()

        done()
      })
    })
  })

  it('should get datastore key correctly', () => {
    const datastoreKey = ipns.getLocalKey(fromB58String(ipfsId.id))

    expect(datastoreKey).to.exist()
  })

  it('should get id keys correctly', () => {
    const idKeys = ipns.getIdKeys(fromB58String(ipfsId.id))

    expect(idKeys).to.exist()
    expect(idKeys).to.have.a.property('routingPubKey')
    expect(idKeys).to.have.a.property('pkKey')
    expect(idKeys).to.have.a.property('ipnsKey')
    expect(idKeys).to.have.a.property('routingKey')
    expect(idKeys.routingPubKey).to.not.startsWith('/pk/')
    expect(idKeys.pkKey).to.not.startsWith('/pk/')
    expect(idKeys.ipnsKey).to.not.startsWith('/ipns/')
    expect(idKeys.routingKey).to.not.startsWith('/ipns/')
  })

  it('should be able to embed a public key in an ipns record', (done) => {
    const sequence = 0
    const validity = 1000000

    ipns.create(rsa, cid, sequence, validity, (err, entry) => {
      expect(err).to.not.exist()

      ipns.embedPublicKey(rsa.public, entry, (err, entry) => {
        expect(err).to.not.exist()
        expect(entry).to.deep.include({
          pubKey: rsa.public.bytes
        })
        done()
      })
    })
  })

  // It should have a public key embeded for newer ed25519 keys
  // https://github.com/ipfs/go-ipns/blob/d51115b4b14ed7fcca5472aadff0fee6772aca8c/ipns.go#L81
  // https://github.com/ipfs/go-ipns/blob/d51115b4b14ed7fcca5472aadff0fee6772aca8c/ipns_test.go
  // https://github.com/libp2p/go-libp2p-peer/blob/7f219a1e70011a258c5d3e502aef6896c60d03ce/peer.go#L80
  // IDFromEd25519PublicKey is not currently implement on js-libp2p-peer
  // https://github.com/libp2p/go-libp2p-peer/pull/30
  it.skip('should be able to extract a public key directly from the peer', (done) => {
    const sequence = 0
    const validity = 1000000

    crypto.keys.generateKeyPair('ed25519', 2048, (err, ed25519) => {
      expect(err).to.not.exist()

      ipns.create(ed25519, cid, sequence, validity, (err, entry) => {
        expect(err).to.not.exist()

        ipns.embedPublicKey(ed25519.public, entry, (err, entry) => {
          expect(err).to.not.exist()
          expect(entry).to.not.exist() // Should be null
          done()
        })
      })
    })
  })

  it('should be able to export a previously embed public key from an ipns record', (done) => {
    const sequence = 0
    const validity = 1000000

    ipns.create(rsa, cid, sequence, validity, (err, entry) => {
      expect(err).to.not.exist()

      ipns.embedPublicKey(rsa.public, entry, (err, entry) => {
        expect(err).to.not.exist()

        ipns.extractPublicKey(ipfsId, entry, (err, publicKey) => {
          expect(err).to.not.exist()
          expect(publicKey.bytes).to.equalBytes(rsa.public.bytes)
          done()
        })
      })
    })
  })

  it('should use validator.validate to validate a record', (done) => {
    const sequence = 0
    const validity = 1000000

    ipns.create(rsa, cid, sequence, validity, (err, entry) => {
      expect(err).to.not.exist()

      ipns.embedPublicKey(rsa.public, entry, (err, entry) => {
        expect(err).to.not.exist()

        const marshalledData = ipns.marshal(entry)

        ipns.validator.validate(marshalledData, ipfsId, (err, valid) => {
          expect(err).to.not.exist()
          expect(valid).to.equal(true)
          done()
        })
      })
    })
  })

  it('should use validator.validate to verify that a record is not valid', (done) => {
    const sequence = 0
    const validity = 1000000

    ipns.create(rsa, cid, sequence, validity, (err, entry) => {
      expect(err).to.not.exist()

      ipns.embedPublicKey(rsa.public, entry, (err, entry) => {
        expect(err).to.not.exist()

        // corrupt the record by changing the value to random bytes
        entry.value = crypto.randomBytes(46).toString()
        const marshalledData = ipns.marshal(entry)

        ipns.validator.validate(marshalledData, ipfsId, (err) => {
          expect(err).to.exist() // failed validation
          done()
        })
      })
    })
  })

  it('should use validator.select to select the first record because it is newer', (done) => {
    const sequence = 0
    const validity = 1000000

    ipns.create(rsa, cid, sequence, validity, (err, entry) => {
      expect(err).to.not.exist()

      ipns.create(rsa, cid, (sequence + 1), validity, (err, newEntry) => {
        expect(err).to.not.exist()

        const marshalledData = ipns.marshal(entry)
        const marshalledNewData = ipns.marshal(newEntry)

        ipns.validator.select(marshalledNewData, marshalledData, (err, valid) => {
          expect(err).to.not.exist()
          expect(valid).to.equal(0) // new data is the selected one
          done()
        })
      })
    })
  })

  it('should use validator.select to select the second record because it is newer', (done) => {
    const sequence = 0
    const validity = 1000000

    ipns.create(rsa, cid, sequence + 1, validity, (err, entry) => {
      expect(err).to.not.exist()

      ipns.create(rsa, cid, (sequence), validity, (err, newEntry) => {
        expect(err).to.not.exist()

        const marshalledData = ipns.marshal(entry)
        const marshalledNewData = ipns.marshal(newEntry)

        ipns.validator.select(marshalledNewData, marshalledData, (err, valid) => {
          expect(err).to.not.exist()
          expect(valid).to.equal(1) // old data is the selected one
          done()
        })
      })
    })
  })
})
