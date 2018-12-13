# hashlru

Simpler, faster LRU cache algorithm

A Least Recently Used cache is used to speedup requests to a key-value oriented resource,
while making a bounded memory commitment.

I've recently [benchmarked the various lru implementations available on npm](https://github.com/dominictarr/bench-lru)
and found wildly varing performance. There where some that performed well overall,
and others that performed extremely well in some cases, but poorly in others, due to
compromises made to maintain correctness.

After writing the benchmark, of course I had to try my hand at my own LRU implementation.
I soon found a few things, LRUs are quite difficult to implement, first of all contain a linked
list. LRUs use a linked list to maintain the order
that keys have been accessed, so that when the cache fills, the old values
(which presumably are the least likely to be needed again) can be removed from the cache.
Linked Lists are not easy to implement correctly!

Then I discovered why some of the fast algorithms where so slow - they used `delete cache[key]`
which is much slower than `cache[key] = value`, much much slower.

So, why looking for a way to avoid `delete` I had an idea - have two cache objects,
and when one fills - create a new one and start putting items in that, and then it's sufficiently
full, throw it away. It avoids delete, at at max, only commits us to only N values and between N and 2N keys.

Then I realized with this pattern, you _don't actually need_ the linked list anymore!
This makes a N-2N least recently used cache very very simple. This both has performance benefits,
and it's also very easy to verify it's correctness.

This algorithm does not give you an ordered list of the N most recently used items,
but you do not really need that! The property of dropping the least recent items is still preserved.

see a [benchmark](https://github.com/dominictarr/bench-lru) of this against
the other LRU implementations on npm.

## example

``` js
var HLRU = require('hashlru')
var lru = HLRU(100)
lru.set(key, value)
lru.get(key)
```

## algorithm

create two caches - `old_cache` and `new_cache`, and a counter, `size`.

When an `key, value` pair is added, if `key` is already in `new_cache` update the value,
not currently in `new_cache`, set `new_cache[key] = value`.
If the key was _not_ already in `new_cache` then `size` is incremented.
If `size > max`, move the `old_cache = new_cache`, reset `size = 0`, and initialize a new `new_cache={}`

To get a `key`, check if `new_cache` contains key, and if so, return it.
If not, check if it is in `old_cache` and if so, move that value to `new_cache`, and increment `size`.
If `size > max`, move the `old_cache = new_cache`, reset `size = 0`, and initialize a new `new_cache={}`

## complexity

Writes are O(1) on average, like a hash table.

When implemented in a garbage collected language, the old cache is thrown away when the new cache is
full. To better manage memory usage, it could also be implemented as two fixes sized hash tables.
In this case, instead of discarding the old cache, it would be zeroed. This means at most every N
writes when the caches are rotated, that write will require N operations (to clear the old cache)

This still averages out to O(1) but it does cost O(N) but only every N writes (except for updates)
so N/N is still 1.

## HashLRU (max) => lru

initialize a lru object.

### lru.get (key) => value | undefined

Returns the value in the cache, or `undefined` if the value is not in the cache.

### lru.set(key, value)

update the value for key.

### lru.has(key) => boolean

Checks if the `key` is in the cache.

### lru.remove(key)

Removes the `key` from the cache.

### lru.clear()

Empties the entire cache.

## License

MIT




