var assert = require('assert')
var HLRU = require('../')
var lru = HLRU(2)

// set-get:
lru.set('test', 'test')

assert.equal(lru.get('test'), 'test')

// has:
assert.equal(lru.has('test'), true)
assert.equal(lru.has('blah'), false)

// update:
lru.set('test', 'test2')

assert.equal(lru.get('test'), 'test2')

// cache cycle:
lru.set('test2', 'test')

assert.equal(lru.get('test2'), 'test')

// get previous after cache cycle:
assert.equal(lru.get('test'), 'test2')

// update new cache:
lru.set('test2', 'test2')

assert.equal(lru.get('test2'), 'test2')

// object purity:
assert.equal(lru.get('constructor'), undefined)

// max validation:
assert.throws(HLRU)

// remove:
assert.equal(lru.has('test2'), true)
lru.remove('test2')
assert.equal(lru.has('test2'), false)

// clear
assert.equal(lru.has('test'), true)
lru.clear()
assert.equal(lru.has('test'), false)
