/* global describe, beforeEach, it, afterEach */
var SplitStream = require('../')
var testUtil = require('../test-util')
var should = require('should')

describe('SplitStream', function(){
  var ss, ss2, w, w2
  beforeEach(function() {
    ss = new SplitStream('\r\n', { objectMode:true })
    ss2 = new SplitStream('----', { objectMode:true })
    w = function() {
      Array.prototype.slice.call(arguments).forEach(function(foo) {
        ss.write(Buffer(foo))
      })
    }
    w2 = function() {
      Array.prototype.slice.call(arguments).forEach(function(foo) {
        ss2.write(Buffer(foo))
      })
    }
  })
  it('is a Class', function() {
    ss.should.be.instanceof(SplitStream)
  })
  it('keeps given deliminator as a member array of char codes', function() {
    should.exist(ss.delim)
    ss.delim.should.includeEql('\r'.charCodeAt())
    ss.delim.should.includeEql('\n'.charCodeAt())
  })
  it('works with String chunks', function() {
    ss.write('foo\r\n')
    testUtil.shouldStreamDataTimes(ss, ['foo'])
  })
  it('works with Buffer chunks', function() {
    ss.write(Buffer('foo\r\n'))
    testUtil.shouldStreamDataTimes(ss, ['foo'])
  })

  describe('makes a stream output messages by breaking its data flow on a given deliminator of any length', function(){
    it('1 char deliminator \\n', function(done) {
      var ss = new SplitStream('\n', {objectMode:true})
      ss.end(Buffer('foo\nbar\n'))
      testUtil.shouldStreamDataTimes(ss, ['foo', 'bar'], done)
    })
    it('2 char deliminator \\r\\n', function(done) {
      var ss = new SplitStream('\r\n', {objectMode:true})
      ss.end(Buffer('foo\r\nbar\r\n'))
      testUtil.shouldStreamDataTimes(ss, ['foo', 'bar'], done)
    })
    it('3 char deliminator \\r\\n\\n', function(done) {
      var ss = new SplitStream('\r\n\n', {objectMode:true})
      ss.end(Buffer('foo\r\n\nbar\r\n\n'))
      testUtil.shouldStreamDataTimes(ss, ['foo', 'bar'], done)
    })
  })

  describe('handles deliminators oddly positioned', function(){
    it('preceding is ignored', function(done) {
      w('\r\nfoo\r\n')
      testUtil.shouldStreamDataTimes(ss, ['foo'], done)
      ss.end()
    })
    it('trailing is ignored', function(done) {
      w('foo\r\n\r\n')
      testUtil.shouldStreamDataTimes(ss, ['foo'], done)
      ss.end()
    })
    it('back-to-back is ignored', function(done) {
      w('foo\r\n\r\n\r\nbar\r\n')
      testUtil.shouldStreamDataTimes(ss, ['foo', 'bar'], done)
      ss.end()
    })
    it('back-to-back across chunks is ignored', function(done) {
      w('foo\r', '\n\r\nbar\r','\n')
      testUtil.shouldStreamDataTimes(ss, ['foo', 'bar'], done)
      ss.end()
    })
    it('starting in one chunk and ending in another', function(done) {
      w('foo\r', '\nbar\r\nz', 'e', 'd\r\nhau', '\r\nrai\r', 'tri\r\n')
      testUtil.shouldStreamDataTimes(ss, ['foo','bar','zed', 'hau', 'rai\rtri'])
      setTimeout(done, 5)
    })
  })

  describe('handles deliminator false positives', function() {
    it('trailing', function(done) {
      w('foo\r\nbar\r','zed\r\r\n', 'foo\r','\nbar\r')
      ss.end()
      testUtil.shouldStreamDataTimes(ss, ['foo','bar\rzed\r','foo','bar\r'], done)
    })
    it('preceding', function(done) {
      w('\rfoo\r\nbar\r','\rfoo\r','\nbar')
      ss.end()
      testUtil.shouldStreamDataTimes(ss, ['\rfoo','bar\r\rfoo','bar'], done)
    })
    it('interspersed', function(done) {
      w('foo\rbar\r','\rfo\ro','ba\rr\r')
      testUtil.shouldStreamDataTimes(ss, ['foo\rbar\r\rfo\roba\rr\r'])
      w2('5---', '4', '----4', '---3')
      testUtil.shouldStreamDataTimes(ss2, ['5---4', '4---3'])
      setTimeout(done, 5)
    })
  })

  describe('edge cases', function() {
    it('input without deliminators should still get output', function(done) {
      w2('foo', 'bar')
      testUtil.shouldStreamDataTimes(ss2, ['foobar'])
      w('foo')
      testUtil.shouldStreamDataTimes(ss, ['foo'])
      setTimeout(done, 5)
    })
    it('input of only deliminators should not be output', function(done) {
      w('\r\n','\r\n\r\n','\r\n')
      var i=0
      ss.on('data', function() { i++ })
      ss.end(function() { i.should.equal(0); done() })
    })
  })

  afterEach(function() {
    ss.end()
    ss2.end()
  })
})
