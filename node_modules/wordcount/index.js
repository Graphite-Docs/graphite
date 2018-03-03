/*!
 * wordcount <https://github.com/jonschlinkert/wordcount>
 *
 * Copyright (c) 2014-2015 Jon Schlinkert.
 * Licensed under the MIT License
 */

'use strict';

var matches = require('match-words');

module.exports = function wordcount(str) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }
  var m = matches(str);
  if (!m) return 0;
  return m.length;
};