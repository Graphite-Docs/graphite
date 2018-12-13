var assert = require('assert');
var bessel;
describe('When using bessel functions', function() {
  before(function() {
    bessel = require('./bessel');
  });
  it('It must load besseli', function() {
    assert.equal(typeof bessel.besseli, 'function');
  });
  it('It must compute the Modified Bessel function at 1.5 with an order of 1 (0.981666)', function() {
    assert(Math.floor((bessel.besseli(1.5, 1) - 0.981666) * 10e6) < 10);
  });
  it('It must compute the Bessel function at 1.9 with an order of 2 (0.329926)', function() {
    assert(Math.floor((bessel.besselj(1.9, 2) - 0.329926) * 10e6) < 10);
  });
  it('It must compute the Modified Bessel function at 1.5 with an order of 1 (0.277388)', function() {
    assert(Math.floor((bessel.besselk(1.5, 1) - 0.277388) * 10e6) < 10);
  });
  it('It must compute Weber\'s Bessel function at 2.5 with an order of 1 (0.145918)', function() {
    assert(Math.floor((bessel.besselk(2.5, 1) - 0.981666) * 10e6) < 10);
  });
});
