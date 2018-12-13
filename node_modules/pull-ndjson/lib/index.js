'use strict';

var stringify = require('pull-stringify');
var split = require('pull-split');
var pull = require('pull-stream');

exports = module.exports;

exports.parse = function () {
  return pull(split('\n'), pull.filter(), pull.map(JSON.parse));
};

exports.serialize = stringify.ldjson;