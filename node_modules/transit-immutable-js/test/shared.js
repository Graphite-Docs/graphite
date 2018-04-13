var chai = require('chai');
var Immutable = require('immutable');

chai.use(require('chai-immutable'));
var expect = chai.expect;
exports.expect = expect;

exports.samples = Immutable.Map({

  "Immutable": Immutable.Map({

    "Maps": Immutable.Map({"abc": "def\nghi"}),

    "Maps with numeric keys": Immutable.Map().set(1, 2),

    "Maps in Maps": Immutable.Map()
      .set(1, Immutable.Map([['X', 'Y'], ['A', 'B']]))
      .set(2, Immutable.Map({a: 1, b: 2, c: 3})),

    "Lists": Immutable.List.of(1, 2, 3, 4, 5),

    "Long Lists": Immutable.Range(0, 100).toList(),

    "Lists in Maps": Immutable.Map().set(
      Immutable.List.of(1, 2),
      Immutable.List.of(1, 2, 3, 4, 5)
    ),

    "Sets": Immutable.Set.of(1, 2, 3, 3),

    "OrderedSets": Immutable.OrderedSet.of(1, 4, 3, 3),

    "Ordered Maps": Immutable.OrderedMap()
      .set(2, 'a')
      .set(3, 'b')
      .set(1, 'c')
  }),

  JS: Immutable.Map({

    "array": [1, 2, 3, 4, 5],

    "array of arrays": [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9, 10]
    ],

    "array of immutables": [
      Immutable.Map({1: 2}),
      Immutable.List.of(1, 2, 3)
    ],

    "object": {
      a: 1,
      b: 2
    },

    "object of immutables": {
      a: Immutable.Map({1: 2}),
      b: Immutable.Map({3: 4})
    }

  })

});

// This is a hack because records and maps are considered equivalent by
// immutable.
// https://github.com/astorije/chai-immutable/issues/37
function expectImmutableEqual(r1, r2) {
  expect(r1).to.eql(r2);
  expect(r1.toString()).to.eql(r2.toString());
}
exports.expectImmutableEqual = expectImmutableEqual;

function expectNotImmutableEqual(r1, r2) {
  try {
    expectImmutableEqual(r1, r2);
  } catch (ex) {
    return true;
  }
  throw new chai.AssertionError('Expected ' + r1 + ' to differ from ' + r2);
}
exports.expectNotImmutableEqual = expectNotImmutableEqual;
