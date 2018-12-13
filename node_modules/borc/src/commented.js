'use strict'

const stream = require('stream')
const util = require('util')
const utils = require('./utils')
const Simple = require('./simple')
const Decoder = require('./decoder')
const constants = require('./constants')
const bignumber = require('bignumber.js')

const MT = constants.MT,
      NUMBYTES = constants.NUMBYTES,
      SYMS = constants.SYMS

function plural (c) {
  if (c > 1) {
    return 's'
  } else {
    return ''
  }
}

/**
 * Generate the expanded format of RFC 7049, section 2.2.1
 *
 * @extends {stream.Transform}
 */
class Commented extends stream.Transform {
  /**
   * Create a CBOR commenter.
   *
   * @param {any} [options={}] - Stream options
   * @param {bool} [options.max_depth=10] - how many times to indent the dashes
   */
  constructor (options) {
    options = options || {}
    options.readableObjectMode = false
    options.writableObjectMode = false
    const max_depth = (options.max_depth != null) ? options.max_depth : 10
    delete options.max_depth
    super(options)

    this.depth = 1
    this.max_depth = max_depth
    this.all = new NoFilter
    this.parser = new Decoder(options)
    this.parser.on('value', this._on_value.bind(this))
    this.parser.on('start', this._on_start.bind(this))
    this.parser.on('start-string', this._on_start_string.bind(this))
    this.parser.on('stop', this._on_stop.bind(this))
    this.parser.on('more-bytes', this._on_more.bind(this))
    this.parser.on('error', this._on_error.bind(this))
    this.parser.on('data', this._on_data.bind(this))
    this.parser.bs.on('read', this._on_read.bind(this))
  }

  /**
   * @private
   */
  _transform (fresh, encoding, cb) {
    this.parser.write(fresh, encoding, function (er) {
      cb(er)
    })
  }

  /**
   * @private
   */
  _flush (cb) {
    // TODO: find the test that covers this, and look at the return value
    return this.parser._flush(cb)
  }

  /**
   * @callback commentCallback
   * @param {Error} error - if one was generated
   * @param {string} commented - the comment string
   */

  /**
   * Comment on an input Buffer or string, creating a string passed to the
   * callback.  If callback not specified, a promise is returned.
   *
   * @static
   * @param {(string|Buffer|NoFilter)} input
   * @param {(string|object|function)} options
   * @param {number} [options.max_depth=10] - how many times to indent the dashes
   * @param {commentCallback=} cb
   * @returns {Promise} if cb not specified
   */
  static comment (input, options, cb) {
    if (input == null) {
      throw new Error('input required')
    }
    let encoding = (typeof input === 'string') ? 'hex' : void 0
    let max_depth = 10
    switch (typeof options) {
      case 'function':
        cb = options
        break
      case 'string':
        encoding = options
        break
      case 'number':
        max_depth = options
        break
      case 'object':
        let ref1, ref2
        encoding = (ref1 = options.encoding) != null ? ref1 : encoding
        max_depth = (ref2 = options.max_depth) != null ? ref2 : max_depth
        break
      case 'undefined':
        break
      default:
        throw new Error('Unknown option type')
    }
    const bs = new NoFilter
    const d = new Commented({
      max_depth: max_depth
    })
    let p = null
    if (typeof cb === 'function') {
      d.on('end', function () {
        return cb(null, bs.toString('utf8'))
      })
      d.on('error', cb)
    } else {
      p = new Promise(function (resolve, reject) {
        d.on('end', function () {
          return resolve(bs.toString('utf8'))
        })
        return d.on('error', reject)
      })
    }
    d.pipe(bs)
    d.end(input, encoding)
    return p
  }

  /**
   * @private
   */
  _on_error (er) {
    return this.push('ERROR: ') &&
      this.push(er.toString()) &&
      this.push('\n')
  }

  /**
   * @private
   */
  _on_read (buf) {
    this.all.write(buf)
    const hex = buf.toString('hex')
    this.push(new Array(this.depth + 1).join('  '))
    this.push(hex)
    let ind = (this.max_depth - this.depth) * 2
    ind -= hex.length
    if (ind < 1) {
      ind = 1
    }
    this.push(new Array(ind + 1).join(' '))
    return this.push('-- ')
  }

