/* @flow */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const pull = require('pull-stream')
const path = require('path')
const utils = require('interface-datastore').utils
const rimraf = require('rimraf')
const each = require('async/each')
const MountStore = require('datastore-core').MountDatastore
const Key = require('interface-datastore').Key
const CID = require('cids')

const LevelStore = require('../src')

describe('LevelDatastore', () => {
  describe('interface-datastore (leveldown)', () => {
    const dir = utils.tmpdir()
    require('interface-datastore/src/tests')({
      setup (callback) {
        callback(null, new LevelStore(dir, {
          db: require('leveldown')
        }))
      },
      teardown (callback) {
        rimraf(dir, callback)
      }
    })
  })

  describe('interface-datastore (mount(leveldown, leveldown, leveldown))', () => {
    const dirs = [
      utils.tmpdir(),
      utils.tmpdir(),
      utils.tmpdir()
    ]

    require('interface-datastore/src/tests')({
      setup (callback) {
        callback(null, new MountStore([{
          prefix: new Key('/a'),
          datastore: new LevelStore(dirs[0], {
            db: require('leveldown')
          })
        }, {
          prefix: new Key('/q'),
          datastore: new LevelStore(dirs[1], {
            db: require('leveldown')
          })
        }, {
          prefix: new Key('/z'),
          datastore: new LevelStore(dirs[2], {
            db: require('leveldown')
          })
        }]))
      },
      teardown (callback) {
        each(dirs, rimraf, callback)
      }
    })
  })

  it.skip('interop with go', (done) => {
    const store = new LevelStore(path.join(__dirname, 'test-repo', 'datastore'), {
      db: require('leveldown')
    })

    pull(
      store.query({}),
      pull.map((e) => {
        // console.log('=======')
        // console.log(e)
        // console.log(e.key.toBuffer().toString())
        return new CID(1, 'dag-cbor', e.key.toBuffer())
      }),
      pull.collect((err, cids) => {
        expect(err).to.not.exist()
        expect(cids[0].version).to.be.eql(0)
        expect(cids).to.have.length(4)
        done()
      })
    )
  })
})
