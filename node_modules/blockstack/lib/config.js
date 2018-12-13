'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = undefined;

var _network = require('./network');

var _logger = require('./logger');

var config = {
  network: _network.network.defaults.MAINNET_DEFAULT,
  logLevel: _logger.levels[0]
};

exports.config = config;