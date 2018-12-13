#!/usr/bin/env node

'use strict'

const signalling = require('./index')
const argv = require('minimist')(process.argv.slice(2))

let server

signalling.start({
  port: argv.port || argv.p || process.env.PORT || 9090,
  host: argv.host || argv.h || process.env.HOST || '0.0.0.0',
  metrics: !(argv.disableMetrics || process.env.DISABLE_METRICS)
}, (err, _server) => {
  if (err) {
    throw err
  }
  server = _server

  console.log('Listening on:', server.info.uri)
})

process.on('SIGINT', () => {
  server.stop(() => {
    console.log('Signalling server stopped')
    process.exit()
  })
})
