'use strict'

const base32Encode = require('base32-encode')
const Big = require('big.js')
const NanoDate = require('nano-date').default
const { Key } = require('interface-datastore')
const crypto = require('libp2p-crypto')
const PeerId = require('peer-id')
const multihash = require('multihashes')

const debug = require('debug')
const log = debug('jsipns')
log.error = debug('jsipns:error')

const ipnsEntryProto = require('./pb/ipns.proto')
const { parseRFC3339 } = require('./utils')
const ERRORS = require('./errors')

const ID_MULTIHASH_CODE = multihash.names.id
/**
 * Creates a new ipns entry and signs it with the given private key.
 * The ipns entry validity should follow the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 * Note: This function does not embed the public key. If you want to do that, use `EmbedPublicKey`.
 *
 * @param {Object} privateKey private key for signing the record.
 * @param {string} value value to be stored in the record.
 * @param {number} seq number representing the current version of the record.
 * @param {string} lifetime lifetime of the record (in milliseconds).
 * @param {function(Error, entry)} [callback]
 * @return {Void}
 */
const create = (privateKey, value, seq, lifetime, callback) => {
  // Calculate eol with nanoseconds precision
  const bnLifetime = new Big(lifetime)
  const bnCurrentDate = new Big(new NanoDate())
  const bnEol = bnCurrentDate.plus(bnLifetime).times('10e+6')
  const nanoDateEol = new NanoDate(bnEol.toString())

  // Validity in ISOString with nanoseconds precision and validity type EOL
  const isoValidity = nanoDateEol.toISOStringFull()
  const validityType = ipnsEntryProto.ValidityType.EOL
  _create(privateKey, value, seq, isoValidity, validityType, callback)
}

/**
 * Same as create(), but instead of generating a new Date, it receives the intended expiration time
 * WARNING: nano precision is not standard, make sure the value in seconds is 9 orders of magnitude lesser than the one provided.
 * @param {Object} privateKey private key for signing the record.
 * @param {string} value value to be stored in the record.
 * @param {number} seq number representing the current version of the record.
 * @param {string} expiration expiration time of the record (in nanoseconds).
 * @param {function(Error, entry)} [callback]
 * @return {Void}
 */
const createWithExpiration = (privateKey, value, seq, expiration, callback) => {
  const bnExpiration = new NanoDate(new Big(expiration).toString()).toISOStringFull()
  const validityType = ipnsEntryProto.ValidityType.EOL
  _create(privateKey, value, seq, bnExpiration, validityType, callback)
}

const _create = (privateKey, value, seq, isoValidity, validityType, callback) => {
  sign(privateKey, value, validityType, isoValidity, (error, signature) => {
    if (error) {
      log.error('record signature creation failed')
      return callback(Object.assign(new Error('record signature verification failed'), { code: ERRORS.ERR_SIGNATURE_CREATION }))
    }

    const entry = {
      value: value,
      signature: signature,
      validityType: validityType,
      validity: isoValidity,
      sequence: seq
    }

    log(`ipns entry for ${value} created`)
    return callback(null, entry)
  })
}

/**
 * Validates the given ipns entry against the given public key.
 *
 * @param {Object} publicKey public key for validating the record.
 * @param {Object} entry ipns entry record.
 * @param {function(Error)} [callback]
 * @return {Void}
 */
