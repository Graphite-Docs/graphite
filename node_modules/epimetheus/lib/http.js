const defaults = require('./defaults')
const metrics = require('./metrics')

function sendMetrics (request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8'
  })

  response.write(metrics.summary())
  response.end()
}

function observeMetrics (request, response) {
  var start = process.hrtime()
  response.on('finish', () => {
    metrics.observe(request.method, request.url, response.statusCode, start)
  })
}

function instrument (server, options) {
  server.on('request', (request, response) => {
    if (request.url === options.url) {
      sendMetrics(request, response)
    } else {
      observeMetrics(request, response)
    }
  })
}

function instrumentable (server) {
  return server
}

module.exports = {
  instrumentable: instrumentable,
  instrument: instrument
}
