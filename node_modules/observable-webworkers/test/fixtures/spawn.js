/* eslint-env node, browser */

const observe = require('../../')

var myblob = URL.createObjectURL(new Blob(['postMessage("ok")'], {
  type: 'text/plain'
}))

const worker = new Worker(myblob)

observe(worker)

observe.addEventListener('message', (worker, event) => {
  console.info(event.data)

  worker.terminate()

  global.__close__()
})

setTimeout(() => {
  global.__close__()
}, 1000)
