/* global Y */
'use strict'

function extend (Y) {
  class YArray extends Y.utils.CustomType {
    constructor (os, _model, _content) {
      super()
      this.os = os
      this._model = _model
      // Array of all the neccessary content
      this._content = _content

      // the parent of this type
      this._parent = null
      this._deepEventHandler = new Y.utils.EventListenerHandler()

      // this._debugEvents = [] // TODO: remove!!
      this.eventHandler = new Y.utils.EventHandler((op) => {
        // this._debugEvents.push(JSON.parse(JSON.stringify(op)))
        if (op.struct === 'Insert') {
          // when using indexeddb db adapter, the op could already exist (see y-js/y-indexeddb#2)
          if (this._content.some(function (c) { return Y.utils.compareIds(c.id, op.id) })) {
            // op exists
            return
          }
          let pos
          // we check op.left only!,
          // because op.right might not be defined when this is called
          if (op.left === null) {
            pos = 0
          } else {
            pos = 1 + this._content.findIndex(function (c) {
              return Y.utils.compareIds(c.id, op.left)
            })
            if (pos <= 0) {
              throw new Error('Unexpected operation!')
            }
          }
          /* (see above for new approach)
          var _e = this._content[pos]
          // when using indexeddb db adapter, the op could already exist (see y-js/y-indexeddb#2)
          // If the algorithm works correctly, the double should always exist on the correct position (pos - the computed destination)
          if (_e != null && Y.utils.compareIds(_e.id, op.id)) {
            // is already defined
            return
          }*/
          var values
          var length
          if (op.hasOwnProperty('opContent')) {
            this._content.splice(pos, 0, {
              id: op.id,
              type: op.opContent
            })
            length = 1
            let type = this.os.getType(op.opContent)
            type._parent = this._model
            values = [type]
          } else {
            var contents = op.content.map(function (c, i) {
              return {
                id: [op.id[0], op.id[1] + i],
                val: c
              }
            })
            // insert value in _content
            // It is not possible to insert more than ~2^16 elements in an Array (see #5). We handle this case explicitly
            if (contents.length < 30000) {
              this._content.splice.apply(this._content, [pos, 0].concat(contents))
            } else {
              this._content = this._content.slice(0, pos).concat(contents).concat(this._content.slice(pos))
            }
            values = op.content
            length = op.content.length
          }
          Y.utils.bubbleEvent(this, {
            type: 'insert',
            object: this,
            index: pos,
            values: values,
            length: length
          })
        } else if (op.struct === 'Delete') {
          var i = 0 // current position in _content
          for (; i < this._content.length && op.length > 0; i++) {
            var c = this._content[i]
            if (Y.utils.inDeletionRange(op, c.id)) {
              // is in deletion range!
              var delLength
              // check how many character to delete in one flush
              for (delLength = 1;
                    delLength < op.length && i + delLength < this._content.length && Y.utils.inDeletionRange(op, this._content[i + delLength].id);
                    delLength++) {}
              // last operation that will be deleted
              c = this._content[i + delLength - 1]
              // update delete operation
              op.length -= c.id[1] - op.target[1] + 1
              op.target = [c.id[0], c.id[1] + 1]
              // apply deletion & find send event
              let content = this._content.splice(i, delLength)
              let values = content.map((c) => {
                if (c.val != null) {
                  return c.val
                } else {
                  return this.os.getType(c.type)
                }
              })
              Y.utils.bubbleEvent(this, {
                type: 'delete',
                object: this,
                index: i,
                values: values,
                _content: content,
                length: delLength
              })
              // with the fresh delete op, we can continue
              // note: we don't have to increment i, because the i-th content was deleted
              // but on the other had, the (i+delLength)-th was not in deletion range
              // So we don't do i--
            }
          }
        } else {
          throw new Error('Unexpected struct!')
        }
      })
    }
    _getPathToChild (childId) {
      return this._content.findIndex(c =>
        c.type != null && Y.utils.compareIds(c.type, childId)
      )
    }
    _destroy () {
      this.eventHandler.destroy()
      this.eventHandler = null
      this._content = null
      this._model = null
      this._parent = null
      this.os = null
    }
    get length () {
      return this._content.length
    }
    get (pos) {
      if (pos == null || typeof pos !== 'number') {
        throw new Error('pos must be a number!')
      }
      if (pos >= this._content.length) {
        return undefined
      }
      if (this._content[pos].type == null) {
        return this._content[pos].val
      } else {
        return this.os.getType(this._content[pos].type)
      }
    }
    toArray () {
      return this._content.map((x, i) => {
        if (x.type != null) {
          return this.os.getType(x.type)
        } else {
          return x.val
        }
      })
    }
    push (contents) {
      return this.insert(this._content.length, contents)
    }
    insert (pos, contents) {
      if (typeof pos !== 'number') {
        throw new Error('pos must be a number!')
      }
      if (!Array.isArray(contents)) {
        throw new Error('contents must be an Array of objects!')
      }
      if (contents.length === 0) {
        return
      }
      if (pos > this._content.length || pos < 0) {
        throw new Error('This position exceeds the range of the array!')
      }
      var mostLeft = pos === 0 ? null : this._content[pos - 1].id

      var ops = []
      var prevId = mostLeft
      for (var i = 0; i < contents.length;) {
        var op = {
          left: prevId,
          origin: prevId,
          // right: mostRight,
          // NOTE: I intentionally do not define right here, because it could be deleted
          // at the time of inserting this operation (when we get the transaction),
          // and would therefore not defined in this._content
          parent: this._model,
          struct: 'Insert'
        }
        var _content = []
        var typeDefinition
        while (i < contents.length) {
          var val = contents[i++]
          typeDefinition = Y.utils.isTypeDefinition(val)
          if (!typeDefinition) {
            _content.push(val)
          } else if (_content.length > 0) {
            i-- // come back again later
            break
          } else {
            break
          }
        }
        if (_content.length > 0) {
          // content is defined
          op.content = _content
          op.id = this.os.getNextOpId(_content.length)
        } else {
          // otherwise its a type
          var typeid = this.os.getNextOpId(1)
          this.os.createType(typeDefinition, typeid)
          op.opContent = typeid
          op.id = this.os.getNextOpId(1)
        }
        ops.push(op)
        prevId = op.id
      }
      var eventHandler = this.eventHandler
      this.os.requestTransaction(function *() {
        // now we can set the right reference.
        var mostRight
        if (mostLeft != null) {
          var ml = yield* this.getInsertionCleanEnd(mostLeft)
          mostRight = ml.right
        } else {
          mostRight = (yield* this.getOperation(ops[0].parent)).start
        }
        for (var j = 0; j < ops.length; j++) {
          var op = ops[j]
          op.right = mostRight
        }
        yield* eventHandler.awaitOps(this, this.applyCreatedOperations, [ops])
      })
      // always remember to do that after this.os.requestTransaction
      // (otherwise values might contain a undefined reference to type)
      eventHandler.awaitAndPrematurelyCall(ops)
    }
    delete (pos, length) {
      if (length == null) { length = 1 }
      if (typeof length !== 'number') {
        throw new Error('length must be a number!')
      }
      if (typeof pos !== 'number') {
        throw new Error('pos must be a number!')
      }
      if (pos + length > this._content.length || pos < 0 || length < 0) {
        throw new Error('The deletion range exceeds the range of the array!')
      }
      if (length === 0) {
        return
      }
      var eventHandler = this.eventHandler
      var dels = []
      for (var i = 0; i < length; i = i + delLength) {
        var targetId = this._content[pos + i].id
        var delLength
        // how many insertions can we delete in one deletion?
        for (delLength = 1; i + delLength < length; delLength++) {
          if (!Y.utils.compareIds(this._content[pos + i + delLength].id, [targetId[0], targetId[1] + delLength])) {
            break
          }
        }
        dels.push({
          target: targetId,
          struct: 'Delete',
          length: delLength
        })
      }
      this.os.requestTransaction(function *() {
        yield* eventHandler.awaitOps(this, this.applyCreatedOperations, [dels])
      })
      // always remember to do that after this.os.requestTransaction
      // (otherwise values might contain a undefined reference to type)
      eventHandler.awaitAndPrematurelyCall(dels)
    }
    observe (f) {
      this.eventHandler.addEventListener(f)
    }
    observeDeep (f) {
      this._deepEventHandler.addEventListener(f)
    }
    unobserve (f) {
      this.eventHandler.removeEventListener(f)
    }
    unobserveDeep (f) {
      this._deepEventHandler.removeEventListener(f)
    }
    * _changed (transaction, op) {
      if (!op.deleted) {
        if (op.struct === 'Insert') {
          // update left
          var l = op.left
          var left
          while (l != null) {
            left = yield* transaction.getInsertion(l)
            if (!left.deleted) {
              break
            }
            l = left.left
          }
          op.left = l
          // if op contains opContent, initialize it
          if (op.opContent != null) {
            yield* transaction.store.initType.call(transaction, op.opContent)
          }
        }
        this.eventHandler.receivedOp(op)
      }
    }
  }

  Y.extend('Array', new Y.utils.CustomTypeDefinition({
    name: 'Array',
    class: YArray,
    struct: 'List',
    initType: function * YArrayInitializer (os, model) {
      var _content = []
      var _types = []
      yield* Y.Struct.List.map.call(this, model, function (op) {
        if (op.hasOwnProperty('opContent')) {
          _content.push({
            id: op.id,
            type: op.opContent
          })
          _types.push(op.opContent)
        } else {
          op.content.forEach(function (c, i) {
            _content.push({
              id: [op.id[0], op.id[1] + i],
              val: op.content[i]
            })
          })
        }
      })
      for (var i = 0; i < _types.length; i++) {
        var type = yield* this.store.initType.call(this, _types[i])
        type._parent = model.id
      }
      return new YArray(os, model.id, _content)
    },
    createType: function YArrayCreateType (os, model) {
      return new YArray(os, model.id, [])
    }
  }))
}

module.exports = extend
if (typeof Y !== 'undefined') {
  extend(Y)
}
