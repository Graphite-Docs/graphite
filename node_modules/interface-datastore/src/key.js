/* @flow */
'use strict'

const uuid = require('uuid/v4')
const withIs = require('class-is')

const pathSepS = '/'
const pathSepB = Buffer.from(pathSepS)
const pathSep = pathSepB[0]

/**
 * A Key represents the unique identifier of an object.
 * Our Key scheme is inspired by file systems and Google App Engine key model.
 * Keys are meant to be unique across a system. Keys are hierarchical,
 * incorporating more and more specific namespaces. Thus keys can be deemed
 * 'children' or 'ancestors' of other keys:
 * - `new Key('/Comedy')`
 * - `new Key('/Comedy/MontyPython')`
 * Also, every namespace can be parametrized to embed relevant object
 * information. For example, the Key `name` (most specific namespace) could
 * include the object type:
 * - `new Key('/Comedy/MontyPython/Actor:JohnCleese')`
 * - `new Key('/Comedy/MontyPython/Sketch:CheeseShop')`
 * - `new Key('/Comedy/MontyPython/Sketch:CheeseShop/Character:Mousebender')`
 *
 */
class Key {
  /* :: _buf: Buffer */

  constructor (s /* : string|Buffer */, clean /* : ?bool */) {
    if (typeof s === 'string') {
      this._buf = Buffer.from(s)
    } else if (Buffer.isBuffer(s)) {
      this._buf = s
    }

    if (clean == null) {
      clean = true
    }

    if (clean) {
      this.clean()
    }

    if (this._buf.length === 0 || this._buf[0] !== pathSep) {
      throw new Error(`Invalid key: ${this.toString()}`)
    }
  }

  /**
   * Convert to the string representation
   *
   * @param {string} [encoding='utf8']
   * @returns {string}
   */
  toString (encoding/* : ?buffer$Encoding */)/* : string */ {
    return this._buf.toString(encoding || 'utf8')
  }

  /**
   * Return the buffer representation of the key
   *
   * @returns {Buffer}
   */
  toBuffer () /* : Buffer */ {
    return this._buf
  }

  // waiting on https://github.com/facebook/flow/issues/2286
  // $FlowFixMe
  get [Symbol.toStringTag] () /* : string */ {
    return `[Key ${this.toString()}]`
  }

  /**
   * Constructs a key out of a namespace array.
   *
   * @param {Array<string>} list
   * @returns {Key}
   *
   * @example
   * Key.withNamespaces(['one', 'two'])
   * // => Key('/one/two')
   *
   */
  static withNamespaces (list /* : Array<string> */) /* : Key */ {
    return new _Key(list.join(pathSepS))
  }

  /**
   * Returns a randomly (uuid) generated key.
   *
   * @returns {Key}
   *
   * @example
   * Key.random()
   * // => Key('/f98719ea086343f7b71f32ea9d9d521d')
   *
   */
  static random () /* : Key */ {
    return new _Key(uuid().replace(/-/g, ''))
  }

  /**
   * Cleanup the current key
   *
   * @returns {void}
   */
  clean () {
    if (!this._buf || this._buf.length === 0) {
      this._buf = Buffer.from(pathSepS)
    }

    if (this._buf[0] !== pathSep) {
      this._buf = Buffer.concat([pathSepB, this._buf])
    }

    // normalize does not remove trailing slashes
    while (this._buf.length > 1 && this._buf[this._buf.length - 1] === pathSep) {
      this._buf = this._buf.slice(0, -1)
    }
  }

  /**
   * Check if the given key is sorted lower than ourself.
   *
   * @param {Key} key
   * @returns {bool}
   */
  less (key /* : Key */) /* : bool */ {
    const list1 = this.list()
    const list2 = key.list()

    for (let i = 0; i < list1.length; i++) {
      if (list2.length < i + 1) {
        return false
      }

      const c1 = list1[i]
      const c2 = list2[i]

      if (c1 < c2) {
        return true
      } else if (c1 > c2) {
        return false
      }
    }

    return list1.length < list2.length
  }

  /**
   * Returns the key with all parts in reversed order.
   *
   * @returns {Key}
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').reverse()
   * // => Key('/Actor:JohnCleese/MontyPython/Comedy')
   */
  reverse () /* : Key */ {
    return Key.withNamespaces(this.list().slice().reverse())
  }

  /**
   * Returns the `namespaces` making up this Key.
   *
   * @returns {Array<string>}
   */
  namespaces () /* : Array<string> */ {
    return this.list()
  }

