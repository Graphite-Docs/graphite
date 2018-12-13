<h1 align="center">
  <!-- Logo -->
  Receptacle

  <br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-brightgreen.svg?style=flat-square" alt="API stability"/>
  </a>
  <!-- Standard -->
  <a href="https://github.com/feross/standard">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square" alt="Standard"/>
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/receptacle">
    <img src="https://img.shields.io/npm/v/receptacle.svg?style=flat-square" alt="NPM version"/>
  </a>
  <!-- Travis build -->
  <a href="https://travis-ci.org/DylanPiercey/receptacle">
  <img src="https://img.shields.io/travis/DylanPiercey/receptacle.svg?style=flat-square" alt="Build status"/>
  </a>
  <!-- Coveralls coverage -->
  <a href="https://coveralls.io/github/DylanPiercey/receptacle">
    <img src="https://img.shields.io/coveralls/DylanPiercey/receptacle.svg?style=flat-square" alt="Test Coverage"/>
  </a>
  <!-- File size -->
  <a href="https://github.com/DylanPiercey/receptacle/blob/master/dist/receptacle.js">
    <img src="https://badge-size.herokuapp.com/DylanPiercey/receptacle/master/dist/receptacle.js?style=flat-square" alt="File size"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/receptacle">
    <img src="https://img.shields.io/npm/dm/receptacle.svg?style=flat-square" alt="Downloads"/>
  </a>
  <!-- Gitter chat -->
  <a href="https://gitter.im/DylanPiercey/receptacle">
    <img src="https://img.shields.io/gitter/room/DylanPiercey/receptacle.svg?style=flat-square" alt="Gitter Chat"/>
  </a>
</h1>

In memory cache for node and the browser that supports `lru` and `ttl` algorithms.

Items in the cache will move to the back queue when accessed and any key can optionally have an expiry time.

## Installation


#### Npm
```console
npm install receptacle
```

#### [Download](https://raw.githubusercontent.com/DylanPiercey/receptacle/master/dist/receptacle.js)
```html
<script type="text/javascript" src="receptacle.js"></script>
<script>
    define(['receptacle'], function (receptacle) {...}) // AMD
    window.receptacle // Global receptacle if no module system in place.
</script>
```

## Example

```js
var Receptacle = require('receptacle');
var cache      = new Receptacle({ max: 100 }); // Create a cache with max 100 items.

cache.set("item", 1, { ttl: 100 }); //-> Add item to cache (expire in 100ms).
cache.get("item"); //-> 1
cache.has("item"); //-> true
cache.expire("item", 50); //-> Expire in 50ms (instead of 100).
cache.delete("item"); //-> Delete item right away.
cache.clear(); //-> Empty the cache.

// You can also use the "refresh" option to automatically reset a keys expiration when accessed.
cache.set("item", 1, { ttl: 100, refresh: true });
// 50ms later
cache.get("item"); // Resets timer back to 100ms.

// And store meta data about values.
cache.set("item", 1, { meta: { custom: 1 } });
// Then retrieve it.
cache.meta("item"); //-> { custom: 1 }
```

## Serialization
You can easily serialize and rehydrate your cache as JSON.

```js
var Receptacle = require('receptacle');
var cache      = new Receptacle({ max: 5 }); // Create a cache with max 5 items.

cache.set("a", 1, { ttl: 1000 });

var serialized = JSON.stringify(cache); //-> '{ "max": 5, "items": [...] }'

// Create a cache from the json which will retain all ttl information (and remove any keys that have expired).
var newCacheFromJSON = new Receptacle(JSON.parse(serialized));

```

## API

###`Receptacle({ max=Infinity, items=[], id=# })`
Create a new cache.

###`#id`
Each cache is assigned a unique id for organizing, you can optionally provide an id during instanciation.

###`#max`
Get the maximum size of the cache (default of Infinity).

###`#size`
Get the current number of items in the cache.

###`#has(key)`
Check if a key is in the cache, even if it's undefined.

###`#get(key)`
Retreive a key from the cache.

###`#meta(key)`
If a meta option was used with setting an item in the cache it will be returned.

###`#set(key, value, options)`
Set a key in the cache, optionally setting a `ttl` option that will cause the value to expire.
If a `refresh` option is `true` the ttl will automatically reset when the `key` is accessed.

###`#delete(key)`
Immediately remove a key from the cache.

###`#expire(key, [ms=0])`
Update the expire time for a key. You can also use any valid [ms](https://github.com/rauchg/ms.js) string for a timeout.

###`#clear()`
Remove all keys from the cache.

---

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
