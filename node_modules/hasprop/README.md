# hasprop

Check if nested object has property, the easy way.

Antiquated way:

```javascript
var exists = Boolean(
  obj &&
  obj.qux &&
  obj.qux.zee &&
  obj.qux.zee.peep &&
  obj.qux.zee.peep[2] &&
  obj.qux.zee.peep[2].__data);
```

with hasProp:

```javascript
var exists = hasProp(obj, ['qux', 'zee', 'peep', 2, '__data']);
```

# Install

```bash
npm install hasprop
```

# Usage

```javascript
var hasProp = require('hasprop');

var obj = {
  foo: 'bar',
  qux: {
    zee: {
      boop: 4,
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
  'foo.bar': 'noob',
  qax: null
};

// array for path (recommended)
hasProp(obj, ['foo']) // true
hasProp(obj, ['deedee']) // false
hasProp(obj, ['qux', 'zee', 'boop']) // true
hasProp(obj, ['qux', 'zee', 'peep', 0]) // true
hasProp(obj, ['qux', 'zee', 'peep', 1]) // true
hasProp(obj, ['qux', 'key.with.dots']) // true
hasProp(obj, ['qux', '"key.with.quotes"', 'greet']) // true
hasProp(obj, ['qux', 'zee', 'peep', 2]) // true
hasProp(obj, ['qux', 'zee', 'peep', 2, '__data']) // true
hasProp(obj, ['qux', '$el']) // true
hasProp(obj, ['foo.bar']) // true
hasProp(obj, ['qux', 'qux']) // false

// string for path
hasProp(obj, 'foo') // true
hasProp(obj, 'deedee') // false
hasProp(obj, 'qux.zee.boop') // true
hasProp(obj, 'qux.zee.peep.0') // true
hasProp(obj, 'qux.zee.peep.1') // true
hasProp(obj, 'qux.zee.peep[1]') // true
hasProp(obj, 'qux[key.with.dots]') // true
hasProp(obj, 'qux["key.with.quotes"].greet') // true
hasProp(obj, 'qux.zee.peep.2') // true
hasProp(obj, 'qux.zee.peep.2.__data') // true
hasProp(obj, 'qux.$el') // true
hasProp(obj, '[foo.bar]') // true
hasProp(obj, 'qux.qux') // false
```

Partially applied:

```
var objHasProp = hasProp(obj);

objHasProp(['foo']) //  true
objHasProp('[foo.bar']) // true
objHasProp(['qux']) // true
objHasProp(['yo']) // false
```

For getting the value, check out the module [getprop](https://github.com/miguelmota/getprop).

# License

MIT
