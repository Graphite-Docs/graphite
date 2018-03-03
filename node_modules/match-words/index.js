/*!
 * match-words <https://github.com/jonschlinkert/match-words>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var regex = require('word-regex');

module.exports = function(str) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }
  return str.match(regex());
};
