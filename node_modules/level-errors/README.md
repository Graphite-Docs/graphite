# level-errors

> Error module for [levelup][levelup]

[![level badge][level-badge]](https://github.com/level/awesome)
[![npm](https://img.shields.io/npm/v/level-errors.svg)](https://www.npmjs.com/package/level-errors)
![Node version](https://img.shields.io/node/v/level-errors.svg)
[![Build Status](https://travis-ci.org/Level/errors.svg)](https://travis-ci.org/Level/errors)
[![dependencies](https://david-dm.org/Level/level.svg)](https://david-dm.org/level/level)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![npm](https://img.shields.io/npm/dm/level-errors.svg)](https://www.npmjs.com/package/level-errors)

## API

### `.LevelUPError()`

Generic error base class.

### `.InitializationError()`

Error initializing the database, like when the database's location argument is missing.

### `.OpenError()`

Error opening the database.

### `.ReadError()`

Error reading from the database.

### `.WriteError()`

Error writing to the database.

### `.NotFoundError()`

Data not found error.

Has extra properties:

- `notFound`: `true`
- `status`: 404

### `.EncodingError()`

Error encoding data.

## License

Copyright &copy; 2012-2018 `level-errors` contributors.

`level-errors` is licensed under the MIT license. All rights not explicitly granted in the MIT license are reserved. See the included `LICENSE.md` file for more details.

[level-badge]: http://leveldb.org/img/badge.svg
[levelup]: https://github.com/level/levelup
