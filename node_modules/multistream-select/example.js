'use strict'

const multistream = require('multistream-select')
const Connection = require('interface-connection').Connection

const listener = new multistream.Listener()
// or
// const dialer = new multistream.Dialer()

// supply a connection
const conn = new Connection()

// apply the multistream to the conn
listener.handle(conn, () => {
  console.log('connection established')
})
