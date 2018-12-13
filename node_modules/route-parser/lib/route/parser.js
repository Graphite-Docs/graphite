/**
 * @module route/parser
 */
'use strict';

/** Wrap the compiled parser with the context to create node objects */
var parser = require('./compiled-grammar').parser;
parser.yy = require('./nodes');
module.exports = parser;
