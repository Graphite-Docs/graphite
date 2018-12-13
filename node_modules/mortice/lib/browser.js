const EventEmitter = require('events').EventEmitter
const shortid = require('shortid')
const {
  WORKER_REQUEST_READ_LOCK,
  WORKER_RELEASE_READ_LOCK,
  MASTER_GRANT_READ_LOCK,
  WORKER_REQUEST_WRITE_LOCK,
  WORKER_RELEASE_WRITE_LOCK,
  MASTER_GRANT_WRITE_LOCK
} = require('./constants')
const observer = require('observable-webworkers')

const handleWorkerLockRequest = (emitter, masterEvent, requestType, releaseType, grantType) => {
  return (worker, event) => {
    if (!event || !event.data || event.data.type !== requestType) {
      return
    }

    const requestEvent = {
      type: event.data.type,
      name: event.data.name,
      identifier: event.data.identifier
    }

    emitter.emit(masterEvent, requestEvent.name, () => {
      // grant lock to worker
      worker.postMessage({
        type: grantType,
        name: requestEvent.name,
        identifier: requestEvent.identifier
      })

      // wait for worker to finish
      return new Promise((resolve) => {
        const releaseEventListener = (event) => {
          if (!event || !event.data) {
            return
          }

          const releaseEvent = {
            type: event.data.type,
            name: event.data.name,
            identifier: event.data.identifier
          }

          if (releaseEvent && releaseEvent.type === releaseType && releaseEvent.identifier === requestEvent.identifier) {
            worker.removeEventListener('message', releaseEventListener)
            resolve()
          }
        }

        worker.addEventListener('message', releaseEventListener)
      })
    })
  }
}

const makeWorkerLockRequest = (global, name, requestType, grantType, releaseType) => {
  return (fn) => {
    const id = shortid.generate()

    global.postMessage({
      type: requestType,
      identifier: id,
      name
    })

    return new Promise((resolve, reject) => {
      const listener = (event) => {
        if (!event || !event.data) {
          return
        }

        const responseEvent = {
          type: event.data.type,
          identifier: event.data.identifier
        }

        if (responseEvent && responseEvent.type === grantType && responseEvent.identifier === id) {
          global.removeEventListener('message', listener)

          let error

          fn()
            .catch((err) => {
              error = err
            })
            .then((result) => {
              global.postMessage({
                type: releaseType,
                identifier: id,
                name
              })

              if (error) {
                return reject(error)
              }

              return resolve(result)
            })
        }
      }

      global.addEventListener('message', listener)
    })
  }
}

const defaultOptions = {
  global: global,
  singleProcess: false
}

module.exports = (options) => {
  options = Object.assign({}, defaultOptions, options)
  const isMaster = !!options.global.document || options.singleProcess

  if (isMaster) {
    const emitter = new EventEmitter()

    observer.addEventListener('message', handleWorkerLockRequest(emitter, 'requestReadLock', WORKER_REQUEST_READ_LOCK, WORKER_RELEASE_READ_LOCK, MASTER_GRANT_READ_LOCK))
    observer.addEventListener('message', handleWorkerLockRequest(emitter, 'requestWriteLock', WORKER_REQUEST_WRITE_LOCK, WORKER_RELEASE_WRITE_LOCK, MASTER_GRANT_WRITE_LOCK))

    return emitter
  }

  return {
    isWorker: true,
    readLock: (name, options) => makeWorkerLockRequest(options.global, name, WORKER_REQUEST_READ_LOCK, MASTER_GRANT_READ_LOCK, WORKER_RELEASE_READ_LOCK),
    writeLock: (name, options) => makeWorkerLockRequest(options.global, name, WORKER_REQUEST_WRITE_LOCK, MASTER_GRANT_WRITE_LOCK, WORKER_RELEASE_WRITE_LOCK)
  }
}
