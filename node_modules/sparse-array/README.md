# sparse-array

[![Build Status](https://travis-ci.org/pgte/js-sparse-array.svg?branch=master)](https://travis-ci.org/pgte/js-sparse-array)

Sparse array implementation in JS with no dependencies

## Install

```bash
$ npm install sparse-array --save
```

## Use

### Create:

```js
const SparseArray = require('sparse-array')
const arr = new SparseArray()
```

### Set, get and unset:

```js
const index = 0
arr.set(index, 'value')

arr.get(index) // 'value'

arr.unset(index)

arr.get(index) // undefined
```

### Iterate:

```js
arr.forEach((elem, index) => {
  console.log('elem: %j at %d', elem, index)
})

const mapped = arr.map((elem, index) => {
  return elem + 1
})

const result = arr.reduce((acc, elem, index) => {
  return acc + Number(elem)
}, 0)
```

### Find:

```js
const firstEven = arr.find((elem) => (elem % 2) === 0)
```

### Internal representation:

#### Bit field:

```js
const bitField = arr.bitField()
```

#### Compact array:

```js
const compacted = arr.compactArray()
```

## License

ISC