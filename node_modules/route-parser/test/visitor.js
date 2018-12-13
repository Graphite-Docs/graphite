/*jslint maxlen: 130 */
/*global describe, it */

'use strict';
var assert = require('chai').assert,
    createVisitor = require('../lib/route/visitors/create_visitor');

function sillyVisitor( node ) {
  return node.displayName;
}


describe('createVisitor', function() {
  it('should throw if not all handler node types are defined', function() {
    assert.throw(function() {
        createVisitor({Root: function(){}});
      },
      /No handler defined/
    );
  });

  it('should create when all handlers are defined',function() {
    var visitor = createVisitor({
      Root: function(node) { return 'Root(' + this.visit(node.children[0]) + ')'; },
      Concat: function(node) {
        return 'Concat(' + node.children
          .map( function(child) {
            return this.visit(child);
          }.bind(this))
          .join(' ') + ')';
      },
      Optional: function(node) { return 'Optional(' + this.visit(node.children[0]) + ')'; },
      Literal: sillyVisitor,
      Splat: sillyVisitor,
      Param: sillyVisitor
    });

    assert.ok(visitor);

  });
});

