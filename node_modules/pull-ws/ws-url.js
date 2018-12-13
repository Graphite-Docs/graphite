var rurl = require('relative-url')
var map = {http:'ws', https:'wss'}
var def = 'ws'
module.exports = function (url, location) {
  return rurl(url, location, map, def)
}


