/* global createUsers, databases, wait, compareAllUsers, fixAwaitingInType, getRandom, getRandomString, getRandomNumber, applyRandomTransactionsNoGCNoDisconnect, applyRandomTransactionsAllRejoinNoGC, applyRandomTransactionsWithGC, async, describeManyTimes */
/* eslint-env browser,jasmine */
'use strict'

var Y = require('../../yjs/src/SpecHelper.js')

require('./Richtext.js')(Y)
var Quill = require('quill')

/* remaining issues:
  * 0.03904764924295961 - (codeblock does not support italic) - remember to remove todo for code-block
*/

var numberOfYRichtextTests = 100
var repeatRichtextTests = 5

if (typeof window !== 'undefined') {
  for (let database of databases) {
    // if (database != 'memory') continue // TODO!!

    describe(`Richtext Type (DB: ${database})`, function () {
      var y1, y2, y3, yconfig1, yconfig2, yconfig3, flushAll // eslint-disable-line

      beforeEach(async(function * (done) {
        yield createUsers(this, 3, database)
        y1 = (yconfig1 = this.users[0]).share.root
        y2 = (yconfig2 = this.users[1]).share.root
        y3 = (yconfig3 = this.users[2]).share.root
        flushAll = Y.utils.globalRoom.flushAll
        yield wait(10)
        done()
      }))
      afterEach(async(function * (done) {
        yield compareAllUsers(this.users)
        done()
      }))
      it('Debug for Quill@^1.0.0', async(function * (done) {
        this.users[1].db.requestTransaction(function * asItShouldBe () {
          yield * this.store.tryExecute.call(this, {'id': ['_', 'Map_Map_root_'], 'map': {}, 'struct': 'Map', 'type': 'Map'})
          yield * this.store.tryExecute.call(this, {'start': null, 'end': null, 'struct': 'List', 'id': ['249', 1], 'type': 'Richtext'})
          yield * this.store.tryExecute.call(this, {'id': ['249', 0], 'left': null, 'right': null, 'origin': null, 'parent': ['_', 'Map_Map_root_'], 'parentSub': 'Richtext', 'struct': 'Insert', 'opContent': ['249', 1]})
          yield * this.store.tryExecute.call(this, {'id': ['251', 0], 'left': null, 'right': null, 'origin': null, 'parent': ['249', 1], 'struct': 'Insert', 'content': ['ü']})
          yield * this.store.tryExecute.call(this, {'target': ['250', 6], 'struct': 'Delete', 'length': 1})
          yield * this.store.tryExecute.call(this, {'id': ['250', 0], 'left': null, 'right': null, 'origin': null, 'parent': ['249', 1], 'struct': 'Insert', 'content': ['R']})
          yield * this.store.tryExecute.call(this, {'id': ['250', 1], 'left': ['250', 0], 'right': null, 'origin': ['250', 0], 'parent': ['249', 1], 'struct': 'Insert', 'content': ['N', 'N', 'N', 'N', 'N', 'N']})
          yield * this.store.tryExecute.call(this, {'struct': 'Delete', 'target': ['250', 6]})
        })

        this.users[2].db.requestTransaction(function * () {
          yield * this.store.tryExecute.call(this, {'id': ['_', 'Map_Map_root_'], 'map': {}, 'struct': 'Map', 'type': 'Map'})
          yield * this.store.tryExecute.call(this, {'struct': 'List', 'id': ['249', 1], 'type': 'Richtext'})
          yield * this.store.tryExecute.call(this, {'id': ['249', 0], 'left': null, 'right': null, 'origin': null, 'parent': ['_', 'Map_Map_root_'], 'struct': 'Insert', 'parentSub': 'Richtext', 'opContent': ['249', 1]})
          yield * this.store.tryExecute.call(this, {'struct': 'List', 'id': ['249', 1], 'type': 'Richtext'})
          yield * this.store.tryExecute.call(this, {'id': ['249', 0], 'left': null, 'right': null, 'origin': null, 'parent': ['_', 'Map_Map_root_'], 'struct': 'Insert', 'parentSub': 'Richtext', 'opContent': ['249', 1]})
          yield * this.store.tryExecute.call(this, {'struct': 'List', 'id': ['249', 1], 'type': 'Richtext'})
          yield * this.store.tryExecute.call(this, {'id': ['249', 0], 'left': null, 'right': null, 'origin': null, 'parent': ['_', 'Map_Map_root_'], 'struct': 'Insert', 'parentSub': 'Richtext', 'opContent': ['249', 1]})
          yield * this.store.tryExecute.call(this, {'left': null, 'origin': null, 'parent': ['249', 1], 'struct': 'Insert', 'content': ['R'], 'id': ['250', 0], 'right': null})
          yield * this.store.tryExecute.call(this, {'left': ['250', 0], 'origin': ['250', 0], 'parent': ['249', 1], 'struct': 'Insert', 'content': ['N', 'N', 'N', 'N', 'N', 'N'], 'id': ['250', 1], 'right': null})
          yield * this.store.tryExecute.call(this, {'target': ['250', 6], 'struct': 'Delete', 'length': 1})
          yield * this.store.tryExecute.call(this, {'id': ['251', 0], 'left': null, 'right': null, 'origin': null, 'parent': ['249', 1], 'struct': 'Insert', 'content': ['ü']})
        })

        yield flushAll()

        yield compareAllUsers([this.users[1], this.users[2]])
        done()
      }))
      describeManyTimes(repeatRichtextTests, `Random tests`, function () {
        function computeLengthWithoutLineEndings (e) {
          // TODO: remove this test, and just check if all quill-deltas are equal..
          return e.getText().split('\n')[0].length
        }
        var randomTextTransactions = [
          function insert (s) {
            var e = s.instances[0].editor
            e.insertText(getRandomNumber(computeLengthWithoutLineEndings(e)), getRandom([getRandomString(), '\n']))
          },
          function _delete (s) {
            var q = s.instances[0].editor
            var len = computeLengthWithoutLineEndings(q)
            var from = getRandomNumber(len)
            var delLength = Math.min(7, getRandomNumber(len - from))
            q.deleteText(from, delLength)
          },
          function select (s) {
            var q = s.instances[0].editor
            var len = computeLengthWithoutLineEndings(q)
            var from = getRandomNumber(len)
            var to = from + getRandomNumber(len - from)
            var attr, val
            if (getRandomNumber(2) === 1) {
              attr = getRandom(['bold', 'italic', 'strike'])
              val = getRandom([true, false])
            } else {
              attr = 'color'
              val = getRandom(['red', 'blue', 'green', false])
            }
            q.formatText(from, to, attr, val)
          }, function formatAlign (s) {
            var q = s.instances[0].editor
            var lines = q.getText().split('\n')
            // get random position for line format (compute random line -> compute index)
            var start = lines.slice(0, getRandomNumber(lines.length)).join('\n').length
            var length = Math.random(lines.join('\n').length - start - 1) + 1 // length is min 1
            var attr, val
            var choice = getRandomNumber(2) // TODO: 3
            switch (choice) {
              case 0:
                attr = 'align'
                val = getRandom([false, 'right', 'center'])
                break
              case 1:
                attr = 'list'
                val = getRandom(['ordered', 'bullet'])
                break
              case 2:
                attr = 'code-block'
                val = getRandom([true, false])
                break
            }
            q.formatLine(start, length, attr, val)
          }
        ]
        function compareValues (vals) {
          var firstContent
          for (var l of vals) {
            var e = l.instances[0].editor
            var content = e.getContents().ops
            // var yDelta = l.toDelta()
            // expect(content).toEqual(yDelta)
            if (firstContent == null) {
              firstContent = content
            } else {
              expect(content).toEqual(firstContent)
            }
          }
        }
        beforeEach(async(function * (done) {
          yield this.users[0].share.root.set('Richtext', Y.Richtext)
          yield flushAll()
          var promises = []
          for (var u = 0; u < this.users.length; u++) {
            promises.push(this.users[u].share.root.get('Richtext'))
          }
          this.texts = yield Promise.all(promises)
          for (var t of this.texts) {
            t.bind(new Quill(document.createElement('div')))
          }
          yield flushAll()
          done()
        }))
        it('arrays.length equals users.length', async(function * (done) {
          expect(this.texts.length).toEqual(this.users.length)
          done()
        }))
        it(`succeed after ${numberOfYRichtextTests} actions, no GC, no disconnect`, async(function * (done) {
          yield applyRandomTransactionsNoGCNoDisconnect(this.users, this.texts, randomTextTransactions, numberOfYRichtextTests)
          yield flushAll()
          yield Promise.all(this.texts.map(fixAwaitingInType))
          yield compareAllUsers(this.users)
          yield compareValues(this.texts)
          done()
        }))
        it(`succeed after ${numberOfYRichtextTests} actions, no GC, all users disconnecting/reconnecting`, async(function * (done) {
          yield applyRandomTransactionsAllRejoinNoGC(this.users, this.texts, randomTextTransactions, numberOfYRichtextTests)
          yield flushAll()
          yield Promise.all(this.texts.map(fixAwaitingInType))
          yield compareValues(this.texts)
          yield compareAllUsers(this.users)
          done()
        }))
        it(`succeed after ${numberOfYRichtextTests} actions, GC, user[0] is not disconnecting`, async(function * (done) {
          yield applyRandomTransactionsWithGC(this.users, this.texts, randomTextTransactions, numberOfYRichtextTests)
          yield flushAll()
          yield Promise.all(this.texts.map(fixAwaitingInType))
          yield compareAllUsers(this.users)
          yield compareValues(this.texts)
          done()
        }))
      })
    })
  }
}
