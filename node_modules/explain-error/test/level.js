var assert = require('assert')
var explain = require('../')
var le = require('level-errors')

var err = explain(new le.NotFoundError('weird'), 'could find it')
assert.ok(err.notFound, 'error should have notFound')
console.log('okay')