  /** Returns the "base" namespace of this key.
   *
   * @returns {string}
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').baseNamespace()
   * // => 'Actor:JohnCleese'
   *
   */
  baseNamespace () /* : string */ {
    const ns = this.namespaces()
    return ns[ns.length - 1]
  }

  /**
   * Returns the `list` representation of this key.
   *
   * @returns {Array<string>}
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').list()
   * // => ['Comedy', 'MontyPythong', 'Actor:JohnCleese']
   *
   */
  list () /* : Array<string> */ {
    return this.toString().split(pathSepS).slice(1)
  }

  /**
   * Returns the "type" of this key (value of last namespace).
   *
   * @returns {string}
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').type()
   * // => 'Actor'
   *
   */
  type () /* : string */ {
    return namespaceType(this.baseNamespace())
  }

  /**
   * Returns the "name" of this key (field of last namespace).
   *
   * @returns {string}
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').name()
   * // => 'JohnCleese'
   */
  name () /* : string */ {
    return namespaceValue(this.baseNamespace())
  }

  /**
   * Returns an "instance" of this type key (appends value to namespace).
   *
   * @param {string} s
   * @returns {Key}
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor').instance('JohnClesse')
   * // => Key('/Comedy/MontyPython/Actor:JohnCleese')
   */
  instance (s /* : string */) /* : Key */ {
    return new _Key(this.toString() + ':' + s)
  }

  /**
   * Returns the "path" of this key (parent + type).
   *
   * @returns {Key}
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').path()
   * // => Key('/Comedy/MontyPython/Actor')
   *
   */
  path () /* : Key */ {
    let p = this.parent().toString()
    if (!p.endsWith(pathSepS)) {
      p += pathSepS
    }
    p += this.type()
    return new _Key(p)
  }

  /**
   * Returns the `parent` Key of this Key.
   *
   * @returns {Key}
   *
   * @example
   * new Key("/Comedy/MontyPython/Actor:JohnCleese").parent()
   * // => Key("/Comedy/MontyPython")
   *
   */
  parent () /* : Key */ {
    const list = this.list()
    if (list.length === 1) {
      return new _Key(pathSepS)
    }

    return new _Key(list.slice(0, -1).join(pathSepS))
  }

  /**
   * Returns the `child` Key of this Key.
   *
   * @param {Key} key
   * @returns {Key}
   *
   * @example
   * new Key('/Comedy/MontyPython').child(new Key('Actor:JohnCleese'))
   * // => Key('/Comedy/MontyPython/Actor:JohnCleese')
   *
   */
  child (key /* : Key */) /* : Key */ {
    if (this.toString() === pathSepS) {
      return key
    } else if (key.toString() === pathSepS) {
      return this
    }

    return new _Key(this.toString() + key.toString(), false)
  }

  /**
   * Returns whether this key is a prefix of `other`
   *
   * @param {Key} other
   * @returns {bool}
   *
   * @example
   * new Key('/Comedy').isAncestorOf('/Comedy/MontyPython')
   * // => true
   *
   */
  isAncestorOf (other /* : Key */) /* : bool */ {
    if (other.toString() === this.toString()) {
      return false
    }

    return other.toString().startsWith(this.toString())
  }

  /**
   * Returns whether this key is a contains another as prefix.
   *
   * @param {Key} other
   * @returns {bool}
   *
   * @example
   * new Key('/Comedy/MontyPython').isDecendantOf('/Comedy')
   * // => true
   *
   */
  isDecendantOf (other /* : Key */) /* : bool */ {
    if (other.toString() === this.toString()) {
      return false
    }

    return this.toString().startsWith(other.toString())
  }

  /**
   * Returns wether this key has only one namespace.
   *
   * @returns {bool}
   *
   */
  isTopLevel () /* : bool */ {
    return this.list().length === 1
  }
}

/**
 * The first component of a namespace. `foo` in `foo:bar`
 *
 * @param {string} ns
 * @returns {string}
 */
function namespaceType (ns /* : string */) /* : string */ {
  const parts = ns.split(':')
  if (parts.length < 2) {
    return ''
  }
  return parts.slice(0, -1).join(':')
}

/**
 * The last component of a namespace, `baz` in `foo:bar:baz`.
 *
 * @param {string} ns
 * @returns {string}
 */
function namespaceValue (ns /* : string */) /* : string */ {
  const parts = ns.split(':')
  return parts[parts.length - 1]
}

const _Key = withIs(Key, { className: 'Key', symbolName: '@ipfs/interface-datastore/key' })

module.exports = _Key
