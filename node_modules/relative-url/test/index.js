var tape = require('tape')

var rurl = require('../')

var map = { http: 'ws', https: 'wss' }
var def = 'ws'

tape('map from a relative url to one for this domain', function (t) {
  var location = {
    protocol: 'http',
    host: 'foo.com',
    pathname: '/whatever',
    search: '?okay=true'
  }

  t.equal(
    rurl('//bar.com', location, map, def),
    'ws://bar.com'
  )
  t.equal(
    rurl('/this', location, map, def),
    'ws://foo.com/this'
  )

  t.end()
})

tape('same path works on dev and deployed', function (t) {
  var location = {
    protocol: 'http',
    host: 'localhost:8000',
  }

  t.equal(
    rurl('/', { protocol: 'http', host: 'localhost:8000'}, map, def),
    'ws://localhost:8000/'
  )
  t.equal(
    rurl('/', { protocol: 'http', host: 'server.com'}, map, def),
    'ws://server.com/'
  )
  t.equal(
    rurl('/', { protocol: 'https', host: 'server.com'}, map, def),
    'wss://server.com/'
  )

  t.end()
})

tape('universal url still works', function (t) {
  var location = { protocol: 'http', host: 'localhost:8000' }
  t.equal(
    rurl('ws://what.com/okay', location, map, def),
    'ws://what.com/okay'
  )
  t.equal(
    rurl('wss://localhost/', location, map, def),
    'wss://localhost/'
  )
  t.end()
})

tape('protocol defaults to not change', function (t) {
  var location = {
    protocol: 'http',
    host: 'localhost:8000',
  }

  t.equal(
    rurl('/', { protocol: 'http', host: 'localhost:8000'}),
    'http://localhost:8000/'
  )
  t.equal(
    rurl('/', { protocol: 'http', host: 'server.com'}),
    'http://server.com/'
  )
  t.equal(
    rurl('/', { protocol: 'https', host: 'server.com'}),
    'https://server.com/'
  )

  t.end()
})


tape('query string, if you want that!', function (t) {
  var location = {
    protocol: 'http',
    host: 'localhost:8000',
    pathname: '/foo/bar'
  }

  t.equal(
    rurl('?whatever=true', location, map, def),
    'ws://localhost:8000/foo/bar?whatever=true'
  )

  t.end()
})

tape('same domain, different port', function (t) {
  var location = {
    protocol: 'http',
    host: 'localhost:8000',
    hostname: 'localhost',
  }

  t.equal(
    rurl('//:9999/okay', {
      protocol: 'http',
      host: 'localhost:8000',
      hostname: 'localhost',
    }, map, def),
    'ws://localhost:9999/okay'
  )

  t.equal(
    rurl('//:9999/okay', {
      protocol: 'http',
      host: 'server.com',
      hostname: 'server.com',
    }, map, def),
    'ws://server.com:9999/okay'
  )

  t.end()
})


tape("don't mess with url that starts out absolute", function (t) {
  var location = {
    protocol: 'http',
    host: 'localhost:8000',
  }

  t.equal(
    rurl('ws://localhost:8000/', { protocol: 'http', host: 'localhost:8000'}, map, def),
    'ws://localhost:8000/'
  )
  t.equal(
    rurl('ws://localhost:8000/', { protocol: 'https', host: 'server.com'}, map, def),
    'ws://localhost:8000/'
  )

  t.end()
})



