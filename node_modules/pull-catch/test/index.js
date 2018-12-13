var test = require('tape')
var S = require('pull-stream')
var Catch = require('../')

test('catch errors', function (t) {
    t.plan(2)
    S(
        S.error(new Error('test')),
        Catch(function onErr (err) {
            t.equal(err.message, 'test', 'should callback with error')
        }),
        S.collect(function (err, resp) {
            t.error(err, 'should end the stream without error')
        })
    )
})

test('return false to pass error', function (t) {
    t.plan(1)
    S(
        S.error(new Error('test')),
        Catch(function (err) {
            return false
        }),
        S.collect(function (err, res) {
            t.equal(err.message, 'test', 'should pass error in stream')
        })
    )
})

test('return truthy to emit one event then end', function (t) {
    t.plan(2)
    S(
        S.error(new Error('test')),
        Catch(function (err) {
            return 'test data'
        }),
        S.collect(function (err, res) {
            t.error(err, 'should not end with error')
            t.deepEqual(res, ['test data'], 'should emit one event')
        })
    )
})

test('callback is optional', function (t) {
    t.plan(1)
    S(
        S.error(new Error('test')),
        Catch(),
        S.collect(function (err, res) {
            t.error(err, 'should end stream without error')
        })
    )
})
