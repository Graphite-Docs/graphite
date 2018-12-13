'use strict'

const sigServer = require('./src/sig-server')
let firstRun = true
let sigS

function boot (done) {
  const options = {
    port: 15555,
    host: '127.0.0.1',
    metrics: firstRun
  }

  if (firstRun) { firstRun = false }

  sigServer.start(options, (err, server) => {
    if (err) { throw err }

    sigS = server
    console.log('signalling on:', server.info.uri)
    done()
  })
}

function stop (done) {
  sigS.stop(done)
}

module.exports = {
  hooks: {
    pre: boot,
    post: stop
  }
}
