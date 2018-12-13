Nested property
=============

Read, write or test a data structure's nested property via a string like 'my.nested.property'. It works through arrays and objects.

Installation
============

```bash
npm install nested-property
```

How to use
==========

Require nested-property:

```bash
var nestedProperty = require("nested-property");
```

__You can get a nested property from an object:__

```js
var object = {
  a: {
    b: {
      c: {
        d: 5
      }
    }
  }
};

nestedProperty.get(object, "a"); // returns object.a
nestedProperty.get(object, "a.b.c"); // returns object.a.b.c
nestedProperty.get(object, "a.b.c.d"); // returns 5
nestedProperty.get(object, "a.d.c"); // returns undefined
nestedProperty.get(object); // returns object
nestedProperty.get(null); // returns null
```

It also works through arrays:

```js
var array = [{
  a: {
    b: [0, 1]
  }
  }];

nestedProperty.get(array, "0"); // returns array[0]
nestedProperty.get(array, "0.a.b"); // returns array[0].a.b
nestedProperty.get(array, "0.a.b.0"); // returns 0
nestedProperty.get(array, "1.a.b.c"); // returns undefined
```

__You can set a nested property on an object:__

```js
var object = {
  a: {
    b: {
      c: {
        d: 5
      }
    }
  }
};

nestedProperty.set(object, "a", 1); // object.a == 1
nestedProperty.set(object, "a.b.c", 1337); // object.a.b.c == 1337
nestedProperty.set(object, "e.f.g", 1); // object.e.f.g == 1, it creates the missing objects!
nestedProperty.set(object); // returns object
nestedProperty.set(null); // returns null
```

You can also set a nested property through arrays:

```js
var array = [
 {
   a: [0, 1]
 }
];

nestedProperty.set(array, "0.a.0", 10); // array[0].a[0] == 10
nestedProperty.set(array, "0.b.c", 1337); // array[0].b.c == 1337
```

Caveat!

```js
var object = {};
nestedProperty.set(object, "0.1.2", "new object");

// will not create arrays, but objects such as:
{
  "0": {
    "1": {
      "2": "new object"
    }
  }
}
```

__You can also test if a data structure has a nested property:__

```js
var array = [
 {
   a: [0, 1]
 }
];

nestedProperty.has(array, "0.a"); // true
nestedProperty.has(array, "0.a.1"); // true
nestedProperty.has(array, "0.a.2"); // false
nestedProperty.has(array, "1.a.0"); // false
```

The example shows that it works through array, but of course, plain objects are fine too.

If it must be a "own" property (i.e. not in the prototype chain) you can use the own option:

```js
function DataStructure() {}
DataStructure.prototype.prop = true;

var obj = new DataStructure();

nestedProperty.has(obj, "prop", { own: true}); // false
nestedProperty.has(obj, "prop"); // true
```

Alternatively, you can use the hasOwn function:

```js
var obj = Object.create({prop: true});

nestedProperty.hasOwn(obj, "prop"); // false
```

___And finally, you can test if an object is on the path to a nested property:___

```js
var obj = {
    nested: [
        {
            property: true
        }
    ]
};

nestedProperty.isIn(obj, "nested.0.property", obj); // true
nestedProperty.isIn(obj, "nested.0.property", obj.nested); // true
nestedProperty.isIn(obj, "nested.0.property", obj.nested[0]); // true

nestedProperty.isIn(obj, "nested.0.property", {}); // false
```

The path doesn't have to be valid to return true:

```js
nestedProperty.isIn(obj, "nested.0.property.foo.bar.path", obj.nested[0]); // true
```

Unless the `validPath` option is set to `true`:

```js
nestedProperty.isIn(obj, "nested.0.property.foo.bar.path", obj.nested[0], { validPath: true }); // false
```

Note that if instead of an object you give it the value of the nested property, it'll return true:

```js
nestedProperty.isIn(obj, "nested.0.property", obj.nested[0].property); // true
nestedProperty.isIn(obj, "nested.0.property", true); // true
```

CHANGELOG
=========

### 0.0.7 - 09 AUG 2016

* [Remove unused require('assert')](https://github.com/cosmosio/nested-property/pull/1), thanks to [Nilz11](https://github.com/Nilz11)

### 0.0.6 - 01 MAR 2015

* Fix a bug where an invalid path to search an object into is invalid and the isInNestedProperty would throw an error instead of return false

### 0.0.5 - 19 JAN 2015

* Add isIn, to tell if an object is on the path to a nested property.

### 0.0.4 - 15 JAN 2015

* Add {own: true} option to .has to ensure that a nested property isn't coming from the prototype chain
* Add hasOwn, that calls .has with the {own: true} option

### 0.0.3 - 14 JAN 2015

* Add has with tests and documentation

LICENSE
=======

MIT
