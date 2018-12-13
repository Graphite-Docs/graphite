
module.exports = function () {

  var buffers = [], length = 0

  //just used for debugging...
  function calcLength () {
    return buffers.reduce(function (a, b) {
      return a + b.length
    }, 0)
  }

  return {
    length: length,
    data: this,
    add: function (data) {
      if(!Buffer.isBuffer(data))
        throw new Error('data must be a buffer, was: ' + JSON.stringify(data))
      this.length = length = length + data.length
      buffers.push(data)
      return this
    },
    has: function (n) {
      if(null == n) return length > 0
      return length >= n
    },
    get: function (n) {
      var _length
      if(n == null || n === length) {
        length = 0
        var _buffers = buffers
        buffers = []
        if(_buffers.length == 1)
          return _buffers[0]
        else
          return Buffer.concat(_buffers)
      } else if (buffers.length > 1 && n <= (_length = buffers[0].length)) {
        var buf = buffers[0].slice(0, n)
        if(n === _length) {
          buffers.shift()
        }
        else {
          buffers[0] = buffers[0].slice(n, _length)
        }
        length -= n
        return buf
      }  else if(n < length) {
        var out = [], len = 0

        while((len + buffers[0].length) < n) {
          var b = buffers.shift()
          len += b.length
          out.push(b)
        }

        if(len < n) {
          out.push(buffers[0].slice(0, n - len))
          buffers[0] = buffers[0].slice(n - len, buffers[0].length)
          this.length = length = length - n
        }
        return Buffer.concat(out)
      }
      else
        throw new Error('could not get ' + n + ' bytes')
    }
  }

}





