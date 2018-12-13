/* eslint-env jest */

var isCircular = require('../')

describe('is-circular', function () {
  it('should error if passed a non-object', function (done) {
    expect(isCircular.bind(null, 2)).toThrow(/object/)
    done()
  })

  it('should return true for circular objects', function (done) {
    var x = {}
    x.cyclic = { a: 1, x: x }
    expect(isCircular(x)).toEqual(true)

    done()
  })

  it('should return true for circular objects', function (done) {
    var x = {}
    x.cyclic = { a: {}, x: x }
    expect(isCircular(x)).toEqual(true)

    done()
  })

  it('should return true for circular objects', function (done) {
    var x = {}
    x.cyclic = { a: {}, indirect: { x: x } }
    expect(isCircular(x)).toEqual(true)

    done()
  })

  it('should return false for non-circular objects', function (done) {
    var x = {}
    x.cyclic = { a: 1, b: 2 }
    expect(isCircular(x)).toEqual(false)

    done()
  })

  it('should return false for non-circular objects', function (done) {
    var x = {}
    var y = {}
    x.cyclic = { a: y, b: y }
    expect(isCircular(x)).toEqual(false)

    done()
  })
})
