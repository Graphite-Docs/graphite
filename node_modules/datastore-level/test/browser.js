/* @flow */
/* eslint-env mocha */
'use strict'

const each = require('async/each')
const MountStore = require('datastore-core').MountDatastore
const Key = require('interface-datastore').Key

// leveldown will be swapped for level-js
const leveljs = require('leveldown')

const LevelStore = require('../src')

describe('LevelDatastore', () => {
  describe('interface-datastore (leveljs)', () => {
    require('interface-datastore/src/tests')({
      setup (callback) {
        callback(null, new LevelStore('hello', {db: leveljs}))
      },
      teardown (callback) {
        leveljs.destroy('hello', callback)
      }
    })
  })

  describe('interface-datastore (mount(leveljs, leveljs, leveljs))', () => {
    require('interface-datastore/src/tests')({
      setup (callback) {
        callback(null, new MountStore([{
          prefix: new Key('/a'),
          datastore: new LevelStore('one', {db: leveljs})
        }, {
          prefix: new Key('/q'),
          datastore: new LevelStore('two', {db: leveljs})
        }, {
          prefix: new Key('/z'),
          datastore: new LevelStore('three', {db: leveljs})
        }]))
      },
      teardown (callback) {
        each(['one', 'two', 'three'], leveljs.destroy.bind(leveljs), callback)
      }
    })
  })
})
