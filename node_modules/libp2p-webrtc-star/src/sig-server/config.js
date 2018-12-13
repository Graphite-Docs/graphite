'use strict'

const debug = require('debug')
const log = debug('signalling-server')
log.error = debug('signalling-server:error')

module.exports = {
  log: log,
  hapi: {
    port: process.env.PORT || 13579,
    host: '0.0.0.0',
    options: {
      connections: {
        routes: {
          cors: true
        }
      }
    }
  },
  refreshPeerListIntervalMS: 10000
}
