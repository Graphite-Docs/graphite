/* @flow */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const memdown = require('memdown')
const LevelDown = require('leveldown')
const eachSeries = require('async/eachSeries')

const LevelStore = require('../src')

describe('LevelDatastore', () => {
  describe('initialization', () => {
    it('should default to a leveldown database', (done) => {
      const levelStore = new LevelStore('init-default')

      levelStore.open((err) => {
        expect(err).to.not.exist()
        expect(levelStore.db.db.db instanceof LevelDown).to.equal(true)
        expect(levelStore.db.options).to.include({
          createIfMissing: true,
          errorIfExists: false
        })
        expect(levelStore.db.db.codec.opts).to.include({
          valueEncoding: 'binary'
        })
        done()
      })
    })

    it('should be able to override the database', (done) => {
      const levelStore = new LevelStore('init-default', {
        db: memdown,
        createIfMissing: true,
        errorIfExists: true
      })

      levelStore.open((err) => {
        expect(err).to.not.exist()
        expect(levelStore.db.db.db instanceof memdown).to.equal(true)
        expect(levelStore.db.options).to.include({
          createIfMissing: true,
          errorIfExists: true
        })
        done()
      })
    })
  })

  eachSeries([
    memdown,
    LevelDown
  ], (database) => {
    describe(`interface-datastore ${database.name}`, () => {
      require('interface-datastore/src/tests')({
        setup (callback) {
          callback(null, new LevelStore('datastore-test', {db: database}))
        },
        teardown (callback) {
          memdown.clearGlobalStore()
          callback()
        }
      })
    })
  }, (err) => {
    expect(err).to.not.exist()
  })
})
