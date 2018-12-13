### 2.3.1 - May 18 2015

 * [[`393c781629`](https://github.com/level/abstract-leveldown/commit/393c781629)] - document isLevelDown() (Lars-Magnus Skog)
 * [[`fd899c49b9`](https://github.com/level/abstract-leveldown/commit/fd899c49b9)] - link to level/community (Lars-Magnus Skog)

### 2.3.0 - May 18 2015

 * [[`9a976428e2`](https://github.com/level/abstract-leveldown/commit/9a976428e2)] - export from index.js and factor out into is-leveldown.js (Lars-Magnus Skog)
 * [[`8051f8f16c`](https://github.com/level/abstract-leveldown/commit/8051f8f16c)] - add isLevelDOWN() f
unction (Lars-Magnus Skog)

### 2.2.2 - May 13 2015

 * [[`4ff0a9bfbb`](https://github.com/level/abstract-leveldown/commit/4ff0a9bfbb)] - ***Revert*** "Merge pull request #60 from ralphtheninja/empty-location" (Julian Gruber)
 * [[`fab11e9e3b`](https://github.com/level/abstract-leveldown/commit/fab11e9e3b)] - use t.equal instead of t.ok(a === b) (Julian Gruber)

### 2.2.1 - May 12 2015

 * [[`f5051090e4`](https://github.com/level/abstract-leveldown/commit/f5051090e4)] - merge location string checks into one if-statement (Lars-Magnus Skog)
 * [[`cd362b2b9f`](https://github.com/level/abstract-leveldown/commit/cd362b2b9f)] - empty location string throws (Lars-Magnus Skog)
 * [[`e6d1cb80ea`](https://github.com/level/abstract-leveldown/commit/e6d1cb80ea)] - .throws is different for tape (Lars-Magnus Skog)
 * [[`a6f29b62fa`](https://github.com/level/abstract-leveldown/commit/a6f29b62fa)] - copy paste error gave wrong test description (Lars-Magnus Skog)

### 2.2.0 - May 10 2015

 * [[`aa867b3760`](https://github.com/level/abstract-leveldown/commit/aa867b3760)] - Merge pull request #58 from Level/add/put-sync (Julian Gruber)
 * [[`234de997bb`](https://github.com/level/abstract-leveldown/commit/234de997bb)] - add sync put tests (Julian Gruber)

### 2.1.4 - Apr 28 2015

 * [[`969116d00f`](https://github.com/level/abstract-leveldown/commit/969116d00f)] - use t.equal() with tape (Lars-Magnus Skog)

### 2.1.3 - Apr 28 2015

 * [[`68096e78cd`](https://github.com/level/abstract-leveldown/commit/68096e78cd)] - change from tap to tape (Lars-Magnus Skog)

### 2.1.2 - Apr 27 2015

 * [[`d79c060c9d`](https://github.com/level/abstract-leveldown/commit/d79c060c9d)] - convert buffer to string so we can compare (Lars-Magnus Skog)

### 2.1.1 - Apr 27 2015

 * [[`3881fc4290`](https://github.com/level/abstract-leveldown/commit/3881fc4290)] - **travis**: update npm so 0.8 works, add 0.12 and iojs (Lars-Magnus Skog)
 * [[`9f451e8f74`](https://github.com/level/abstract-leveldown/commit/9f451e8f74)] - rvagg/node- -> level/ (Lars-Magnus Skog)
 * [[`ecd41a72db`](https://github.com/level/abstract-leveldown/commit/ecd41a72db)] - fix typo (Hao-kang Den)
 * [[`20e91fd234`](https://github.com/level/abstract-leveldown/commit/20e91fd234)] - update logo and copyright (Lars-Magnus Skog)
 * [[`6ccf134874`](https://github.com/level/abstract-leveldown/commit/6ccf134874)] - added @watson to package.json (Rod Vagg)

### 2.1.0 - Nov 9 2014

 * [[`7451cd15e6`](https://github.com/level/abstract-leveldown/commit/7451cd15e6)] - added @watson (Rod Vagg)
 * [[`f4a3346da7`](https://github.com/level/abstract-leveldown/commit/f4a3346da7)] - Use `error` test function when testing for errors (Thomas Watson Steen)
 * [[`24668c50e0`](https://github.com/level/abstract-leveldown/commit/24668c50e0)] - Don't fail if no value is returned by _get (Thomas Watson Steen)
 * [[`865ed9e777`](https://github.com/level/abstract-leveldown/commit/865ed9e777)] - Use `setTimeout` instead of `setImmediate`. (Alan Gutierrez)
 * [[`9e9069faed`](https://github.com/level/abstract-leveldown/commit/9e9069faed)] - 2.0.3 (Rod Vagg)

### 2.0.3 - Oct 2 2014

 * [[`78052c53eb`](https://github.com/level/abstract-leveldown/commit/78052c53eb)] - add test for atomic batch operations (Calvin Metcalf)

### 2.0.1 - Sep 1 2014

 * [[`a0b36f6a18`](https://github.com/level/abstract-leveldown/commit/a0b36f6a18)] - Remove default options that's too LevelDOWN specific (Thomas Watson Steen)
 * [[`1d97993d0b`](https://github.com/level/abstract-leveldown/commit/1d97993d0b)] - Allow boolean options to be falsy/truthy (Thomas Watson Steen)
 * [[`fb3cf56da5`](https://github.com/level/abstract-leveldown/commit/fb3cf56da5)] - Set defaults for open, get, put, del and batch options (Thomas Watson Steen)
 * [[`5c2a629e2b`](https://github.com/level/abstract-leveldown/commit/5c2a629e2b)] - Update pattern for setting default options for the iterator (Thomas Watson Steen)

### 2.0.0 - Aug 26 2014
 * Lots of stuff between 0.11.1 and now, omitted updating changelog
 * Switch to allowing writes of empty values: null, undefined, '', []

### 0.11.1 - Nov 15 2013
 * Adjust approximate-size-test.js to account for snappy compression

### 0.11.0 - Oct 14 2013
 * Introduce _setupIteratorOptions() method to fix options object prior to _iterator() call; makes working with gt/gte/lt/lte options a little easier (@rvagg)

### 0.10.2 - Sep 6 2013

 * Refactor duplicated versions of isTypedArray into util.js (@rvagg)
 * Refactor duplicated versions of 'NotFound' checks into util.js, fixed too-strict version in get-test.js (@rvagg)

### 0.10.1 - Aug 29 2013

 * Relax check for 'Not Found: ' in error message to be case insensitive in get-test.js (@rvagg)

### 0.10.0 - Aug 19 2013

 * Added test for gt, gte, lt, lte ranges (@dominictarr)
