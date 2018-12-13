var pull = require('pull-stream')

var tape = require('tape')
var p = require('../')

tape('tests', function (t) {

  t.ok(p.isSource(pull.values([])))
  t.ok(p.isSink(pull.drain()))
  t.ok(p.isDuplex({source: pull.values([]), sink: pull.drain()}))
  t.end()

})

