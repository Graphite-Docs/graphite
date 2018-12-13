var tape = require('tape')
var distance = require('./')

tape('distance', function (t) {
  t.same(distance(new Buffer([1, 0]), new Buffer([0, 1])), new Buffer([1, 1]))
  t.same(distance(new Buffer([1, 1]), new Buffer([0, 1])), new Buffer([1, 0]))
  t.same(distance(new Buffer([1, 1]), new Buffer([1, 1])), new Buffer([0, 0]))
  t.end()
})

tape('compare', function (t) {
  t.same(distance.compare(new Buffer([0, 0]), new Buffer([0, 1])), -1)
  t.same(distance.compare(new Buffer([0, 1]), new Buffer([0, 1])), 0)
  t.same(distance.compare(new Buffer([1, 1]), new Buffer([0, 1])), 1)
  t.end()
})

tape('shorthands', function (t) {
  t.ok(distance.lt(new Buffer([0, 0]), new Buffer([0, 1])))
  t.ok(distance.eq(new Buffer([0, 1]), new Buffer([0, 1])))
  t.ok(distance.gt(new Buffer([1, 1]), new Buffer([0, 1])))
  t.end()
})
