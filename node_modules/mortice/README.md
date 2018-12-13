# mortice

[![Build status](https://travis-ci.org/achingbrain/mortice.svg?branch=master)](https://travis-ci.org/achingbrain/mortice.svg?branch=master)

Isomorphic read/write lock that works in single processes, node clusters and web workers.

## Features

- Reads occur concurrently
- Writes occur one at a time
- No reads occur while a write operation is in progress
- Locks can be created with different names
- Reads/writes can time out

## Install

```sh
$ npm install --save mortice
```

## Usage

```javascript
const mortice = require('mortice')
const delay = require('delay')

// the lock name & options objects are both optional
const mutex = mortice('my-lock', {

  // how long before write locks time out (default: 24 hours)
  timeout: 30000,

   // control how many read operations are executed concurrently (default: Infinity)
  concurrency: 5,

  // the global object (for use with webworkify and similar) (default: global)
  global: window,

  // by default the the lock will be held on the main thread, set this to true if the
  // a lock should reside on each worker (default: false)
  singleProcess: false
})

mutex.requestRead(() => {
  return Promise.resolve().then(() => console.info('read 1'))
})

mutex.requestRead(() => {
  return Promise.resolve().then(() => console.info('read 2'))
})

mutex.requestWrite(() => {
  return delay(200).then(() => console.info('write 1'))
})

mutex.requestRead(() => {
  return Promise.resolve().then(() => console.info('read 3'))
})
```

```
read 1
read 2
<small pause>
write 1
read 3
```

## Browser

Because there's no global way to evesdrop on messages sent by Web Workers, please pass all created Web Workers to the [`observable-webworkers`](https://npmjs.org/package/observable-webworkers) module:

```javascript
// main.js
const mortice = require('mortice')
const observe = require('observable-webworkers')

// create our lock on the main thread, it will be held here
const mutex = mortice()

const worker = new Worker('worker.js')

observe(worker)
```

```javascript
// worker.js
const mortice = require('mortice')
const delay = require('delay')

const mutex = mortice()

mutex.requestRead(() => {
  // return a promise
})

mutex.requestWrite(() => {
  // return a promise
})
```

Alternatively you can use the bundled `mortice.Worker` to create web workers and save yourself an extra dependency.

```javascript
const mortice = require('mortice')
const Worker = mortice.Worker

// create our lock on the main thread, it will be held here
const mutex = mortice()

const worker = new Worker('worker.js')
```