const validate = (publicKey, entry, callback) => {
  const { value, validityType, validity } = entry
  const dataForSignature = ipnsEntryDataForSig(value, validityType, validity)

  // Validate Signature
  publicKey.verify(dataForSignature, entry.signature, (err, isValid) => {
    if (err || !isValid) {
      log.error('record signature verification failed')
      return callback(Object.assign(new Error('record signature verification failed'), { code: ERRORS.ERR_SIGNATURE_VERIFICATION }))
    }

    // Validate according to the validity type
    if (validityType === ipnsEntryProto.ValidityType.EOL) {
      let validityDate

      try {
        validityDate = parseRFC3339(validity.toString())
      } catch (e) {
        log.error('unrecognized validity format (not an rfc3339 format)')
        return callback(Object.assign(new Error('unrecognized validity format (not an rfc3339 format)'), { code: ERRORS.ERR_UNRECOGNIZED_FORMAT }))
      }

      if (validityDate < Date.now()) {
        log.error('record has expired')
        return callback(Object.assign(new Error('record has expired'), { code: ERRORS.ERR_IPNS_EXPIRED_RECORD }))
      }
    } else if (validityType) {
      log.error('unrecognized validity type')
      return callback(Object.assign(new Error('unrecognized validity type'), { code: ERRORS.ERR_UNRECOGNIZED_VALIDITY }))
    }

    log(`ipns entry for ${value} is valid`)
    return callback(null, null)
  })
}

/**
 * Embed the given public key in the given entry. While not strictly required,
 * some nodes (eg. DHT servers) may reject IPNS entries that don't embed their
 * public keys as they may not be able to validate them efficiently.
 * As a consequence of nodes needing to validade a record upon receipt, they need
 * the public key associated with it. For olde RSA keys, it is easier if we just
 * send this as part of the record itself. For newer ed25519 keys, the public key
 * can be embedded in the peerId.
 *
 * @param {Object} publicKey public key to embed.
 * @param {Object} entry ipns entry record.
 * @param {function(Error)} [callback]
 * @return {Void}
 */
const embedPublicKey = (publicKey, entry, callback) => {
  if (!publicKey || !publicKey.bytes || !entry) {
    const error = 'one or more of the provided parameters are not defined'

    log.error(error)
    return callback(Object.assign(new Error(error), { code: ERRORS.ERR_UNDEFINED_PARAMETER }))
  }

  // Create a peer id from the public key.
  PeerId.createFromPubKey(publicKey.bytes, (err, peerId) => {
    if (err) {
      log.error(err)
      return callback(Object.assign(new Error(err), { code: ERRORS.ERR_PEER_ID_FROM_PUBLIC_KEY }))
    }

    // Try to extract the public key from the ID. If we can, no need to embed it
    let extractedPublicKey
    try {
      extractedPublicKey = extractPublicKeyFromId(peerId)
    } catch (err) {
      log.error(err)
      return callback(Object.assign(new Error(err), { code: ERRORS.ERR_PUBLIC_KEY_FROM_ID }))
    }

    if (extractedPublicKey) {
      return callback(null, null)
    }

    // If we failed to extract the public key from the peer ID, embed it in the record.
    try {
      entry.pubKey = crypto.keys.marshalPublicKey(publicKey)
    } catch (err) {
      log.error(err)
      return callback(err)
    }
    callback(null, entry)
  })
}

/**
 * Extracts a public key matching `pid` from the ipns record.
 *
 * @param {Object} peerId peer identifier object.
 * @param {Object} entry ipns entry record.
 * @param {function(Error)} [callback]
 * @return {Void}
 */
const extractPublicKey = (peerId, entry, callback) => {
  if (!entry || !peerId) {
    const error = 'one or more of the provided parameters are not defined'

    log.error(error)
    return callback(Object.assign(new Error(error), { code: ERRORS.ERR_UNDEFINED_PARAMETER }))
  }

  if (entry.pubKey) {
    let pubKey
    try {
      pubKey = crypto.keys.unmarshalPublicKey(entry.pubKey)
    } catch (err) {
      log.error(err)
      return callback(err)
    }
    return callback(null, pubKey)
  }
  callback(null, peerId.pubKey)
}

// rawStdEncoding with RFC4648
const rawStdEncoding = (key) => base32Encode(key, 'RFC4648', { padding: false })

/**
 * Get key for storing the record locally.
 * Format: /ipns/${base32(<HASH>)}
 *
 * @param {Buffer} key peer identifier object.
 * @returns {string}
 */
