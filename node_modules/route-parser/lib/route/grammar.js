/** @module  route/grammar */
'use strict';

/**
 * Helper for jison grammar definitions, altering "new" calls to the
 * yy namepsace and assigning action results to "$$"
 * @example
 * o('foo', 'new Lllama($1)') // -> ['foo', '$$ = new yy.Llama($1)']
 * @param  {String} patternString a jison BNF pattern string
 * @param  {String} action   the javascript code to execute against the pattern
 * @return {Array.<string>} the expression strings to give to jison
 * @private
 */
function o(patternString, action) {
  if( typeof action === 'undefined') {
    return [patternString, '$$ = $1;'];
  }
  else {
    action = action.replace(/\bnew /g, '$&yy.');
    return [patternString, '$$ = ' + action + ';'];
  }

}


module.exports = {
  'lex': {
    'rules': [
      ['\\(',            'return "(";' ],
      ['\\)',            'return ")";' ],
      ['\\*+\\w+',       'return "SPLAT";' ],
      [':+\\w+',         'return "PARAM";' ],
      ['[\\w%\\-~\\n]+', 'return "LITERAL";' ],
      ['.',              'return "LITERAL";' ],
      ['$',              'return "EOF";' ]
    ]
  },
  'bnf': {
    'root': [
      ['expressions EOF', 'return new yy.Root({},[$1])'],
      ['EOF', 'return new yy.Root({},[new yy.Literal({value: \'\'})])']
    ],
    'expressions': [
      o('expressions expression', 'new Concat({},[$1,$2])'),
      o('expression')
    ],
    'expression': [
      o('optional'),
      o('literal',   'new Literal({value: $1})'),
      o('splat',     'new Splat({name: $1})'),
      o('param',     'new Param({name: $1})')
    ],
    'optional': [
      o('( expressions )', 'new Optional({},[$2])')
    ],
    'literal': [
      o('LITERAL', 'yytext')
    ],
    'splat': [
      o('SPLAT', 'yytext.slice(1)')
    ],
    'param': [
      o('PARAM', 'yytext.slice(1)')
    ]
  },
  'startSymbol': 'root'
};


//var parser = new (require('jison').Parser)(grammar);
//parser.yy = require('./nodes');

//module.exports = parser;
