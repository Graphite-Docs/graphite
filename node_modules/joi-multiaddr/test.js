const test = require('ava')
const Joi = require('joi').extend(require('./'))
const Multiaddr = require('multiaddr')

test('should validate invalid values', (t) => {
  const inputs = [
    847564,
    true,
    {},
    []
  ]

  inputs.forEach(input => {
    const result = Joi.multiaddr().validate(input)
    t.is(result.error.message, '"value" addr must be a string, Buffer, or another Multiaddr')
    t.is(result.value, input, 'value was correct')
  })
})

test('should allow undefined unless required()', (t) => {
  const input = undefined
  let result = Joi.multiaddr().validate(input)
  t.ifError(result.error, 'no error validating')
  t.is(result.value, input, 'value was correct')

  result = Joi.multiaddr().required().validate(input)
  t.is(result.error.message, '"value" is required')
  t.is(result.value, input, 'value was correct')
})

test('should not allow null unless allow(null)', (t) => {
  const input = null
  let result = Joi.multiaddr().validate(input)
  t.is(result.error.message, '"value" addr must be a string, Buffer, or another Multiaddr')
  t.is(result.value, input, 'value was correct')

  result = Joi.multiaddr().allow(null).validate(input)
  t.ifError(result.error, 'no error validating')
  t.is(result.value, input, 'value was correct')
})

test('should parse to Multiaddr', (t) => {
  const input = '/ip4/127.0.0.1/tcp/1337'
  const result = Joi.multiaddr().validate(input)
  t.ifError(result.error, 'no error validating')
  t.true(Multiaddr.isMultiaddr(result.value))
  t.is(result.value.toString(), input)
})

test('should validate valid formats', (t) => {
  const inputs = [
    ['DNS', '/dnsaddr/ipfs.io/tcp/80'],
    ['DNS4', '/dns4/libp2p.io'],
    ['DNS6', '/dns6/protocol.ai'],
    ['IP', '/ip4/0.0.0.0'],
    ['TCP', '/ip4/0.0.7.6/tcp/1234'],
    ['UDP', '/ip4/0.0.7.6/udp/1234'],
    ['UTP', '/ip4/1.2.3.4/udp/3456/utp'],
    ['WebSockets', '/dnsaddr/ipfs.io/ws'],
    ['WebSocketsSecure', '/ip4/1.2.3.4/tcp/3456/wss'],
    // ['HTTP', '/dns4/foo.com/tcp/80/http/baz.jpg'],
    ['WebRTCStar', '/dnsaddr/ipfs.io/ws/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4'],
    ['WebSocketStar', '/ip6/::/tcp/0/ws/p2p-websocket-star'],
    ['WebRTCDirect', '/ip4/1.2.3.4/tcp/3456/http/p2p-webrtc-direct'],
    ['Reliable', '/ip4/1.2.3.4/tcp/3456/wss'],
    ['Circuit', '/p2p-circuit/ipfs/QmddWMcQX6orJGHpETYMyPgXrCXCtYANMFVDCvhKoDwLqA'],
    ['IPFS', '/ip4/1.2.3.4/tcp/3456/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4']
  ]

  inputs.forEach(input => {
    const result = Joi.multiaddr()[input[0]]().validate(input[1])
    t.ifError(result.error, 'no error validating')
    t.true(Multiaddr.isMultiaddr(result.value))
    t.is(result.value.toString(), input[1])
  })
})

test('should validate invalid formats', (t) => {
  const inputs = [
    ['DNS', '/ip4/127.0.0.1'],
    ['DNS4', '/ip4/127.0.0.1'],
    ['DNS6', '/ip4/127.0.0.1'],
    ['IP', '/ip4/0.0.0.0/tcp/555'],
    ['TCP', '/tcp/1234'],
    ['UDP', '/ip6/fc00::/tcp/5523/udp/9543'],
    ['UTP', '/ip4/0.0.0.0/tcp/12345/utp'],
    ['WebSockets', '/ip6/::/ip4/0.0.0.0/udp/1234/ws'],
    ['WebSocketsSecure', '/ip4/0.0.0.0/tcp/12345/udp/2222/wss'],
    ['Circuit', '/ip4/0.0.0.0/tcp/12345/udp/2222/wss']
  ]

  inputs.forEach(input => {
    const result = Joi.multiaddr()[input[0]]().validate(input[1])
    t.truthy(result.error, 'no error validating')
  })
})

test('should not convert if convert option is false', (t) => {
  const input = '/ip4/127.0.0.1'
  let result = Joi.multiaddr().options({ convert: false }).validate(input)
  t.ifError(result.error, 'no error validating')
  t.is(result.value, input, 'value was correct')
})
