
//normalize a ws url.
var URL = require('url')
module.exports = function (url, location, protocolMap, defaultProtocol) {
  protocolMap = protocolMap ||{}
  /*

  https://nodejs.org/dist/latest-v6.x/docs/api/url.html#url_url_parse_urlstr_parsequerystring_slashesdenotehost

  I didn't know this, but url.parse takes a 3rd
  argument which interprets "//foo.com" as the hostname,
  but without the protocol. by default, // is interpreted
  as the path.

  that lets us do what the wsurl module does.
  https://www.npmjs.com/package/wsurl

  but most of the time, I want to write js
  that will work on localhost, and will work
  on a server...

  so I want to just do createWebSocket('/')
  and get "ws://mydomain.com/"

  */

  var url = URL.parse(url, false, true)

  var proto
  if(url.protocol) proto = url.protocol
  else {
    proto = location.protocol ? location.protocol.replace(/:$/,'') : 'http'
    proto = ((protocolMap)[proto] || defaultProtocol || proto) + ':'
  }

  //handle quirk in url package
  if(url.host && url.host[0] === ':')
    url.host = null

  //useful for websockets
  if(url.hostname) {
    return URL.format({
      protocol: proto,
      slashes: true,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search
    })
  }
  else url.host = location.host

  //included for completeness. would you want to do this?
  if(url.port) {
    return URL.format({
      protocol: proto,
      slashes: true,
      host: location.hostname + ':' + url.port,
      port: url.port,
      pathname: url.pathname,
      search: url.search
    })
  }

  //definately useful for websockets
  if(url.pathname) {
    return URL.format({
      protocol: proto,
      slashes: true,
      host: url.host,
      pathname: url.pathname,
      search: url.search
    })
  }
  else
    url.pathname = location.pathname

  //included for completeness. would you want to do this?
  if(url.search) {
    return URL.format({
      protocol: proto,
      slashes: true,
      host: url.host,
      pathname: url.pathname,
      search: url.search
    })
  }
  else url.search = location.search

  return url.format(url)
}





