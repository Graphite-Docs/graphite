# transit-immutable-js

[Transit](https://github.com/cognitect/transit-js) serialisation for [Immutable.js](https://facebook.github.io/immutable-js/).

Transit is a serialisation format which builds on top of JSON to provide a richer set of types. It is extensible, which makes it a good choice for easily providing serialisation and deserialisation capabilities for Immutable's types.

[![npm version](https://img.shields.io/npm/v/transit-immutable-js.svg)](https://www.npmjs.com/package/transit-immutable-js) [![Build Status](https://img.shields.io/travis/glenjamin/transit-immutable-js/master.svg)](https://travis-ci.org/glenjamin/transit-immutable-js) [![Coverage Status](https://coveralls.io/repos/glenjamin/transit-immutable-js/badge.svg?branch=master)](https://coveralls.io/r/glenjamin/transit-immutable-js?branch=master) ![MIT Licensed](https://img.shields.io/npm/l/transit-immutable-js.svg)

## Install

```sh
npm install transit-immutable-js
```

You must also be using `immutable` for this to be of any use.

I have chosen to apply very broad npm peerDependencies for simplicity, please check that the versions you have pulled in actually work.

## Usage

```js
var transit = require('transit-immutable-js');
var Immutable = require('immutable');

var m = Immutable.Map({with: "Some", data: "In"});

var str = transit.toJSON(m);

console.log(str)
// ["~#cmap",["with","Some","data","In"]]

var m2 = transit.fromJSON(str);

console.log(Immutable.is(m, m2));
// true
```

This library also manages to preserve objects which are a mixture of plain javascript and Immutable.

```js
var obj = {
  iMap: Immutable.Map().set(Immutable.List.of(1, 2, 3), "123"),
  iList: Immutable.List.of("a", "b", "c"),
  array: [ "javascript", 4, "lyfe" ]
}

console.log(transit.fromJSON(transit.toJSON(obj)));
// { iMap: Map { [1,2,3]: "123" },
//  iList: List [ "a", "b", "c" ],
//  array: [ 'javascript', 4, 'lyfe' ] }
```

### Usage with transit directly

As well as the nice friendly wrapped API, the internal handlers are exposed in
case you need to work directly with the `transit-js` API.

```js
var transitJS = require('transit-js');
var handlers = require('transit-immutable-js').handlers;

var reader = transitJS.reader('json', {handlers: handlers.read});
var writer = transitJS.writer('json-verbose', {handlers: handlers.write});
```

## API

### `transit.toJSON(object) => string`

Convert an immutable object into a JSON representation ([XSS Warning](#xss-warning))

### `transit.fromJSON(string) => object`

Convert a JSON representation back into an immutable object

### `transit.handlers.read` `object`

A mapping of tags to decoding functions which can be used to create a transit reader directly.

### `transit.handlers.write` `transit.map`

A mapping of type constructors to encoding functions which can be used to create a transit writer directly.

**The various `withXXX` methods can be combined as desired by chaining them together.**

### `transit.withExtraHandlers(Array handlers) => transit`
> Also `transit.handlers.withExtraHandlers(Array handlers) => handlers`

Create a modified version of the transit API that knows about more types than it did before. This is primarily useful if you have additional custom datatypes that you want to be able serialise and deserialise. Each entry in this array must be an object with the following properties:

 * `tag` *string* - a unique identifier for this type that will be used in the serialised output
 * `class` *function* - a constructor function that can be used to identify the type via an `instanceof` check
 * `write` *function(value)* - a function which will receive an instance of your type, and is expected to create some serialisable representation of it
 * `read` *function(rep)* - a function which will receive the serialisable representation, and is expected to create a new instance from it

The `read` and `write` functions should form a matched pair of functions - calling read on the result of write should produce the same value and vice versa. Transit applies encoding and decoding recursively, so you can return any type transit understands from `write`, and expect to receive it back in `read` later.

### `transit.withFilter(function) => transit`
> Also `transit.handlers.withFilter(function) => handlers`

Create a modified version of the transit API that deeply applies the provided filter function to all immutable collections before serialising. Can be used to exclude entries.

### `transit.withRecords(Array recordClasses, missingRecordHandler = null) => transit`
> Also `transit.handlers.withRecords(Array recordClasses, missingRecordHandler = null) => handlers`

Creates a modified version of the transit API with support for serializing/deserializing [Record](https://facebook.github.io/immutable-js/docs/#/) objects. If a Record is included in an object to be serialized without the proper handler, on encoding it will be encoded as an `Immutable.Map`.

`missingRecordHandler` is called when a record-name is not found and can be used to handle the missing record manually. If no handler is given, the deserialisation process will throw an error. It accepts 2 parameters: `name` and `value` and the return value will be used instead of the missing record.


## Example `Record` Usage:

```js
var FooRecord = Immutable.Record({
  a: 1,
  b: 2,
}, 'foo');

var data = new FooRecord();

var recordTransit = transit.withRecords([FooRecord]);
var encodedJSON = recordTransit.toJSON(data);
```

## Example missing `Record` Usage:

```js
var BarRecord = Immutable.Record({
  c: '1',
  d: '2'
}, 'bar');

var FooRecord = Immutable.Record({
  a: 1,
  b: 2,
}, 'foo');

var data = new FooRecord({a: 3, b: 4});

var recordTransitFoo = transit.withRecords([FooRecord]);
var encodedJSON = recordTransitFoo.toJSON(data);

var recordTransitEmpty = transit.withRecords([], function (name, value) {
  switch (name) {
    case 'foo':
      return new BarRecord({c: value.a, d: value.b});
    default:
      return null;
  }
});

var decodedResult = recordTransitEmpty.fromJSON(encodedJSON); // returns new BarRecord({c: 3, d: 4})
```

## XSS Warning

When embedding JSON in an html page or related context (e.g. css, element attributes, etc), _**care must be taken to sanitize the output**_. By design, niether transit-js nor transit-immutable-js provide output sanitization.

There are a number of libraries that can help. Including: [xss-filters](https://www.npmjs.com/package/xss-filters), [secure-filters](https://www.npmjs.com/package/secure-filters), and [many more](https://www.npmjs.com/browse/keyword/xss)
