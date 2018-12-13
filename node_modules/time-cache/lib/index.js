'use strict';

exports = module.exports = TimeCache;

function TimeCache(options) {
  if (!(this instanceof TimeCache)) {
    return new TimeCache(options);
  }

  options = options || {};

  var validity = options.validity || 30; // seconds

  var entries = {};

  this.put = function (key, value, validity) {
    if (!entries[key]) {
      entries[key] = {
        value: value,
        timestamp: getTimeStamp(),
        validity: validity
      };
    }
    sweep();
  };

  this.get = function (key) {
    if (entries[key]) {
      return entries[key].value;
    } else {
      throw new Error('key does not exist');
    }
  };

  this.has = function (key) {
    if (entries[key]) {
      return true;
    } else {
      return false;
    }
  };

  function sweep() {
    Object.keys(entries).map(function (key) {
      var entry = entries[key];
      var v = entry.validity || validity;
      var delta = getTimeElapsed(entry.timestamp);
      if (delta > v) {
        delete entries[key];
      }
    });
  }
}

function getTimeStamp() {
  return new Date();
}

function getTimeElapsed(prevTime) {
  var currentTime = new Date();
  var delta = currentTime.getTime() - prevTime.getTime();
  var seconds = Math.floor(delta / 1000);
  return seconds;
}