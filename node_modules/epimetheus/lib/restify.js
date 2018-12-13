const metrics = require('./metrics')

function middleware (request, response, done) {
  var start = process.hrtime()

  response.on('finish', function () {
    if (typeof request.path === 'function') { // restify
      request.path = request.path()
    }
    metrics.observe(request.method, request.path, response.statusCode, start)
  })

  return done()
};

function instrument (server, options) {
  server.use(middleware)
  server.get(options.url, (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    /**
     * Using send uses the native Node handlers rather than the restify one
     * changing send to end di the job
     * 
     * see https://stackoverflow.com/questions/28680755/setting-content-type-header-with-restify-results-in-application-octet-stream
     */
    return res.end(metrics.summary())
  })
}

function instrumentable (server) {
  return server && server.name && server.use
}

module.exports = {
  instrumentable: instrumentable,
  instrument: instrument
}
