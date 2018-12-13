const work = require('webworkify')
const mortice = require('../../')
mortice()

const observe = require('observable-webworkers')

const worker = work(require('./worker-single-thread.js'))

observe(worker)

observe.addEventListener('message', (worker, event) => {
  if (event.data) {
    if (event.data.type === 'log') {
      console.info(event.data.message)
    }

    if (event.data.type === 'done') {
      worker.terminate()

      return global.__close__()
    }
  }
})
