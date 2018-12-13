const cluster = require('cluster')
const mortice = require('../../')

const mutex = mortice()

if (cluster.isMaster) {
  cluster.on('message', (worker, message) => {
    if (message === 'done') {
      worker.kill()
    }
  })

  cluster.fork()
} else {
  mutex.writeLock(() => {
    return new Promise((resolve) => {
      console.info('write 1')

      resolve()
    })
  })
    .then(() => {})

  mutex.readLock(() => {
    return new Promise((resolve) => {
      console.info('read 1')

      resolve()
    })
  })
    .then(() => {})

  mutex.readLock(() => {
    return new Promise((resolve) => {
      console.info('read 2')

      resolve()
    })
  })

  mutex.readLock(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.info('read 3')

        resolve()
      }, 500)
    })
  })

  mutex.writeLock(() => {
    return new Promise((resolve) => {
      console.info('write 2')

      resolve()
    })
  })

  mutex.readLock(() => {
    return new Promise((resolve) => {
      console.info('read 4')

      resolve()

      process.send('done')
    })
  })
}
