/*jslint maxlen: 130 */
/*global describe, it */

'use strict';
var assert = require('chai').assert,
    RouteParser = require('../');


describe('Route', function() {
  it('should create', function() {
    assert.ok(RouteParser('/foo'));
  });

  it('should throw on no spec',function() {
    assert.throw(function(){ RouteParser(); }, Error, /spec is required/);
  });

  describe('basic', function() {
    it('should match /foo with a path of /foo', function() {
      var route = RouteParser('/foo');
      assert.ok(route.match('/foo'));
    });

    it('should match /foo with a path of /foo?query',function() {
      var route = RouteParser('/foo');
      assert.ok(route.match('/foo?query'));
    });

    it('shouldn\'t match /foo with a path of /bar/foo', function() {
      var route = RouteParser('/foo');
      assert.notOk(route.match('/bar/foo'));
    });

    it('shouldn\'t match /foo with a path of /foobar', function() {
      var route = RouteParser('/foo');
      assert.notOk(route.match('/foobar'));
    });

    it('shouldn\'t match /foo with a path of /bar', function() {
      var route = RouteParser('/foo');
      assert.notOk(route.match('/bar'));
    });
  });

  describe('basic parameters', function() {
    it('should match /users/:id with a path of /users/1', function() {
      var route = RouteParser('/users/:id');
      assert.ok(route.match('/users/1'));
    });

    it('should not match /users/:id with a path of /users/', function() {
      var route = RouteParser('/users/:id');
      assert.notOk(route.match('/users/'));
    });

    it('should match /users/:id with a path of /users/1 and get parameters', function() {
      var route = RouteParser('/users/:id');
      assert.deepEqual(route.match('/users/1'), {id: '1'});
    });

    it('should match deep pathing and get parameters', function() {
      var route = RouteParser('/users/:id/comments/:comment/rating/:rating');
      assert.deepEqual(route.match('/users/1/comments/cats/rating/22222'), {id: '1', comment: 'cats', rating: '22222'});
    });
  });

  describe('splat parameters', function() {
    it('should handle double splat parameters', function() {
      var route = RouteParser('/*a/foo/*b');
      assert.deepEqual(route.match('/zoo/woo/foo/bar/baz'), {a: 'zoo/woo', b: 'bar/baz'});
    });
  });

  describe('mixed', function() {
    it('should handle mixed splat and named parameters', function() {
      var route = RouteParser('/books/*section/:title');
      assert.deepEqual(
        route.match('/books/some/section/last-words-a-memoir'),
        {section: 'some/section', title: 'last-words-a-memoir'}
      );
    });
  });

  describe('optional', function() {
    it('should allow and match optional routes', function() {
      var route = RouteParser('/users/:id(/style/:style)');
      assert.deepEqual(route.match('/users/3'), {id: '3', style: undefined});
    });

    it('should allow and match optional routes', function() {
      var route = RouteParser('/users/:id(/style/:style)');
      assert.deepEqual(route.match('/users/3/style/pirate'), {id: '3', style: 'pirate'});
    });

    it('allows optional branches that start with a word character', function() {
      var route = RouteParser('/things/(option/:first)');
      assert.deepEqual(route.match('/things/option/bar'), {first: 'bar'});
    });

    describe('nested', function() {
      it('allows nested', function() {
        var route = RouteParser('/users/:id(/style/:style(/more/:param))');
        var result = route.match('/users/3/style/pirate');
        var expected = {id: '3', style: 'pirate', param: undefined};
        assert.deepEqual(result, expected);
      });

      it('fetches the correct params from nested', function() {
        var route = RouteParser('/users/:id(/style/:style(/more/:param))');
        assert.deepEqual(route.match('/users/3/style/pirate/more/things'), {id: '3', style: 'pirate', param: 'things'});
      });
    });
  });

  describe('reverse', function(){
    it('reverses routes without params', function() {
      var route = RouteParser('/foo');
      assert.equal(route.reverse(),'/foo');
    });

    it('reverses routes with simple params', function() {
      var route = RouteParser('/:foo/:bar');
      assert.equal(route.reverse({foo: '1', bar: '2'}), '/1/2');
    });

    it('reverses routes with optional params', function() {
      var route = RouteParser('/things/(option/:first)');
      assert.equal(route.reverse({first: 'bar'}), '/things/option/bar');
    });

    it('reverses routes with unfilled optional params', function() {
      var route = RouteParser('/things/(option/:first)');
      assert.equal(route.reverse(), '/things/');
    });

    it('reverses routes with optional params that can\'t fulfill the optional branch', function() {
      var route = RouteParser('/things/(option/:first(/second/:second))');
      assert.equal(route.reverse({second: 'foo'}), '/things/');
    });

    it('returns false for routes that can\'t be fulfilled', function() {
      var route = RouteParser('/foo/:bar');
      assert.equal(route.reverse({}),false);
    });
    it('returns false for routes with splat params that can\'t be fulfilled', function() {
      var route = RouteParser('/foo/*bar');
      assert.equal(route.reverse({}),false);
    });
  });
});
