const client = require('prom-client')
const collectDefaultMetrics = client.collectDefaultMetrics
collectDefaultMetrics({ timeout: 5000 })
const labels = require('./labels')
const metric = {
  http: {
    requests: {
      duration: new client.Summary({ name: 'http_request_duration_milliseconds', help: 'request duration in milliseconds', labelNames: ['method', 'path', 'cardinality', 'status'] }),
      buckets: new client.Histogram({ name: 'http_request_buckets_milliseconds', help: 'request duration buckets in milliseconds. Bucket size set to 500 and 2000 ms to enable apdex calculations with a T of 300ms', labelNames: ['method', 'path', 'cardinality', 'status'], buckets: [ 500, 2000 ] })
    }
  }
}

function ms (start) {
  var diff = process.hrtime(start)
  return Math.round((diff[0] * 1e9 + diff[1]) / 1000000)
}

function observe (method, path, statusCode, start) {
  path = path ? path.toLowerCase() : ''

  if (path !== '/metrics' && path !== '/metrics/') {
    var duration = ms(start)
    method = method.toLowerCase()
    var split = labels.parse(path)
    metric.http.requests.duration.labels(method, split.path, split.cardinality, statusCode).observe(duration)
    metric.http.requests.buckets.labels(method, split.path, split.cardinality, statusCode).observe(duration)
  }
};

module.exports = {
  observe: observe,
  summary: () => client.register.metrics()
}
