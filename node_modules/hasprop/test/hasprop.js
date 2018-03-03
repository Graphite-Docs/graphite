var test = require('tape');
var hasProp = require('../hasprop');

test('hasProp', function (t) {
  t.plan(47);

  var obj = {
    foo: 'bar',
    qux: {
      zee: {
        boop: 'yo',
        num: 4,
        peep: [55,'zonk', {
          __data: 'pow'
        }],
      },
      'key.with.dots': 'hello',
      '"key.with.quotes"': {
        greet: 'hi'
      },
      $el: 'element'
    },
    bar: {
      baz: {
        bar: 9
      }
    },
    'foo.bar': 'noob',
    qax: null
  };

  t.equal(hasProp(obj, 'foo'), true);
  t.equal(hasProp(obj, 'deedee'), false);
  t.equal(hasProp(obj, 'qux.zee.boop'), true);
  t.equal(hasProp(obj, 'qux.zee.num'), true);
  t.equal(hasProp(obj, 'qux.zee.peep.0'), true);
  t.equal(hasProp(obj, 'qux.zee.peep.1'), true);
  t.equal(hasProp(obj, 'qux.zee.peep[1]'), true);
  t.equal(hasProp(obj, 'qux[key.with.dots]'), true);
  t.equal(hasProp(obj, 'qux["key.with.quotes"].greet'), true);
  t.deepEqual(hasProp(obj, 'qux.zee.peep.2'), true);
  t.equal(hasProp(obj, 'qux.zee.peep.2.__data'), true);
  t.equal(hasProp(obj, 'qux.$el'), true);
  t.equal(hasProp(obj, 'bar.baz.bar'), true);
  t.equal(hasProp(obj, 'bar.baz.bar.nope'), false);
  t.equal(hasProp(obj, ''), false);
  t.equal(hasProp(obj, {}), false);
  t.equal(hasProp(obj, 3), false);
  t.equal(hasProp(obj, 'nah.1.0'), false);
  t.equal(hasProp('foo.bar', ''), false);
  t.equal(hasProp(obj, '[foo.bar]'), true);
  t.equal(hasProp(obj, 'qax.quz'), false);
  t.equal(hasProp(null, 'yo'), false);
  t.equal(hasProp(null, 'yo'), false);
  t.equal(hasProp(obj, ['deedee']), false);
  t.equal(hasProp(obj, ['qux', 'zee', 'boop']), true);
  t.equal(hasProp(obj, ['qux', 'zee', 'num']), true);
  t.equal(hasProp(obj, ['qux', 'zee', 'peep', 0]), true);
  t.equal(hasProp(obj, ['qux', 'zee', 'peep', '1']), true);
  t.equal(hasProp(obj, ['qux', 'key.with.dots']), true);
  t.equal(hasProp(obj, ['qux', '"key.with.quotes"', 'greet']), true);
  t.deepEqual(hasProp(obj, ['qux', 'zee', 'peep', 2]), true);
  t.equal(hasProp(obj, ['qux', 'zee', 'peep', 2, '__data']), true);
  t.equal(hasProp(obj, ['qux', '$el']), true);
  t.equal(hasProp(obj, ['bar', 'baz', 'bar']), true);
  t.equal(hasProp(obj, ['bar', 'baz', 'bar', 'nope']), false);
  t.equal(hasProp(obj, ['nah', 1, 0]), false);
  t.equal(hasProp(obj, ['foo.bar']), true);
  t.equal(hasProp(obj, ['qax', 'quz']), false);
  t.equal(hasProp(null, ['yo']), false);
  t.equal(hasProp(null, ['yo']), false);

  var objHasProp = hasProp(obj);
  t.equal(objHasProp('foo'), true);
  t.equal(objHasProp('[foo.bar]'), true);
  t.equal(objHasProp('yo'), false);
  t.equal(objHasProp(['foo']), true);
  t.equal(objHasProp(['foo.bar']), true);
  t.equal(objHasProp(['yo']), false);

  // oldschool
  var exists = Boolean(
    obj &&
    obj.qux &&
    obj.qux.zee &&
    obj.qux.zee.peep &&
    obj.qux.zee.peep[1]);

  t.equal(exists, true);
});
