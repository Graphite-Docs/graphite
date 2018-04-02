var SIMPLE_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var EXTEND_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-';

var Shorten = module.exports = function(redisClient, prefix) {
  this.redisClient = redisClient;
  this.prefix = prefix || 'shorten';
};

var id = Shorten.id = function(value) {
  var quotient, remainder, result = '';
  do {
    quotient = Math.floor(value / 62);
    remainder = value - quotient * 62;
    value = quotient;
    result = SIMPLE_MAP[remainder] + result;
  } while (value > 0);
  return result;
};

var idEx = Shorten.idEx = function(value) {
  var quotient, remainder, result = '';
  do {
    //this bitwise operation has bug for big value
    //quotient = value >> 6;
    quotient = Math.floor(value / 64);
    remainder = value & 0x3f;
    value = quotient;
    result = EXTEND_MAP[remainder] + result;
  } while (value > 0);
  return result;
};

Shorten.prototype = {

  nextNum: function(key, fn) {
    if (typeof fn === 'undefined') {
      fn = key;
      key = 'default';
    }
    this.redisClient.incr(this.prefix + '-id-' + key, fn)
  },

  nextId: function(key, fn) {
    if (typeof fn === 'undefined') {
      fn = key;
      key = 'default';
    }
    this.redisClient.incr(this.prefix + '-id-' + key, function(err, val) {
        if (err) {
          fn(err);
        } else {
          fn(null, id(val));
        }
      });
  },

  nextIdEx: function(key, fn) {
    if (typeof fn === 'undefined') {
      fn = key;
      key = 'default';
    }
    this.redisClient.incr(this.prefix + '-id-' + key, function(err, val) {
        if (err) {
          fn(err);
        }else {
          fn(null, idEx(val));
        }
      });
  }

};
