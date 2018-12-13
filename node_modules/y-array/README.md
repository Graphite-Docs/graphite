# Array Type for [Yjs](https://github.com/y-js/yjs)

This plugins provides a shareable Array type. You can insert and delete objects in y-array. The objects must either be a custom type,
or fulfill the following property: `v equals JSON.parse(JSON.stringify(v))` (according to your definition of equality)

## Use it!
Install this with bower or npm.

##### Bower
```
bower install y-array --save
```

##### NPM
```
npm install y-array --save
```

### Array Object

##### Reference

* .insert(position, contents)
  * Insert an array of content at a position
  * You can also insert types `array.insert(0, Y.Map)`
  * If not a shared type, the content should fulfill the following property: `content equals JSON.parse(JSON.stringify(content))` (according to your notion of equality)
* .push(content)
  * Insert content at the end of the Array
  * Also see `.insert(..)`
* .delete(position, length)
  * Delete content. The *length* parameter is optional and defaults to 1
* .toArray()
  * Retrieve the complete content as an array
* .get(position)
  * Retrieve content from a position
* .observe(function observer(event){..})
  * The `observer` is called whenever something on this array changes
  * Throws insert, and delete events (`event.type`)
  * Insert event example: `{type: 'insert', index: 0, values: [0, 1, 2], length: 3}`
  * Delete event example: `{type: 'delete', index: 0, oldValues: [0, 1, 2], length: 3}`
* .observeDeep(function observer(event){..})
  * Same as .observe, but catches events from all children (if they support .observeDeep)
  * `event.path` specifies the path of the change event
* .unobserve(f)
  * Delete an observer


# A note on intention preservation
If two users insert something at the same position concurrently, the content that was inserted by the user with the higher user-id will be to the right of the other content. In the OT world we often speak of *intention preservation*, which is very loosely defined in most cases. This type has the following notion of intention preservation: When a user inserts content *c* after a set of content *C_left*, and before a set of content *C_right*, then *C_left* will be always to the left of c, and *C_right* will be always to the right of *c*. Since content is only marked as deleted (until all conflicts are resolved), this notion of intention preservation is very strong.

# A note on time complexities
* .insert(position, content)
  * O(contents.length)
* .push(content)
  * O(1)
* .delete(position, length)
  * O(position + length)
* .get(i)
  * O(length)
* Apply a delete operation from another user
  * O(contents.length)
* Apply an insert operation from another user
  * Yjs does not transform against operations that do not conflict with each other.
  * An operation conflicts with another operation if it intends to be inserted at the same position.
  * Overall worst case complexety: O(|conflicts|^2)

## Changelog

### 10.0.0
* Inserting & retrieving types are synchronous operations
  * I.e. `y.share.array.get(0) // => returns a type instead of a promise (if there is a type at position 0)
* Relies on Yjs@^12.0.0

## License
Yjs is licensed under the [MIT License](./LICENSE).

<kevin.jahns@rwth-aachen.de>model.id[0] === '_'
