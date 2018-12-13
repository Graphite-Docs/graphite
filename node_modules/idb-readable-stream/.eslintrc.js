'use strict';

module.exports = {
  env: {
    es6: true,
    node: true
  },
  globals: {
    indexedDB: true,
    IDBKeyRange: true
  },
  'extends': 'eslint:recommended',
  rules: {
    'no-console': 'off',
    indent: [ 'error', 2 ],
    'linebreak-style': [ 'error', 'unix' ],
    quotes: [ 'error', 'single' ],
    strict: [ 'error', 'safe' ],
    'comma-dangle': ['error', 'only-multiline']
  }
};
