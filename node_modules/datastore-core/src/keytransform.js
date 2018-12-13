/* @flow */
'use strict'

const pull = require('pull-stream')

/* ::
import type {Key, Datastore, Batch, Query, QueryResult, Callback} from 'interface-datastore'
*/

/**
 * An object with a pair of functions for (invertibly) transforming keys
 */
/* ::
type KeyTransform = {
  convert: KeyMapping,
  invert: KeyMapping
}
*/

/**
 * Map one key onto another key.
 */
/* ::
type KeyMapping = (Key) => Key
*/

/**
 * A datastore shim, that wraps around a given datastore, changing
 * the way keys look to the user, for example namespacing
 * keys, reversing them, etc.
 */
class KeyTransformDatastore /* :: <Value> */ {
  /* :: child: Datastore<Value> */
  /* :: transform: KeyTransform */

  constructor (child /* : Datastore<Value> */, transform /* : KeyTransform */) {
    this.child = child
    this.transform = transform
  }

  open (callback /* : Callback<void> */) /* : void */ {
    this.child.open(callback)
  }

  put (key /* : Key */, val /* : Value */, callback /* : Callback<void> */) /* : void */ {
    this.child.put(this.transform.convert(key), val, callback)
  }

  get (key /* : Key */, callback /* : Callback<Value> */) /* : void */ {
    this.child.get(this.transform.convert(key), callback)
  }

  has (key /* : Key */, callback /* : Callback<bool> */) /* : void */ {
    this.child.has(this.transform.convert(key), callback)
  }

  delete (key /* : Key */, callback /* : Callback<void> */) /* : void */ {
    this.child.delete(this.transform.convert(key), callback)
  }

  batch () /* : Batch<Value> */ {
    const b = this.child.batch()
    return {
      put: (key /* : Key */, value /* : Value */) /* : void */ => {
        b.put(this.transform.convert(key), value)
      },
      delete: (key /* : Key */) /* : void */ => {
        b.delete(this.transform.convert(key))
      },
      commit: (callback /* : Callback<void> */) /* : void */ => {
        b.commit(callback)
      }
    }
  }

  query (q /* : Query<Value> */) /* : QueryResult<Value> */ {
    return pull(
      this.child.query(q),
      pull.map(e => {
        e.key = this.transform.invert(e.key)
        return e
      })
    )
  }

  close (callback /* : Callback<void> */) /* : void */ {
    this.child.close(callback)
  }
}

module.exports = KeyTransformDatastore
