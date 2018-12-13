'use strict';

var createVisitor  = require('./create_visitor');

/**
 * Visitor for the AST to construct a path with filled in parameters
 * @class ReverseVisitor
 * @borrows Visitor-visit
 */
var ReverseVisitor = createVisitor({
  'Concat': function(node, context) {
    var childResults =  node.children
      .map( function(child) {
        return this.visit(child,context);
      }.bind(this));

    if( childResults.some(function(c) { return c === false; }) ) {
      return false;
    }
    else {
      return childResults.join('');
    }
  },

  'Literal': function(node) {
    return decodeURI(node.props.value);
  },

  'Splat': function(node, context) {
    if( context[node.props.name] ) {
      return context[node.props.name];
    }
    else {
      return false;
    }
  },

  'Param': function(node, context) {
    if( context[node.props.name] ) {
      return context[node.props.name];
    }
    else {
      return false;
    }
  },

  'Optional': function(node, context) {
    var childResult = this.visit(node.children[0], context);
    if( childResult ) {
      return childResult;
    }
    else {
      return '';
    }
  },

  'Root': function(node, context) {
    context = context || {};
    var childResult = this.visit(node.children[0], context);
    if( !childResult ) {
      return false;
    }
    return encodeURI(childResult);
  }
});

module.exports = ReverseVisitor;