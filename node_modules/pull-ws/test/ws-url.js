var tape = require('tape')

var wsurl = require('../ws-url')


tape('map from a relative url to one for this domain', function (t) {
  var location = {
    protocol: 'http',
    host: 'foo.com',
    pathname: '/whatever',
    search: '?okay=true'
  }

  t.equal(
    wsurl('//bar.com', location),
    'ws://bar.com'
  )
  t.equal(
    wsurl('/this', location),
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
    wsurl('/', {
      protocol: 'http',
      host: 'localhost:8000',
    }),
    'ws://localhost:8000/'
  )
  t.equal(
    wsurl('/', {
      protocol: 'http',
      host: 'server.com:8000',
    }),
    'ws://server.com:8000/'
  )

  t.end()
})

tape('universal url still works', function (t) {
  t.equal(
    wsurl('ws://what.com/okay', {
      protocol: 'http',
      host: 'localhost:8000',
    }),
    'ws://what.com/okay'
  )
  t.equal(
    wsurl('wss://localhost/', {
      protocol: 'https',
      host: 'localhost:8000',
    }),
    'wss://localhost/'
  )
  t.end()
})


