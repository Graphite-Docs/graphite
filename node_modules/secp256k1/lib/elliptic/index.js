var setImmediate = require('timers').setImmediate
var objectAssign = require('object-assign')

exports.Promise = require('../promise')
var asserts = require('../asserts')
var messages = require('../messages')

//
objectAssign(exports, require('./secretkey'))
objectAssign(exports, require('./publickey'))
objectAssign(exports, require('./signature'))
objectAssign(exports, require('./sign'))
objectAssign(exports, require('./verify'))
objectAssign(exports, require('./recover'))
objectAssign(exports, require('./ecdh'))

// create async functions
var asyncFunctions = [{
  name: 'sign',
  argsCount: 3
}, {
  name: 'verify',
  argsCount: 4
}, {
  name: 'recover',
  argsCount: 4
}, {
  name: 'ecdh',
  argsCount: 3
}]

asyncFunctions.forEach(function (obj) {
  var original = exports[obj.name + 'Sync']
  var argsCount = obj.argsCount

  exports[obj.name] = function () {
    var callback = arguments[argsCount - 1]
    if (callback !== undefined) {
      asserts.checkTypeFunction(callback, messages.CALLBACK_TYPE_INVALID)
    }

    var args = new Array(argsCount - 1)
    for (var i = 0; i < args.length; ++i) {
      args[i] = arguments[i]
    }

    try {
      var value = original.apply(null, args)
      if (callback !== undefined) {
        setImmediate(callback, null, value)
      }

      return exports.Promise.resolve(value)
    } catch (err) {
      if (callback !== undefined) {
        setImmediate(callback, err)
      }

      return exports.Promise.reject(err)
    }
  }
})
