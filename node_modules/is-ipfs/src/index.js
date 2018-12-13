'use strict'

const base58 = require('bs58')
const multihash = require('multihashes')
const multibase = require('multibase')
const CID = require('cids')

const urlPattern = /^https?:\/\/[^/]+\/(ip(f|n)s)\/((\w+).*)/
const pathPattern = /^\/(ip(f|n)s)\/((\w+).*)/
const defaultProtocolMatch = 1
const defaultHashMath = 4

const fqdnPattern = /^https?:\/\/([^/]+)\.(ip(?:f|n)s)\.[^/]+/
const fqdnHashMatch = 1
const fqdnProtocolMatch = 2

function isMultihash (hash) {
  const formatted = convertToString(hash)
  try {
    const buffer = Buffer.from(base58.decode(formatted))
    multihash.decode(buffer)
    return true
  } catch (e) {
    return false
  }
}

function isMultibase (hash) {
  try {
    return multibase.isEncoded(hash)
  } catch (e) {
    return false
  }
}

function isCID (hash) {
  try {
    return CID.isCID(new CID(hash))
  } catch (e) {
    return false
  }
}

function isIpfs (input, pattern, protocolMatch = defaultProtocolMatch, hashMatch = defaultHashMath) {
  const formatted = convertToString(input)
  if (!formatted) {
    return false
  }

  const match = formatted.match(pattern)
  if (!match) {
    return false
  }

  if (match[protocolMatch] !== 'ipfs') {
    return false
  }

  let hash = match[hashMatch]

  if (hash && pattern === fqdnPattern) {
    // when doing checks for subdomain context
    // ensure hash is case-insensitive
    // (browsers force-lowercase authority compotent anyway)
    hash = hash.toLowerCase()
  }

  return isCID(hash)
}

function isIpns (input, pattern, protocolMatch = defaultProtocolMatch, hashMatch) {
  const formatted = convertToString(input)
  if (!formatted) {
    return false
  }
  const match = formatted.match(pattern)
  if (!match) {
    return false
  }

  if (match[protocolMatch] !== 'ipns') {
    return false
  }

  if (hashMatch && pattern === fqdnPattern) {
    let hash = match[hashMatch]
    // when doing checks for subdomain context
    // ensure hash is case-insensitive
    // (browsers force-lowercase authority compotent anyway)
    hash = hash.toLowerCase()
    return isCID(hash)
  }

  return true
}

function convertToString (input) {
  if (Buffer.isBuffer(input)) {
    return base58.encode(input)
  }

  if (typeof input === 'string') {
    return input
  }

  return false
}

const ipfsSubdomain = (url) => isIpfs(url, fqdnPattern, fqdnProtocolMatch, fqdnHashMatch)
const ipnsSubdomain = (url) => isIpns(url, fqdnPattern, fqdnProtocolMatch, fqdnHashMatch)

module.exports = {
  multihash: isMultihash,
  cid: isCID,
  base32cid: (cid) => (isMultibase(cid) === 'base32' && isCID(cid)),
  ipfsSubdomain: ipfsSubdomain,
  ipnsSubdomain: ipnsSubdomain,
  subdomain: (url) => (ipfsSubdomain(url) || ipnsSubdomain(url)),
  subdomainPattern: fqdnPattern,
  ipfsUrl: (url) => isIpfs(url, urlPattern),
  ipnsUrl: (url) => isIpns(url, urlPattern),
  url: (url) => (isIpfs(url, urlPattern) || isIpns(url, urlPattern)),
  urlPattern: urlPattern,
  ipfsPath: (path) => isIpfs(path, pathPattern),
  ipnsPath: (path) => isIpns(path, pathPattern),
  path: (path) => (isIpfs(path, pathPattern) || isIpns(path, pathPattern)),
  pathPattern: pathPattern,
  urlOrPath: (x) => (isIpfs(x, urlPattern) || isIpns(x, urlPattern) || isIpfs(x, pathPattern) || isIpns(x, pathPattern))
}
