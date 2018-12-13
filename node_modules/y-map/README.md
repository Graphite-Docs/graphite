
# Map Type for [Yjs](https://github.com/y-js/yjs)

Manage map-like data with this shareable map type. You can insert and delete objects in y-map. The objects must either be a custom types, or fulfill the following property: `v equals JSON.parse(JSON.stringify(v))` (according to your definition of equality)

## Use it!
Retrieve this with bower or npm.

##### Bower
```
bower install y-map --save
```

##### NPM
```
npm install y-map --save
```

# Y.Map
Y.Map mimics the behaviour of a javascript Object. You can create, update, and remove properies on this type. Furthermore, you can observe changes on this type as you can observe changes on Javascript Objects with [Object.observe](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe) - an ECMAScript 7 proposal ~~which is likely to become accepted by the committee~~. Until then, we have our own implementation.

##### Reference
* .get(key)
  * Retrieve the value for key
* .set(key, value)
  * Set/update a property
  * You can also insert a type `map.set(key, Y.Map)`
  * If not a shared type, the value should fulfill the following property: `value equals JSON.parse(JSON.stringify(value))` (according to your notion of equality)
* .delete(key)
  * Delete a property
* .keys()
  * Returns all keys for all values
* .observe(observer)
  * The `observer` is called whenever something on this object changes. Throws *add*, *update*, and *delete* events
  * The `event` object has the following properties:
    * `event.type` The type of the event. "add" - a new key-value pair was added, "update" - an existing key-value pair was changed, or "delete" - a key-value pair was deleted)
    * `event.name` The key of the changed property
    * `event.value` If event type is either "update" or "add", this property defines the new value of the key-value pair
    * `event.object` The object on which the event occurred (The object on which `.observe(..)` was called)
* .observeDeep(function observer(event){..})
  * Same as .observe, but catches events from all children (if they support .observeDeep)
  * `event.path` specifies the path of the change event
* .observePath(path, observer) *deprecated*
  * `path` is an array of property keys
  * `observer` is when the value under the path is found
  * `observer` is called when the property under `path` is set, deleted, or updated
  * returns a function which, if called, removes the observer from the path
* .unobserve(f)
  * Delete an observer

# A note on intention preservation
When users create/update/delete the same property concurrently, only one change will prevail. Changes on different properties do not conflict with each other.

# A note on time complexities
* .get(key)
  * O(1)
* .set(key, value)
  * O(1)
* .delete(key)
  * O(1)
* Apply a delete operation from another user
  * O(1)
* Apply an update operation from another user (set/update a property)
  * Yjs does not transform against operations that do not conflict with each other.
  * An operation conflicts with another operation if it changes the same property.
  * Overall worst case complexety: O(|conflicts|^)

## Changelog

### 10.0.0
* inserting & retrieving types are synchronous operations
  * I.e. `y.share.map.get('some type') // => returns a type instead of a promise
* relies on Yjs@^12.0.0

## License
Yjs is licensed under the [MIT License](./LICENSE.txt).

<kevin.jahns@rwth-aachen.de>
