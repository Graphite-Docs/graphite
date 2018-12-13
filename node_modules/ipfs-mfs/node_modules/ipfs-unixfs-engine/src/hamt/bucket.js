'use strict'

const SparseArray = require('sparse-array')
const map = require('async/map')
const eachSeries = require('async/eachSeries')
const wrapHash = require('./consumable-hash')

const defaultOptions = {
  bits: 8
}

// TODO: make HAMT a generic NPM package

class Bucket {
  constructor (options, parent, posAtParent) {
    this._options = Object.assign({}, defaultOptions, options)
    this._popCount = 0
    this._parent = parent
    this._posAtParent = posAtParent

    if (!this._options.hashFn) {
      throw new Error('please define an options.hashFn')
    }

    // make sure we only wrap options.hashFn once in the whole tree
    if (!this._options.hash) {
      this._options.hash = wrapHash(this._options.hashFn)
    }
    this._children = new SparseArray()
  }

  static isBucket (o) {
    return o instanceof Bucket
  }

  put (key, value, callback) {
    this._findNewBucketAndPos(key, (err, place) => {
      if (err) {
        callback(err)
        return // early
      }

      place.bucket._putAt(place, key, value)
      callback()
    })
  }

  get (key, callback) {
    this._findChild(key, (err, child) => {
      if (err) {
        callback(err)
      } else {
        callback(null, child && child.value)
      }
    })
  }

  del (key, callback) {
    this._findPlace(key, (err, place) => {
      if (err) {
        callback(err)
        return // early
      }
      const child = place.bucket._at(place.pos)
      if (child && child.key === key) {
        place.bucket._delAt(place.pos)
      }
      callback(null)
    })
  }

  leafCount () {
    this._children.reduce((acc, child) => {
      if (child instanceof Bucket) {
        return acc + child.leafCount()
      }
      return acc + 1
    }, 0)
  }

  childrenCount () {
    return this._children.length
  }

  onlyChild (callback) {
    process.nextTick(() => callback(null, this._children.get(0)))
  }

  eachLeafSeries (iterator, callback) {
    eachSeries(
      this._children.compactArray(),
      (child, cb) => {
        if (child instanceof Bucket) {
          child.eachLeafSeries(iterator, cb)
        } else {
          iterator(child.key, child.value, cb)
        }
      },
      callback)
  }

  serialize (map, reduce) {
    // serialize to a custom non-sparse representation
    return reduce(this._children.reduce((acc, child, index) => {
      if (child) {
        if (child instanceof Bucket) {
          acc.push(child.serialize(map, reduce))
        } else {
          acc.push(map(child, index))
        }
      }
      return acc
    }, []))
  }

  asyncTransform (asyncMap, asyncReduce, callback) {
    asyncTransformBucket(this, asyncMap, asyncReduce, callback)
  }

  toJSON () {
    return this.serialize(mapNode, reduceNodes)
  }

  prettyPrint () {
    return JSON.stringify(this.toJSON(), null, '  ')
  }

  tableSize () {
    return Math.pow(2, this._options.bits)
  }

  _findChild (key, callback) {
    this._findPlace(key, (err, result) => {
      if (err) {
        callback(err)
        return // early
      }

      const child = result.bucket._at(result.pos)
      if (child && child.key === key) {
        callback(null, child)
      } else {
        callback(null, undefined)
      }
    })
  }

  _findPlace (key, callback) {
    const hashValue = this._options.hash(key)
    hashValue.take(this._options.bits, (err, index) => {
      if (err) {
        callback(err)
        return // early
      }

      const child = this._children.get(index)
      if (child instanceof Bucket) {
        child._findPlace(hashValue, callback)
      } else {
        const place = {
          bucket: this,
          pos: index,
          hash: hashValue
        }
        callback(null, place)
      }
    })
  }

  _findNewBucketAndPos (key, callback) {
    this._findPlace(key, (err, place) => {
      if (err) {
        callback(err)
        return // early
      }
      const child = place.bucket._at(place.pos)
      if (child && child.key !== key) {
        // conflict

        const bucket = new Bucket(this._options, place.bucket, place.pos)
        place.bucket._putObjectAt(place.pos, bucket)

        // put the previous value
        bucket._findPlace(child.hash, (err, newPlace) => {
          if (err) {
            callback(err)
            return // early
          }

          newPlace.bucket._putAt(newPlace, child.key, child.value)
          bucket._findNewBucketAndPos(place.hash, callback)
        })
      } else {
        // no conflict, we found the place
        callback(null, place)
      }
    })
  }

  _putAt (place, key, value) {
    this._putObjectAt(place.pos, {
      key: key,
      value: value,
      hash: place.hash
    })
  }

  _putObjectAt (pos, object) {
    if (!this._children.get(pos)) {
      this._popCount++
    }
    this._children.set(pos, object)
  }

  _delAt (pos) {
    if (this._children.get(pos)) {
      this._popCount--
    }
    this._children.unset(pos)
    this._level()
  }

  _level () {
    if (this._parent && this._popCount <= 1) {
      if (this._popCount === 1) {
        // remove myself from parent, replacing me with my only child
        const onlyChild = this._children.find(exists)
        if (!(onlyChild instanceof Bucket)) {
          const hash = onlyChild.hash
          hash.untake(this._options.bits)
          const place = {
            pos: this._posAtParent,
            hash: hash
          }
          this._parent._putAt(place, onlyChild.key, onlyChild.value)
        }
      } else {
        this._parent._delAt(this._posAtParent)
      }
    }
  }

  _at (index) {
    return this._children.get(index)
  }
}

function exists (o) {
  return Boolean(o)
}

function mapNode (node, index) {
  return node.key
}

function reduceNodes (nodes) {
  return nodes
}

function asyncTransformBucket (bucket, asyncMap, asyncReduce, callback) {
  map(
    bucket._children.compactArray(),
    (child, callback) => {
      if (child instanceof Bucket) {
        asyncTransformBucket(child, asyncMap, asyncReduce, callback)
      } else {
        asyncMap(child, (err, mappedChildren) => {
          if (err) {
            callback(err)
          } else {
            callback(null, {
              bitField: bucket._children.bitField(),
              children: mappedChildren
            })
          }
        })
      }
    },
    (err, mappedChildren) => {
      if (err) {
        callback(err)
      } else {
        asyncReduce(mappedChildren, callback)
      }
    }
  )
}

module.exports = Bucket
