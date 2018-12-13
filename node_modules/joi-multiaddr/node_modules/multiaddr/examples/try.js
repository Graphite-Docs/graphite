'use strict'

var multiaddr = require('../src')
var log = console.log

var addr = multiaddr('/ip4/127.0.0.1/udp/1234')
log(addr)
log(addr.buffer)
log(addr.toString())
log(multiaddr(addr.buffer))

log(addr.protoCodes())
log(addr.protoNames())
log(addr.protos())

log(addr.nodeAddress())
log(multiaddr.fromNodeAddress(addr.nodeAddress(), 'udp'))
// addr = multiaddr.fromStupidString("udp4://127.0.0.1:1234")

log(addr.encapsulate('/sctp/5678'))
log(addr.decapsulate('/udp'))

var printer = multiaddr('/ip4/192.168.0.13/tcp/80')
var proxy = multiaddr('/ip4/10.20.30.40/tcp/443')
var printerOverProxy = proxy.encapsulate(printer)
log(printerOverProxy)

var proxyAgain = printerOverProxy.decapsulate('/ip4')
log(proxyAgain)
