module.exports = function (max) {

  if (!max) throw Error('hashlru must have a max value, of type number, greater than 0')

  var size = 0, cache = Object.create(null), _cache = Object.create(null)

  function update (key, value) {
    cache[key] = value
    size ++
    if(size >= max) {
      size = 0
      _cache = cache
      cache = Object.create(null)
    }
  }

  return {
    has: function (key) {
      return cache[key] !== undefined || _cache[key] !== undefined
    },
    remove: function (key) {
      if(cache[key] !== undefined)
        cache[key] = undefined
      if(_cache[key] !== undefined)
        _cache[key] = undefined
    },
    get: function (key) {
      var v = cache[key]
      if(v !== undefined) return v
      if((v = _cache[key]) !== undefined) {
        update(key, v)
        return v
      }
    },
    set: function (key, value) {
      if(cache[key] !== undefined) cache[key] = value
      else update(key, value)
    },
    clear: function () {
      cache = Object.create(null)
      _cache = Object.create(null)
    }
  }
}







