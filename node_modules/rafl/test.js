var test = require('tape')
var raf = require('./index')

test('it works', function (assert) {
  var value
  raf(function () {
    assert.equal(value, 'defined')
    assert.end()
  })

  assert.equal(value, void 0)
  value = 'defined'
})
