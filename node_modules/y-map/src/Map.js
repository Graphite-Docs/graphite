/* global Y */
'use strict'

function extend (Y /* :any */) {
  class YMap extends Y.utils.CustomType {
    /* ::
    _model: Id;
    os: Y.AbstractDatabase;
    map: Object;
    contents: any;
    opContents: Object;
    eventHandler: Function;
    */
    constructor (os, model, contents, opContents) {
      super()
      this._model = model.id
      this._parent = null
      this._deepEventHandler = new Y.utils.EventListenerHandler()
      this.os = os
      this.map = Y.utils.copyObject(model.map)
      this.contents = contents
      this.opContents = opContents
      this.eventHandler = new Y.utils.EventHandler(op => {
        var oldValue
        // key is the name to use to access (op)content
        var key = op.struct === 'Delete' ? op.key : op.parentSub

        // compute oldValue
        if (this.opContents[key] != null) {
          oldValue = this.os.getType(this.opContents[key])
        } else {
          oldValue = this.contents[key]
        }
        // compute op event
        if (op.struct === 'Insert') {
          if (op.left === null && !Y.utils.compareIds(op.id, this.map[key])) {
            var value
            // TODO: what if op.deleted??? I partially handles this case here.. but need to send delete event instead. somehow related to #4
            if (op.opContent != null) {
              value = this.os.getType(op.opContent)
              value._parent = this._model
              delete this.contents[key]
              if (op.deleted) {
                delete this.opContents[key]
              } else {
                this.opContents[key] = op.opContent
              }
            } else {
              value = op.content[0]
              delete this.opContents[key]
              if (op.deleted) {
                delete this.contents[key]
              } else {
                this.contents[key] = op.content[0]
              }
            }
            this.map[key] = op.id
            if (oldValue === undefined) {
              Y.utils.bubbleEvent(this, {
                name: key,
                object: this,
                type: 'add',
                value: value
              })
            } else {
              Y.utils.bubbleEvent(this, {
                name: key,
                object: this,
                oldValue: oldValue,
                type: 'update',
                value: value
              })
            }
          }
        } else if (op.struct === 'Delete') {
          if (Y.utils.compareIds(this.map[key], op.target)) {
            delete this.opContents[key]
            delete this.contents[key]
            Y.utils.bubbleEvent(this, {
              name: key,
              object: this,
              oldValue: oldValue,
              type: 'delete'
            })
          }
        } else {
          throw new Error('Unexpected Operation!')
        }
      })
    }
    _getPathToChild (childId) {
      return Object.keys(this.opContents).find(key =>
        Y.utils.compareIds(this.opContents[key], childId)
      )
    }
    _destroy () {
      this.eventHandler.destroy()
      this.eventHandler = null
      this.contents = null
      this.opContents = null
      this._model = null
      this._parent = null
      this.os = null
      this.map = null
    }
    get (key) {
      // return property.
      // if property does not exist, return null
      // if property is a type, return it
      if (key == null || typeof key !== 'string') {
        throw new Error('You must specify a key (as string)!')
      }
      if (this.opContents[key] == null) {
        return this.contents[key]
      } else {
        return this.os.getType(this.opContents[key])
      }
    }
    keys () {
      return Object.keys(this.contents).concat(Object.keys(this.opContents))
    }
    keysPrimitives () {
      return Object.keys(this.contents)
    }
    keysTypes () {
      return Object.keys(this.opContents)
    }
    /*
      If there is a primitive (not a custom type), then return it.
      Returns all primitive values, if propertyName is specified!
      Note: modifying the return value could result in inconsistencies!
        -- so make sure to copy it first!
    */
    getPrimitive (key) {
      if (key == null) {
        return Y.utils.copyObject(this.contents)
      } else if (typeof key !== 'string') {
        throw new Error('Key is expected to be a string!')
      } else {
        return this.contents[key]
      }
    }
    getType (key) {
      if (key == null || typeof key !== 'string') {
        throw new Error('You must specify a key (as string)!')
      } else if (this.opContents[key] != null) {
        return this.os.getType(this.opContents[key])
      } else {
        return null
      }
    }
    delete (key) {
      var right = this.map[key]
      if (right != null) {
        var del = {
          target: right,
          struct: 'Delete'
        }
        var eventHandler = this.eventHandler
        var modDel = Y.utils.copyObject(del)
        modDel.key = key
        this.os.requestTransaction(function *() {
          yield* eventHandler.awaitOps(this, this.applyCreatedOperations, [[del]])
        })
        // always remember to do that after this.os.requestTransaction
        // (otherwise values might contain a undefined reference to type)
        eventHandler.awaitAndPrematurelyCall([modDel])
      }
    }
    set (key, value) {
      // set property.
      // if property is a type, return it
      // if not, apply immediately on this type an call event

      var right = this.map[key] || null
      var insert /* :any */ = {
        id: this.os.getNextOpId(1),
        left: null,
        right: right,
        origin: null,
        parent: this._model,
        parentSub: key,
        struct: 'Insert'
      }
      var eventHandler = this.eventHandler
      var typeDefinition = Y.utils.isTypeDefinition(value)
      if (typeDefinition !== false) {
        var type = this.os.createType(typeDefinition)
        insert.opContent = type._model
        // construct a new type
        this.os.requestTransaction(function *() {
          yield* eventHandler.awaitOps(this, this.applyCreatedOperations, [[insert]])
        })
        // always remember to do that after this.os.requestTransaction
        // (otherwise values might contain a undefined reference to type)
        eventHandler.awaitAndPrematurelyCall([insert])
        return type
      } else {
        insert.content = [value]
        this.os.requestTransaction(function * () {
          yield* eventHandler.awaitOps(this, this.applyCreatedOperations, [[insert]])
        })
        // always remember to do that after this.os.requestTransaction
        // (otherwise values might contain a undefined reference to type)
        eventHandler.awaitAndPrematurelyCall([insert])
        return value
      }
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
    /*
      Observe a path.

      E.g.
      ```
      o.set('textarea', Y.TextBind)
      o.observePath(['textarea'], function(t){
        // is called whenever textarea is replaced
        t.bind(textarea)
      })

      returns a function that removes the observer from the path.
    */
    observePath (path, f) {
      var self = this
      var propertyName
      function observeProperty (event) {
        // call f whenever path changes
        if (event.name === propertyName) {
          // call this also for delete events!
          f(self.get(propertyName))
        }
      }

      if (path.length < 1) {
        f(this)
        return function () {}
      } else if (path.length === 1) {
        propertyName = path[0]
        f(self.get(propertyName))
        this.observe(observeProperty)
        return function () {
          self.unobserve(f)
        }
      } else {
        var deleteChildObservers
        var resetObserverPath = function () {
          var map = self.get(path[0])
          if (!(map instanceof YMap)) {
            // its either not defined or a primitive value / not a map
            map = self.set(path[0], Y.Map)
          }
          deleteChildObservers = map.observePath(path.slice(1), f)
        }
        var observer = function (event) {
          if (event.name === path[0]) {
            if (deleteChildObservers != null) {
              deleteChildObservers()
            }
            if (event.type === 'add' || event.type === 'update') {
              resetObserverPath()
            }
            // TODO: what about the delete events?
          }
        }
        self.observe(observer)
        resetObserverPath()
        // returns a function that deletes all the child observers
        // and how to unobserve the observe from this object
        return function () {
          if (deleteChildObservers != null) {
            deleteChildObservers()
          }
          self.unobserve(observer)
        }
      }
    }
    * _changed (transaction, op) {
      if (op.struct === 'Delete') {
        if (op.key == null) {
          var target = yield* transaction.getOperation(op.target)
          op.key = target.parentSub
        }
      } else if (op.opContent != null) {
        yield* transaction.store.initType.call(transaction, op.opContent)
      }
      this.eventHandler.receivedOp(op)
    }
  }
  Y.extend('Map', new Y.utils.CustomTypeDefinition({
    name: 'Map',
    class: YMap,
    struct: 'Map',
    initType: function * YMapInitializer (os, model) {
      var contents = {}
      var opContents = {}
      var map = model.map
      for (var name in map) {
        var op = yield* this.getOperation(map[name])
        if (op.deleted) continue
        if (op.opContent != null) {
          opContents[name] = op.opContent
          var type = yield* this.store.initType.call(this, op.opContent)
          type._parent = model.id
        } else {
          contents[name] = op.content[0]
        }
      }
      return new YMap(os, model, contents, opContents)
    },
    createType: function YMapCreator (os, model) {
      return new YMap(os, model, {}, {})
    }
  }))
}

module.exports = extend
if (typeof Y !== 'undefined') {
  extend(Y)
}
