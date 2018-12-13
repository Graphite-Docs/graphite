/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */

'use strict'

const clients = require('./util').default()
const uuid = require('uuid')
const pull = require('pull-stream')

describe('disconnect', () => {
  it('should end stream on disconnect', cb => {
    clients.one((err, res) => {
      if (err) return cb(err)
      const [c] = res
      pull(
        c.createSource(uuid()),
        pull.collect(cb)
      )
      c.disconnect()
    })
  })
})
