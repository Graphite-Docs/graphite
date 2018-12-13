'use strict';

var createVisitor  = require('./create_visitor'),
    escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

/**
 * @class
 * @private
 */
function Matcher(options) {
  this.captures = options.captures;
  this.re = options.re;
}

/**
 * Try matching a path against the generated regular expression
 * @param  {String} path The path to try to match
 * @return {Object|false}      matched parameters or false
 */
Matcher.prototype.match = function (path) {
  var match = this.re.exec(path),
      matchParams = {};

  if( !match ) {
    return;
  }

  this.captures.forEach( function(capture, i) {
    if( typeof match[i+1] === 'undefined' ) {
      matchParams[capture] = undefined;
    }
    else {
      matchParams[capture] = decodeURIComponent(match[i+1]);
    }
  });

  return matchParams;
};

/**
 * Visitor for the AST to create a regular expression matcher
 * @class RegexpVisitor
 * @borrows Visitor-visit
 */
var RegexpVisitor = createVisitor({
  'Concat': function(node) {
    return node.children
      .reduce(
        function(memo, child) {
          var childResult = this.visit(child);
          return {
            re: memo.re + childResult.re,
            captures: memo.captures.concat(childResult.captures)
          };
        }.bind(this),
        {re: '', captures: []}
      );
  },
  'Literal': function(node) {
    return {
      re: node.props.value.replace(escapeRegExp, '\\$&'),
      captures: []
    };
  },

  'Splat': function(node) {
    return {
      re: '([^?]*?)',
      captures: [node.props.name]
    };
  },

  'Param': function(node) {
    return {
      re: '([^\\/\\?]+)',
      captures: [node.props.name]
    };
  },

  'Optional': function(node) {
    var child = this.visit(node.children[0]);
    return {
      re: '(?:' + child.re + ')?',
      captures: child.captures
    };
  },

  'Root': function(node) {
    var childResult = this.visit(node.children[0]);
    return new Matcher({
      re: new RegExp('^' + childResult.re + '(?=\\?|$)' ),
      captures: childResult.captures
    });
  }
});

module.exports = RegexpVisitor;