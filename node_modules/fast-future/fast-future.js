var LIMIT = process.maxTickDepth / 2 || 1000
  , factory = function () {
      var count = 0
      return function (callback) {
        if (count >= LIMIT){
          global.setImmediate(callback)
          count = 0
        } else
          process.nextTick(callback)
        count++
      }
    }

module.exports = global.setImmediate ? factory : function () { return process.nextTick }
