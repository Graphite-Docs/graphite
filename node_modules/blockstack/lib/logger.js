'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Logger = exports.levels = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var levels = exports.levels = ['debug', 'info', 'warn', 'error', 'none'];

var levelToInt = {};
var intToLevel = {};

for (var index = 0; index < levels.length; index++) {
  var level = levels[index];
  levelToInt[level] = index;
  intToLevel[index] = level;
}

var Logger = exports.Logger = function () {
  function Logger() {
    _classCallCheck(this, Logger);
  }

  _createClass(Logger, null, [{
    key: 'error',
    value: function error(message) {
      if (!this.shouldLog('error')) return;
      console.error(this.logMessage('error', message));
    }
  }, {
    key: 'warn',
    value: function warn(message) {
      if (!this.shouldLog('warn')) return;
      console.warn(this.logMessage('warn', message));
    }
  }, {
    key: 'info',
    value: function info(message) {
      if (!this.shouldLog('info')) return;
      console.log(this.logMessage('info', message));
    }
  }, {
    key: 'debug',
    value: function debug(message) {
      if (!this.shouldLog('debug')) return;
      console.log(this.logMessage('debug', message));
    }
  }, {
    key: 'logMessage',
    value: function logMessage(level, message) {
      return '[' + level.toUpperCase() + '] ' + message;
    }
  }, {
    key: 'shouldLog',
    value: function shouldLog(level) {
      var currentLevel = levelToInt[_config.config.logLevel];
      return currentLevel <= levelToInt[level];
    }
  }]);

  return Logger;
}();