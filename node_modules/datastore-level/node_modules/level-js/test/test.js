var tape   = require('tape')
var leveljs = require('../')
var testCommon = require('./testCommon')

var testBuffer = new Buffer('foo')

/*** compatibility with basic LevelDOWN API ***/
require('abstract-leveldown/abstract/leveldown-test').args(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/open-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/put-test').all(leveljs, tape, testCommon)
/* run these tests in Firefox with "dom.indexedDB.experimental" pref set to true
require('abstract-leveldown/abstract/put-test').setUp(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/put-test').sync(tape)
require('abstract-leveldown/abstract/put-test').tearDown(tape, testCommon)
*/
require('abstract-leveldown/abstract/del-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/get-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/put-get-del-test').all(leveljs, tape, testCommon, testBuffer)
require('abstract-leveldown/abstract/batch-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/chained-batch-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/close-test').close(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/iterator-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/ranges-test').all(leveljs, tape, testCommon)

// non abstract-leveldown tests:
require('./custom-tests.js').all(leveljs, tape, testCommon)
