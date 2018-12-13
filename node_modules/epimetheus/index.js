const defaults = require('./lib/defaults')
const hapi = require('./lib/hapi')
const express = require('./lib/express')
const restify = require('./lib/restify')
const http = require('./lib/http')

function instrument (app, options) {
  options = defaults(options)

  if (hapi.instrumentable(app)) {
    hapi.instrument(app, options)
  } else if (express.instrumentable(app)) {
    express.instrument(app, options)
  } else if (restify.instrumentable(app)) {
    restify.instrument(app, options)
  } else if (http.instrumentable(app)) {
    http.instrument(app, options)
  }
}

module.exports = {
  instrument: instrument
}
