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
let cluster

const handleWorkerLockRequest = (emitter, masterEvent, requestType, releaseType, grantType) => {
  return (worker, requestEvent) => {
    if (requestEvent && requestEvent.type === requestType) {
      emitter.emit(masterEvent, requestEvent.name, () => {
        // grant lock to worker
        worker.send({
          type: grantType,
          name: requestEvent.name,
          identifier: requestEvent.identifier
        })

        // wait for worker to finish
        return new Promise((resolve) => {
          const releaseEventListener = (releaseEvent) => {
            if (releaseEvent && releaseEvent.type === releaseType && releaseEvent.identifier === requestEvent.identifier) {
              worker.removeListener('message', releaseEventListener)
              resolve()
            }
          }

          worker.on('message', releaseEventListener)
        })
      })
    }
  }
}

const makeWorkerLockRequest = (name, requestType, grantType, releaseType) => {
  return (fn) => {
    const id = shortid.generate()

    process.send({
      type: requestType,
      identifier: id,
      name
    })

    return new Promise((resolve, reject) => {
      const listener = (event) => {
        if (event && event.type === grantType && event.identifier === id) {
          process.removeListener('message', listener)

          let error = null

          fn()
            .catch((err) => {
              error = err
            })
            .then((result) => {
              process.send({
                type: releaseType,
                identifier: id,
                name
              })

              if (error) {
                return reject(error)
              }

              resolve(result)
            })
        }
      }

      process.on('message', listener)
    })
  }
}

module.exports = (options) => {
  try {
    cluster = require('cluster')

    if (!Object.keys(cluster).length) {
      return
    }
  } catch (_) {
    return
  }

  if (cluster.isMaster || options.singleProcess) {
    const emitter = new EventEmitter()

    cluster.on('message', handleWorkerLockRequest(emitter, 'requestReadLock', WORKER_REQUEST_READ_LOCK, WORKER_RELEASE_READ_LOCK, MASTER_GRANT_READ_LOCK))
    cluster.on('message', handleWorkerLockRequest(emitter, 'requestWriteLock', WORKER_REQUEST_WRITE_LOCK, WORKER_RELEASE_WRITE_LOCK, MASTER_GRANT_WRITE_LOCK))

    return emitter
  }

  return {
    isWorker: true,
    readLock: (name, options) => makeWorkerLockRequest(name, WORKER_REQUEST_READ_LOCK, MASTER_GRANT_READ_LOCK, WORKER_RELEASE_READ_LOCK),
    writeLock: (name, options) => makeWorkerLockRequest(name, WORKER_REQUEST_WRITE_LOCK, MASTER_GRANT_WRITE_LOCK, WORKER_RELEASE_WRITE_LOCK)
  }
}
