'use strict'

const CID = require('cids')
const bases = require('./bases')
const codecs = require('./codecs')
const explain = require('explain-error')
const multibase = require('multibase')
const multihash = require('multihashes')

module.exports = function format (cid, options) {
  options = options || {}

  let formatStr = options.format || '%s'

  if (formatStr === 'prefix') {
    formatStr = '%P'
  }

  if (!isString(formatStr) || formatStr.indexOf('%') === -1) {
    throw new Error(`invalid format string: ${formatStr}`)
  }

  const originalCid = cid

  try {
    cid = new CID(cid)
  } catch (err) {
    throw explain(err, `invalid cid: ${cid}`)
  }

  if (options.cidVersion != null && cid.version !== options.cidVersion) {
    if (options.cidVersion === 0) {
      cid = cid.toV0()
    } else if (options.cidVersion === 1) {
      cid = cid.toV1()
    } else {
      throw new Error(`invalid cid version: ${options.cidVersion}`)
    }
  }

  let base

  if (options.base) {
    base = options.base
  } else if (isString(originalCid)) {
    // Use base of input CID if string
    base = multibase.isEncoded(originalCid)
  }

  base = base || 'base58btc'

  // Using multibase code instead of name
  if (base.length === 1) {
    const baseNameCode = bases().find(b => b.code === base)
    if (!baseNameCode) throw new Error(`invalid multibase: ${base}`)
    base = baseNameCode.name
  }

  return formatStr.replace(/%([a-zA-Z%])/g, replacer(cid, base, options))
}

function isString (obj) {
  return Object.prototype.toString.call(obj) === '[object String]'
}

function replacer (cid, base, options) {
  return (match, specifier) => {
    switch (specifier) {
      case '%':
        return '%'
      case 'b': // base name
        return base
      case 'B': // base code
        return bases().find(b => b.name === base).code
      case 'v': // version string
        return `cidv${cid.version}`
      case 'V': // version num
        return cid.version
      case 'c': // codec name
        return cid.codec
      case 'C': // codec code
        return codecs().find(c => c.name === cid.codec).code
      case 'h': // hash fun name
        return multihash.decode(cid.multihash).name
      case 'H': // hash fun code
        return multihash.decode(cid.multihash).code
      case 'L': // hash length
        return multihash.decode(cid.multihash).length
      case 'm': // multihash encoded in base %b
        return multibase.encode(base, cid.multihash)
      case 'M': // multihash encoded in base %b without base prefix
        return multibase.encode(base, cid.multihash).slice(1)
      case 'd': // hash digest encoded in base %b
        return multibase.encode(base, multihash.decode(cid.multihash).digest)
      case 'D': // hash digest encoded in base %b without base prefix
        return multibase.encode(base, multihash.decode(cid.multihash).digest).slice(1)
      case 's': // cid string encoded in base %b
        return cid.toBaseEncodedString(base)
      case 'S': // cid string without base prefix
        return cid.version === 1
          ? cid.toBaseEncodedString(base).slice(1)
          : multibase.encode(base, cid.buffer).toString().slice(1)
      case 'P': // prefix
        return prefix(cid)
      default:
        throw new Error(`unrecognized specifier in format string: ${specifier}`)
    }
  }
}

function prefix (cid) {
  const { name, length } = multihash.decode(cid.multihash)
  return `cidv${cid.version}-${cid.codec}-${name}-${length}`
}