  /**
   * @private
   */
  _on_more (mt, len, parent_mt, pos) {
    this.depth++
    let desc = ''
    switch (mt) {
      case MT.POS_INT:
        desc = 'Positive number,'
        break
      case MT.NEG_INT:
        desc = 'Negative number,'
        break
      case MT.ARRAY:
        desc = 'Array, length'
        break
      case MT.MAP:
        desc = 'Map, count'
        break
      case MT.BYTE_STRING:
        desc = 'Bytes, length'
        break
      case MT.UTF8_STRING:
        desc = 'String, length'
        break
      case MT.SIMPLE_FLOAT:
        if (len === 1) {
          desc = 'Simple value,'
        } else {
          desc = 'Float,'
        }
        break
    }
    return this.push(desc + ' next ' + len + ' byte' + (plural(len)) + '\n')
  }

  /**
   * @private
   */
  _on_start_string (mt, tag, parent_mt, pos) {
    this.depth++
    let desc = ''
    switch (mt) {
      case MT.BYTE_STRING:
        desc = 'Bytes, length: ' + tag
        break
      case MT.UTF8_STRING:
        desc = 'String, length: ' + (tag.toString())
        break
    }
    return this.push(desc + '\n')
  }

  /**
   * @private
   */
  _on_start (mt, tag, parent_mt, pos) {
    this.depth++
    if (tag !== SYMS.BREAK) {
      this.push((function () {
        switch (parent_mt) {
          case MT.ARRAY:
            return '[' + pos + '], '
          case MT.MAP:
            if (pos % 2) {
              return '{Val:' + (Math.floor(pos / 2)) + '}, '
            } else {
              return '{Key:' + (Math.floor(pos / 2)) + '}, '
            }
        }
      })())
    }
    this.push((function () {
      switch (mt) {
        case MT.TAG:
          return 'Tag #' + tag
        case MT.ARRAY:
          if (tag === SYMS.STREAM) {
            return 'Array (streaming)'
          } else {
            return 'Array, ' + tag + ' item' + (plural(tag))
          }
        case MT.MAP:
          if (tag === SYMS.STREAM) {
            return 'Map (streaming)'
          } else {
            return 'Map, ' + tag + ' pair' + (plural(tag))
          }
        case MT.BYTE_STRING:
          return 'Bytes (streaming)'
        case MT.UTF8_STRING:
          return 'String (streaming)'
      }
    })())
    return this.push('\n')
  }

  /**
   * @private
   */
  _on_stop (mt) {
    return this.depth--
  }

  /**
   * @private
   */
  _on_value (val, parent_mt, pos, ai) {
    if (val !== SYMS.BREAK) {
      this.push((function () {
        switch (parent_mt) {
          case MT.ARRAY:
            return '[' + pos + '], '
          case MT.MAP:
            if (pos % 2) {
              return '{Val:' + (Math.floor(pos / 2)) + '}, '
            } else {
              return '{Key:' + (Math.floor(pos / 2)) + '}, '
            }
        }
      })())
    }

    if (val === SYMS.BREAK) {
      this.push('BREAK\n')
    } else if (val === SYMS.NULL) {
      this.push('null\n')
    } else if (val === SYMS.UNDEFINED) {
      this.push('undefined\n')
    } else if (typeof val === 'string') {
      this.depth--
      if (val.length > 0 ) {
        this.push(JSON.stringify(val))
        this.push('\n')
      }
    } else if (Buffer.isBuffer(val)) {
      this.depth--
      if (val.length > 0) {
        this.push(val.toString('hex'))
        this.push('\n')
      }
    } else if (val instanceof bignumber) {
      this.push(val.toString())
      this.push('\n')
    } else {
      this.push(util.inspect(val))
      this.push('\n')
    }

    switch (ai) {
      case NUMBYTES.ONE:
      case NUMBYTES.TWO:
      case NUMBYTES.FOUR:
      case NUMBYTES.EIGHT:
        this.depth--
    }
  }

  /**
   * @private
   */
  _on_data () {
    this.push('0x')
    this.push(this.all.read().toString('hex'))
    return this.push('\n')
  }
}

module.exports = Commented
