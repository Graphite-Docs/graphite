# WebSocketStar Protocol

Note: The socket.io events and the [socket.io-pull-stream module](https://github.com/mkg20001/socket.io-pull-stream/blob/master/PROTOCOL.md) used in this protocol have their own spec.

## Types

- `multiaddr`: A valid multiaddr transfered as string
- `string`: Any arbitrary alphanumeric string
- `function`: A socket.io callback function
- `sio-pull`: socket.io-pull-stream

## Events

 - `ss-join`: types `multiaddr, string (base64 encoded libp2p-crypto pubKey or hex encoded challenge response), function`, names: `address, data, cb` (client -> server)
The client emits this event after a successfull connection was established over the socket.io protocol.
The second argument is not set if the client wasn't passed an id for the crypto challenge

Server:

 - recieves event, validates data
 - if (strictMultiaddr)
   - validate if multiaddr format matches the WebSocketStar format using [mafmt](https://npm.im/mafmrt)
 - if (!cryptoChallenge)
   - _goto "finalize"_
 - else
   - if the client has not been assigned a challenge nonce
     - parse public key `data` and generate nonce
     - match the id of the public key with the id supplied in the multiaddr `address`
     - store both using the socket.id as key
     - respond with `cb(null, nonce)`
   - else if the client _has_ been assigned a challenge nonce
     - validate the hex encoded signature of `nonce` using the stored public key
     - clear the nonce
     - if no error occured _goto "finalize"_

 - finalize:
   - start sending peers using `ws-peer` every 10s
   - add the address to the list of addresses the client is allowed to use as the source address
   - respond with `cb()`

Client:
 - send event, wait for cb to get called (`cb(error, nonce)`)
 - if (error)
   - return error via callback (`cb(new Error(error)`)
 - if (nonce)
   - sign nonce using private key, re-emit event, wait for cb to get called (`cb(error)`)
   - if (error)
     - return error via callback (`cb(new Error(error)`)
   - else _goto "success"_
 - else _goto "success"_

 - success:
   - re-execute the crypto challenge on the `reconnect` event
   - attach all other events
   - start to accept dials
   - return `cb()`

 - `ss-leave`: types `multiaddr`, names: `address` (client -> server)
The client emits this event when the `.close()` function on the listener is called

Server:
 - recieves event, validates data
 - if client has previously successfully registered address `address`
   - remove that address from the client
   - stop sending peers to that client

 - `disconnect` is being handled as if a leave for all addresses was issued

 - `ss-dial`: types `multiaddr, multiaddr, string, function`, names: `from, to, dialId, cb` (client -> server)

Server:
 - if peer A can not use `from` as source address (if it hasn't registered it), call cb with an error
 - if peer A `to` is not online, call cb with an error
 - create a sio-pull proxy for `dialId + '.dialer'` from peer A to peer B
 - emit `ss-incomming(dialId, from, cb)` on peer B and wait for cb to get called (`cb(err)`)
   - if (err) call previous cb with error
   - create a sio-pull proxy for `dialId + '.listener'` from peer B to peer A
   - return `cb()`

Client:
 - generate `dialId` nonce
 - create a sio-pull sink for `dialId + '.dialer'`
 - create a new `Connection` `conn`
 - emit `ss-dial(from, to, dialId, cb)` and wait for cb to get called (`cb(err)`)
   - if (err) return `cb(err)`
   - create a source for `dialId + '.listener'`
   - call `conn.setInnerConn({ sink, source }, { getObservedAddrs: cb => cb(null, [to]) })`
   - return `cb(null, conn)`
 - return `conn`

 - `ss-incomming`: types `string, multiaddr, cb`, names: `dialId, from, cb` (server -> client)
The server emits this event after it recieves a valid `ss-dial` from another client

Client:
 - recieves event, validates data
 - create a sio-pull source for `dialId + '.dialer'`
 - create a sio-pull sink for `dialId + '.listener'`
 - create a new `Connection` `conn`
 - call `conn.setInnerConn({ sink, source }, { getObservedAddrs: cb => cb(null, [from]) })`
 - emits connection event
 - calls `handler(conn)`

 - `ws-peer`: types `multiaddr`, names `address` (server -> client)
The server emits this event every 10s to announce all currently online peers to the client

Client:
 - recieves event, validates data
 - creates peer id and peer info from address
 - emits peer event with generated peer info


