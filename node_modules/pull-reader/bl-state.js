
var BufferList = require('bl')

module.exports = function () {

  var bl = new BufferList()

  function get (n) {
    var len = n == null ? bl.length : n
    var data = bl.slice(0, len)
    bl.consume(n)
    return data
  }

  return {
    data: bl,
    add: function (data) {
      bl.append(data)
      return this
    },
    has: function (n) {
      if(n == null) return bl.length > 0
      return bl.length >= n

    },
    get: function (n) {
      if(n == null) return get()
      if(!this.has(n))
        throw new Error(
          'current length is:'+bl.length
          + ', could not get:'+n + ' bytes'
        )
      return get(n)
    }
  }
}

