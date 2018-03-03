/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _window = __webpack_require__(1);

var _window2 = _interopRequireDefault(_window);

var _common = __webpack_require__(2);

var common = _interopRequireWildcard(_common);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Export all helpers to the window.
/* eslint-disable import/no-unresolved */
Object.keys(common).forEach(function (key) {
  _window2.default[key] = common[key];
});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = window;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.spec = spec;
exports.createDataArray = createDataArray;
exports.getData = getData;
exports.getTotalRows = getTotalRows;
exports.getTotalColumns = getTotalColumns;
exports.getTableWidth = getTableWidth;
exports.range = range;
exports.shimSelectionProperties = shimSelectionProperties;
exports.getTableTopClone = getTableTopClone;
exports.getTableLeftClone = getTableLeftClone;
exports.getTableCornerClone = getTableCornerClone;
exports.createSpreadsheetData = createSpreadsheetData;
exports.spreadsheetColumnLabel = spreadsheetColumnLabel;
exports.walkontableCalculateScrollbarWidth = walkontableCalculateScrollbarWidth;
exports.getScrollbarWidth = getScrollbarWidth;
function spec() {
  return currentSpec;
};

function createDataArray(rows, cols) {
  spec().data = [];
  rows = typeof rows === 'number' ? rows : 100;
  cols = typeof cols === 'number' ? cols : 4;

  for (var i = 0; i < rows; i++) {
    var row = [];

    if (cols > 0) {
      row.push(i);

      for (var j = 0; j < cols - 1; j++) {
        /* eslint-disable no-mixed-operators */
        /* eslint-disable no-bitwise */
        row.push(String.fromCharCode(65 + j % 20).toLowerCase() + (j / 20 | 0 || '')); // | 0 is parseInt - see http://jsperf.com/math-floor-vs-math-round-vs-parseint/18
      }
    }
    spec().data.push(row);
  }
};

function getData(row, col) {
  return spec().data[row][col];
};

function getTotalRows() {
  return spec().data.length;
};

function getTotalColumns() {
  return spec().data[0] ? spec().data[0].length : 0;
};

var currentSpec;

beforeEach(function () {
  currentSpec = this;

  var matchers = {
    toBeInArray: function toBeInArray() {
      return {
        compare: function compare(actual, expected) {
          return {
            pass: Array.isArray(expected) && expected.indexOf(actual) > -1
          };
        }
      };
    },
    toBeFunction: function toBeFunction() {
      return {
        compare: function compare(actual, expected) {
          return {
            pass: typeof actual === 'function'
          };
        }
      };
    },
    toBeAroundValue: function toBeAroundValue() {
      return {
        compare: function compare(actual, expected, diff) {
          diff = diff || 1;

          var pass = actual >= expected - diff && actual <= expected + diff;
          var message = 'Expected ' + actual + ' to be around ' + expected + ' (between ' + (expected - diff) + ' and ' + (expected + diff) + ')';

          if (!pass) {
            message = 'Expected ' + actual + ' NOT to be around ' + expected + ' (between ' + (expected - diff) + ' and ' + (expected + diff) + ')';
          }

          return {
            pass: pass,
            message: message
          };
        }
      };
    }
  };

  jasmine.addMatchers(matchers);
});

afterEach(function () {
  window.scrollTo(0, 0);
});

function getTableWidth(elem) {
  return $(elem).outerWidth() || $(elem).find('tbody').outerWidth() || $(elem).find('thead').outerWidth(); // IE8 reports 0 as <table> offsetWidth
};

function range(from, to) {
  if (!arguments.length) {
    return [];
  }

  if (arguments.length == 1) {
    to = from;
    from = 0;
  }

  if (to > from) {
    from = [to, to = from][0]; // one-liner for swapping two values
  }

  var result = [];

  while (to++ < from) {
    result.push(to);
  }

  return result;
};

/**
 * Rewrite all existing selections from selections[0] etc. to selections.current etc
 * @param instance
 * @returns {object} modified instance
 */
function shimSelectionProperties(instance) {
  if (instance.selections[0]) {
    instance.selections.current = instance.selections[0];
  }
  if (instance.selections[1]) {
    instance.selections.area = instance.selections[1];
  }
  if (instance.selections[2]) {
    instance.selections.highlight = instance.selections[2];
  }
  if (instance.selections[3]) {
    instance.selections.fill = instance.selections[3];
  }

  return instance;
}

function getTableTopClone() {
  return $('.ht_clone_top');
}

function getTableLeftClone() {
  return $('.ht_clone_left');
}

function getTableCornerClone() {
  return $('.ht_clone_top_left_corner');
}

function createSpreadsheetData(rows, columns) {
  var _rows = [],
      i,
      j;

  for (i = 0; i < rows; i++) {
    var row = [];

    for (j = 0; j < columns; j++) {
      row.push(spreadsheetColumnLabel(j) + (i + 1));
    }
    _rows.push(row);
  }

  return _rows;
}

var COLUMN_LABEL_BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var COLUMN_LABEL_BASE_LENGTH = COLUMN_LABEL_BASE.length;

/**
 * Generates spreadsheet-like column names: A, B, C, ..., Z, AA, AB, etc.
 *
 * @param {Number} index Column index.
 * @returns {String}
 */
function spreadsheetColumnLabel(index) {
  var dividend = index + 1;
  var columnLabel = '';
  var modulo = void 0;

  while (dividend > 0) {
    modulo = (dividend - 1) % COLUMN_LABEL_BASE_LENGTH;
    columnLabel = String.fromCharCode(65 + modulo) + columnLabel;
    dividend = parseInt((dividend - modulo) / COLUMN_LABEL_BASE_LENGTH, 10);
  }

  return columnLabel;
}

function walkontableCalculateScrollbarWidth() {
  var inner = document.createElement('div');
  inner.style.height = '200px';
  inner.style.width = '100%';

  var outer = document.createElement('div');
  outer.style.boxSizing = 'content-box';
  outer.style.height = '150px';
  outer.style.left = '0px';
  outer.style.overflow = 'hidden';
  outer.style.position = 'absolute';
  outer.style.top = '0px';
  outer.style.width = '200px';
  outer.style.visibility = 'hidden';
  outer.appendChild(inner);

  (document.body || document.documentElement).appendChild(outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var w2 = inner.offsetWidth;
  if (w1 == w2) {
    w2 = outer.clientWidth;
  }

  (document.body || document.documentElement).removeChild(outer);

  return w1 - w2;
}

var cachedScrollbarWidth;

function getScrollbarWidth() {
  if (cachedScrollbarWidth === void 0) {
    cachedScrollbarWidth = walkontableCalculateScrollbarWidth();
  }

  return cachedScrollbarWidth;
}

/***/ })
/******/ ]);
//# sourceMappingURL=helpers.entry.js.map