const getLocalKey = (key) => new Key(`/ipns/${rawStdEncoding(key)}`)

/**
 * Get key for sharing the record in the routing mechanism.
 * Format: ${base32(/ipns/<HASH>)}, ${base32(/pk/<HASH>)}
 *
 * @param {Buffer} pid peer identifier represented by the multihash of the public key as Buffer.
 * @returns {Object} containing the `nameKey` and the `ipnsKey`.
 */
const getIdKeys = (pid) => {
  const pkBuffer = Buffer.from('/pk/')
  const ipnsBuffer = Buffer.from('/ipns/')

  return {
    routingPubKey: new Key(Buffer.concat([pkBuffer, pid])), // Added on https://github.com/ipfs/js-ipns/pull/8#issue-213857876 (pkKey will be deprecated in a future release)
    pkKey: new Key(rawStdEncoding(Buffer.concat([pkBuffer, pid]))),
    routingKey: new Key(Buffer.concat([ipnsBuffer, pid])), // Added on https://github.com/ipfs/js-ipns/pull/6#issue-213631461 (ipnsKey will be deprecated in a future release)
    ipnsKey: new Key(rawStdEncoding(Buffer.concat([ipnsBuffer, pid])))
  }
}

// Sign ipns record data
const sign = (privateKey, value, validityType, validity, callback) => {
  const dataForSignature = ipnsEntryDataForSig(value, validityType, validity)

  privateKey.sign(dataForSignature, (err, signature) => {
    if (err) {
      return callback(err)
    }
    return callback(null, signature)
  })
}

// Utility for getting the validity type code name of a validity
const getValidityType = (validityType) => {
  if (validityType.toString() === '0') {
    return 'EOL'
  } else {
    const error = `unrecognized validity type ${validityType.toString()}`
    log.error(error)
    throw Object.assign(new Error(error), { code: ERRORS.ERR_UNRECOGNIZED_VALIDITY })
  }
}

// Utility for creating the record data for being signed
const ipnsEntryDataForSig = (value, validityType, validity) => {
  const valueBuffer = Buffer.from(value)
  const validityTypeBuffer = Buffer.from(getValidityType(validityType))
  const validityBuffer = Buffer.from(validity)

  return Buffer.concat([valueBuffer, validityBuffer, validityTypeBuffer])
}

// Utility for extracting the public key from a peer-id
const extractPublicKeyFromId = (peerId) => {
  const decodedId = multihash.decode(peerId.id)

  if (decodedId.code !== ID_MULTIHASH_CODE) {
    return null
  }

  return crypto.keys.unmarshalPublicKey(decodedId.digest)
}

const marshal = ipnsEntryProto.encode

const unmarshal = ipnsEntryProto.decode

const validator = {
  validate: (marshalledData, peerId, callback) => {
    const receivedEntry = unmarshal(marshalledData)

    // extract public key
    extractPublicKey(peerId, receivedEntry, (err, pubKey) => {
      if (err) {
        return callback(err)
      }

      // Record validation
      validate(pubKey, receivedEntry, (err) => {
        if (err) {
          return callback(err)
        }

        callback(null, true)
      })
    })
  },
  select: (dataA, dataB, callback) => {
    const entryA = unmarshal(dataA)
    const entryB = unmarshal(dataB)

    callback(null, entryA.sequence > entryB.sequence ? 0 : 1)
  }
}

module.exports = {
  // create ipns entry record
  create,
  // create ipns entry record specifying the expiration time
  createWithExpiration,
  // validate ipns entry record
  validate,
  // embed public key in the record
  embedPublicKey,
  // extract public key from the record
  extractPublicKey,
  // get key for storing the entry locally
  getLocalKey,
  // get keys for routing
  getIdKeys,
  // marshal
  marshal,
  // unmarshal
  unmarshal,
  // validator
  validator
}
