/* @flow */
/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const pull = require('pull-stream')
const series = require('async/series')
const parallel = require('async/parallel')
const map = require('async/map')
const each = require('async/each')
const crypto = require('crypto')

const Key = require('../src').Key

/* ::
import type {Datastore, Callback} from '../src'
type Test = {
  setup: (cb: Callback<Datastore<Buffer>>) => void;
  teardown: (cb: Callback<void>) => void;
}
*/

const check = (s) => {
  if (s == null) {
    throw new Error('missing store')
  }
  return s
}

module.exports = (test/* : Test */) => {
  const cleanup = (store, done) => {
    series([
      (cb) => check(store).close(cb),
      (cb) => test.teardown(cb)
    ], done)
  }

  describe('put', () => {
    let store

    beforeEach((done) => {
      test.setup((err, s) => {
        if (err) {
          throw err
        }
        store = s
        done()
      })
    })

    afterEach((done) => {
      cleanup(store, done)
    })

    it('simple', (done) => {
      const k = new Key('/z/one')
      check(store).put(k, Buffer.from('one'), done)
    })

    it('parallel', (done) => {
      const data = []
      for (let i = 0; i < 100; i++) {
        data.push([new Key(`/z/key${i}`), Buffer.from(`data${i}`)])
      }

      each(data, (d, cb) => {
        check(store).put(d[0], d[1], cb)
      }, (err) => {
        expect(err).to.not.exist()
        map(data, (d, cb) => {
          check(store).get(d[0], cb)
        }, (err, res) => {
          expect(err).to.not.exist()
          res.forEach((res, i) => {
            expect(res).to.be.eql(data[i][1])
          })
          done()
        })
      })
    })
  })

  describe('get', () => {
    let store

    beforeEach((done) => {
      test.setup((err, s) => {
        if (err) {
          throw err
        }
        store = s
        done()
      })
    })

    afterEach((done) => {
      cleanup(store, done)
    })

    it('simple', (done) => {
      const k = new Key('/z/one')
      series([
        (cb) => check(store).put(k, Buffer.from('hello'), cb),
        (cb) => check(store).get(k, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.be.eql(Buffer.from('hello'))
          cb()
        })
      ], done)
    })

    it('should return error with missing key', (done) => {
      const k = new Key('/does/not/exist')
      check(store).get(k, (err) => {
        expect(err).to.exist()
        expect(err).to.have.property('code', 'ERR_NOT_FOUND')
        done()
      })
    })
  })

  describe('delete', () => {
    let store

    beforeEach((done) => {
      test.setup((err, s) => {
        if (err) {
          throw err
        }
        store = s
        done()
      })
    })

    afterEach((done) => {
      cleanup(store, done)
    })

    it('simple', (done) => {
      const k = new Key('/z/one')
      series([
        (cb) => check(store).put(k, Buffer.from('hello'), cb),
        (cb) => check(store).get(k, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.be.eql(Buffer.from('hello'))
          cb()
        }),
        (cb) => check(store).delete(k, cb),
        (cb) => check(store).has(k, (err, exists) => {
          expect(err).to.not.exist()
          expect(exists).to.be.eql(false)
          cb()
        })
      ], done)
    })

    it('parallel', (done) => {
      const data = []
      for (let i = 0; i < 100; i++) {
        data.push([new Key(`/a/key${i}`), Buffer.from(`data${i}`)])
      }

      series([
        (cb) => each(data, (d, cb) => {
          check(store).put(d[0], d[1], cb)
        }, cb),
        (cb) => map(data, (d, cb) => {
          check(store).has(d[0], cb)
        }, (err, res) => {
          expect(err).to.not.exist()
          res.forEach((res, i) => {
            expect(res).to.be.eql(true)
          })
          cb()
        }),
        (cb) => each(data, (d, cb) => {
          check(store).delete(d[0], cb)
        }, cb),
        (cb) => map(data, (d, cb) => {
          check(store).has(d[0], cb)
        }, (err, res) => {
          expect(err).to.not.exist()
          res.forEach((res, i) => {
            expect(res).to.be.eql(false)
          })
          cb()
        })
      ], done)
    })
  })

  describe('batch', () => {
    let store

    beforeEach((done) => {
      test.setup((err, s) => {
        if (err) {
          throw err
        }
        store = s
        done()
      })
    })

    afterEach((done) => {
      cleanup(store, done)
    })

    it('simple', (done) => {
      const b = check(store).batch()

      series([
        (cb) => check(store).put(new Key('/z/old'), Buffer.from('old'), cb),
        (cb) => {
          b.put(new Key('/a/one'), Buffer.from('1'))
          b.put(new Key('/q/two'), Buffer.from('2'))
          b.put(new Key('/q/three'), Buffer.from('3'))
          b.delete(new Key('/z/old'))
          b.commit(cb)
        },
        (cb) => map(
          ['/a/one', '/q/two', '/q/three', '/z/old'],
          (k, cb) => check(store).has(new Key(k), cb),
          (err, res) => {
            expect(err).to.not.exist()
            expect(res).to.be.eql([true, true, true, false])
            cb()
          }
        )
      ], done)
    })

    it('many (3 * 400)', function (done) {
      this.timeout(20 * 1000)
      const b = check(store).batch()
      const count = 400
      for (let i = 0; i < count; i++) {
        b.put(new Key(`/a/hello${i}`), crypto.randomBytes(32))
        b.put(new Key(`/q/hello${i}`), crypto.randomBytes(64))
        b.put(new Key(`/z/hello${i}`), crypto.randomBytes(128))
      }

      series([
        (cb) => b.commit(cb),
        (cb) => parallel([
          (cb) => pull(check(store).query({prefix: '/a'}), pull.collect(cb)),
          (cb) => pull(check(store).query({prefix: '/z'}), pull.collect(cb)),
          (cb) => pull(check(store).query({prefix: '/q'}), pull.collect(cb))
        ], (err, res) => {
          expect(err).to.not.exist()
          expect(res[0]).to.have.length(count)
          expect(res[1]).to.have.length(count)
          expect(res[2]).to.have.length(count)
          cb()
        })
      ], done)
    })
  })

  describe('query', () => {
    let store
    const hello = {key: new Key('/q/1hello'), value: Buffer.from('1')}
    const world = {key: new Key('/z/2world'), value: Buffer.from('2')}
    const hello2 = {key: new Key('/z/3hello2'), value: Buffer.from('3')}
    const filter1 = (entry, cb) => {
      cb(null, !entry.key.toString().endsWith('hello'))
    }

    const filter2 = (entry, cb) => {
      cb(null, entry.key.toString().endsWith('hello2'))
    }

    const order1 = (res, cb) => {
      cb(null, res.sort((a, b) => {
        if (a.value.toString() < b.value.toString()) {
          return -1
        }
        return 1
      }))
    }

    const order2 = (res, cb) => {
      const out = res.sort((a, b) => {
        if (a.value.toString() < b.value.toString()) {
          return 1
        }
        if (a.value.toString() > b.value.toString()) {
          return -1
        }
        return 0
      })

      cb(null, out)
    }

    const tests = [
      ['empty', {}, [hello, world, hello2]],
      ['prefix', {prefix: '/z'}, [world, hello2]],
      ['1 filter', {filters: [filter1]}, [world, hello2]],
      ['2 filters', {filters: [filter1, filter2]}, [hello2]],
      ['limit', {limit: 1}, 1],
      ['offset', {offset: 1}, 2],
      ['keysOnly', {keysOnly: true}, [{key: hello.key}, {key: world.key}, {key: hello2.key}]],
      ['1 order (1)', {orders: [order1]}, [hello, world, hello2]],
      ['1 order (reverse 1)', {orders: [order2]}, [hello2, world, hello]]
    ]

    before((done) => {
      test.setup((err, s) => {
        if (err) {
          throw err
        }
        store = s

        const b = check(store).batch()

        b.put(hello.key, hello.value)
        b.put(world.key, world.value)
        b.put(hello2.key, hello2.value)

        b.commit(done)
      })
    })

    after((done) => {
      cleanup(store, done)
    })

    tests.forEach((t) => it(t[0], (done) => {
      pull(
        check(store).query(t[1]),
        pull.collect((err, res) => {
          expect(err).to.not.exist()
          const expected = t[2]
          if (Array.isArray(expected)) {
            if (t[1].orders == null) {
              expect(res).to.have.length(expected.length)
              const s = (a, b) => {
                if (a.key.toString() < b.key.toString()) {
                  return 1
                } else {
                  return -1
                }
              }
              res = res.sort(s)
              const exp = expected.sort(s)

              res.forEach((r, i) => {
                expect(r.key.toString()).to.be.eql(exp[i].key.toString())

                if (r.value == null) {
                  expect(exp[i].value).to.not.exist()
                } else {
                  expect(r.value.equals(exp[i].value)).to.be.eql(true)
                }
              })
            } else {
              expect(res).to.be.eql(t[2])
            }
          } else if (typeof expected === 'number') {
            expect(res).to.have.length(expected)
          }
          done()
        })
      )
    }))
  })

  describe('lifecycle', () => {
    let store
    before((done) => {
      test.setup((err, s) => {
        if (err) {
          throw err
        }
        store = s
        done()
      })
    })

    after((done) => {
      cleanup(store, done)
    })

    it('close and open', (done) => {
      series([
        (cb) => check(store).close(cb),
        (cb) => check(store).open(cb),
        (cb) => check(store).close(cb),
        (cb) => check(store).open(cb)
      ], done)
    })
  })
}
