/*global describe, it */
'use strict';
var assert = require('chai').assert,
    RouteParser = require('../lib/route');

/* Route, path, expected params, options {name, reversed} */
var backboneTestCases =  [
  [
    'search/:query',
    'search/news',
    {query: 'news'},
    {name: 'simple'}
  ],
  [
    'search/:query',
    'search/тест',
    {query: 'тест'},
    {name: 'simple with unicode', reversed: 'search/%D1%82%D0%B5%D1%81%D1%82'}
  ],
  [
    'search/:query/p:page',
    'search/nyc/p10',
    {query: 'nyc', page: '10'},
    {name: 'two part'}
  ],
  [
    'splat/*args/end',
    'splat/long-list/of/splatted_99args/end',
    {args: 'long-list/of/splatted_99args'},
    {name: 'splats'}
  ],
  [
    ':repo/compare/*from...*to',
    'backbone/compare/1.0...braddunbar:with/slash',
    {repo: 'backbone', from: '1.0', to: 'braddunbar:with/slash'},
    {name: 'complicated mixed'}
  ],
  [
    'optional(/:item)',
    'optional',
    {item: undefined},
    {name: 'optional'}
  ],
  [
    'optional(/:item)',
    'optional/thing',
    {item: 'thing'},
    {name: 'optional with param'}
  ],
  [
    '*first/complex-*part/*rest',
    'one/two/three/complex-part/four/five/six/seven',
    {first: 'one/two/three', part: 'part',rest: 'four/five/six/seven'},
    {name: 'complex'}
  ],
  [
    '*first/complex-*part/*rest',
    'has%2Fslash/complex-has%23hash/has%20space',
    {first: 'has/slash', part: 'has#hash', rest: 'has space'},
    {
      name: 'backbone#967 decodes encoded values',
      reversed: 'has/slash/complex-has#hash/has%20space'
    }
  ],
  [
    '*anything',
    'doesnt-match-a-route',
    {anything: 'doesnt-match-a-route'},
    {name: 'anything'}
  ],
  [
    'decode/:named/*splat',
    'decode/a%2Fb/c%2Fd/e',
    {named: 'a/b', splat: 'c/d/e'},
    {name: 'decode named parameters, not splats', reversed: 'decode/a/b/c/d/e'}
  ],
  [
    'charñ',
    'char%C3%B1',
    false,
    {name: '#2666 - Hashes with UTF8 in them.', reversed: 'char%C3%B1'}
  ],
  [
    'charñ',
    'charñ',
    {},
    {name: '#2666 - Hashes with UTF8 in them.', reversed: 'char%C3%B1'}
  ],
  [
    'char%C3%B1',
    'charñ',
    false,
    {name: '#2666 - Hashes with UTF8 in them.', reversed: 'char%C3%B1'}
  ],
  [
    'char%C3%B1',
    'char%C3%B1',
    {},
    {name: '#2666 - Hashes with UTF8 in them.', reversed: 'char%C3%B1'}
  ],
  [
    '',
    '',
    {},
    {name: 'Allows empty route'}
  ],
  [
    'named/optional/(y:z)',
    'named/optional/y',
    false,
    {name: 'doesn\'t match an unfulfilled optional route'}
  ],
  [
    'some/(optional/):thing',
    'some/foo',
    {thing: 'foo'},
    {
      name: 'backbone#1980 optional with trailing slash',
      reversed: 'some/optional/foo'
    }
  ],
  [
    'some/(optional/):thing',
    'some/optional/foo',
    {thing: 'foo'},
    {name: 'backbone#1980 optional with trailing slash'}
  ],
  [
    'myyjä',
    'myyjä',
    {},
    {name: 'unicode pathname', reversed: 'myyj%C3%A4'}
  ],
  [
    'stuff\nnonsense',
    'stuff\nnonsense?param=foo%0Abar',
    {},
    {name: 'newline in route', reversed: 'stuff%0Anonsense'}
  ]
].map( function(testCase) {
  var routeSpec = testCase[0],
      path = testCase[1],
      captured = testCase[2],
      name = testCase[3].name,
      reversed = testCase[3].reversed || testCase[1];

  return function() {
    it(testCase[3].name, function() {
      var route = new RouteParser(routeSpec);
      assert.deepEqual(route.match(path), captured);
    });
    /* Only reverse routes we expected to succeed */
    if( captured ) {
      it( 'reverses ' + name, function() {
        var route = RouteParser(routeSpec);
        assert.equal(route.reverse(captured), reversed);
      });
    }
  };
});

describe('Backbone route compatibility', function() {
  for (var i = 0; i < backboneTestCases.length; i++) {
    backboneTestCases[i]();
  }
});