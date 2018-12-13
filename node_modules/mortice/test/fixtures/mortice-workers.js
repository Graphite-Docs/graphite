const work = require('webworkify')
const observe = require('observable-webworkers')
const mortice = require('../../')
const Worker = mortice.Worker
mortice()

new Worker(require('./worker.js'), work) // eslint-disable-line

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
