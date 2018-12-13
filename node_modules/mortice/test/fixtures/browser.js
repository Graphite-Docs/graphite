const mortice = require('../../')

const mutex = mortice()

mutex.writeLock(() => {
  return new Promise((resolve, reject) => {
    console.info('write 1')

    resolve()
  })
})
  .then(() => {})

mutex.readLock(() => {
  return new Promise((resolve, reject) => {
    console.info('read 1')

    resolve()
  })
})
  .then(() => {})

mutex.readLock(() => {
  return new Promise((resolve, reject) => {
    console.info('read 2')

    resolve()
  })
})

mutex.readLock(() => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.info('read 3')

      resolve()
    }, 500)
  })
})

mutex.writeLock(() => {
  return new Promise((resolve, reject) => {
    console.info('write 2')

    resolve()
  })
})

mutex.readLock(() => {
  return new Promise((resolve, reject) => {
    console.info('read 4')

    resolve()
  })
})
  .catch(() => {})
  .then(() => {
    global.__close__()
  })
