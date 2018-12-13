const node = require('./node')
const browser = require('./browser')
const Queue = require('p-queue')
const { timeout } = require('promise-timeout')
const observe = require('observable-webworkers')

const mutexes = {}
let implementation

const createMutex = (name, options) => {
  if (implementation.isWorker) {
    return {
      readLock: implementation.readLock(name, options),
      writeLock: implementation.writeLock(name, options)
    }
  }

  const masterQueue = new Queue({concurrency: 1})
  let readQueue = null

  return {
    readLock: (fn) => {
      if (!readQueue) {
        readQueue = new Queue({
          concurrency: options.concurrency,
          autoStart: false
        })

        const localReadQueue = readQueue

        masterQueue.add(() => {
          localReadQueue.start()

          return localReadQueue.onIdle()
            .then(() => {
              if (readQueue === localReadQueue) {
                readQueue = null
              }
            })
        })
      }

      return readQueue.add(() => timeout(fn(), options.timeout))
    },
    writeLock: (fn) => {
      readQueue = null

      return masterQueue.add(() => timeout(fn(), options.timeout))
    }
  }
}

const defaultOptions = {
  concurrency: Infinity,
  timeout: 84600000,
  global: global,
  singleProcess: false
}

module.exports = (name, options) => {
  if (!options) {
    options = {}
  }

  if (typeof name === 'object') {
    options = name
    name = 'lock'
  }

  if (!name) {
    name = 'lock'
  }

  options = Object.assign({}, defaultOptions, options)

  if (!implementation) {
    implementation = node(options) || browser(options)

    if (!implementation.isWorker) {
      // we are master, set up worker requests
      implementation.on('requestReadLock', (name, fn) => {
        mutexes[name] && mutexes[name].readLock(fn)
      })

      implementation.on('requestWriteLock', (name, fn) => {
        mutexes[name] && mutexes[name].writeLock(fn)
      })
    }
  }

  if (!mutexes[name]) {
    mutexes[name] = createMutex(name, options)
  }

  return mutexes[name]
}

module.exports.Worker = function (script, Impl) {
  Impl = Impl || global.Worker
  let worker

  try {
    worker = new Impl(script)
  } catch (error) {
    if (error.message.includes('not a constructor')) {
      worker = Impl(script)
    }
  }

  if (!worker) {
    throw new Error('Could not create Worker from', Impl)
  }

  observe(worker)

  return worker
}
