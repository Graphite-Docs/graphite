/* @flow */
'use strict'

const leftPad = require('left-pad')
const Key = require('interface-datastore').Key

const readme = require('./shard-readme')

// eslint-disable-next-line
/*:: import type {Datastore, Callback} from 'interface-datastore'

export interface ShardV1 {
  name: string;
  param: number;
  fun(string): string;
  toString(): string;
}
*/

const PREFIX = exports.PREFIX = '/repo/flatfs/shard/'
const SHARDING_FN = exports.SHARDING_FN = 'SHARDING'
exports.README_FN = '_README'

class Shard {
  /* :: name: string */
  /* :: param: number */
  /* :: _padding: string */

  constructor (param /* : number */) {
    this.param = param
  }

  fun (str /* : string */) /* : string */ {
    throw new Error('implement me')
  }

  toString () /* : string */ {
    return `${PREFIX}v1/${this.name}/${this.param}`
  }
}

class Prefix extends Shard {
  constructor (prefixLen /* : number */) {
    super(prefixLen)
    this._padding = leftPad('', prefixLen, '_')
    this.name = 'prefix'
  }

  fun (noslash /* : string */) /* : string */ {
    return (noslash + this._padding).slice(0, this.param)
  }
}

class Suffix extends Shard {
  constructor (suffixLen /* : number */) {
    super(suffixLen)
    this._padding = leftPad('', suffixLen, '_')
    this.name = 'suffix'
  }

  fun (noslash /* : string */) /* : string */ {
    const s = this._padding + noslash
    return s.slice(s.length - this.param)
  }
}

class NextToLast extends Shard {
  constructor (suffixLen /* : number */) {
    super(suffixLen)
    this._padding = leftPad('', suffixLen + 1, '_')
    this.name = 'next-to-last'
  }

  fun (noslash /* : string */) /* : string */ {
    const s = this._padding + noslash
    const offset = s.length - this.param - 1
    return s.slice(offset, offset + this.param)
  }
}

/**
 * Convert a given string to the matching sharding function.
 *
 * @param {string} str
 * @returns {ShardV1}
 */
function parseShardFun (str /* : string */) /* : ShardV1 */ {
  str = str.trim()

  if (str.length === 0) {
    throw new Error('empty shard string')
  }

  if (!str.startsWith(PREFIX)) {
    throw new Error(`invalid or no path prefix: ${str}`)
  }

  const parts = str.slice(PREFIX.length).split('/')
  const version = parts[0]

  if (version !== 'v1') {
    throw new Error(`expect 'v1' version, got '${version}'`)
  }

  const name = parts[1]

  if (!parts[2]) {
    throw new Error('missing param')
  }

  const param = parseInt(parts[2], 10)

  switch (name) {
    case 'prefix':
      return new Prefix(param)
    case 'suffix':
      return new Suffix(param)
    case 'next-to-last':
      return new NextToLast(param)
    default:
      throw new Error(`unkown sharding function: ${name}`)
  }
}

exports.readShardFun = (path /* : string */, store /* : Datastore<Buffer> */, callback /* : Callback<ShardV1> */) /* : void */ => {
  const key = new Key(path).child(new Key(SHARDING_FN))
  const get = typeof store.getRaw === 'function' ? store.getRaw.bind(store) : store.get.bind(store)

  get(key, (err, res) => {
    if (err) {
      return callback(err)
    }

    let shard
    try {
      shard = parseShardFun((res || '').toString().trim())
    } catch (err) {
      return callback(err)
    }

    callback(null, shard)
  })
}

exports.readme = readme
exports.parseShardFun = parseShardFun
exports.Prefix = Prefix
exports.Suffix = Suffix
exports.NextToLast = NextToLast
