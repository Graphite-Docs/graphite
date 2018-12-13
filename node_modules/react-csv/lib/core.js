'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var isJsons = exports.isJsons = function isJsons(array) {
  return Array.isArray(array) && array.every(function (row) {
    return (typeof row === 'undefined' ? 'undefined' : _typeof(row)) === 'object' && !(row instanceof Array);
  });
};

var isArrays = exports.isArrays = function isArrays(array) {
  return Array.isArray(array) && array.every(function (row) {
    return Array.isArray(row);
  });
};

var jsonsHeaders = exports.jsonsHeaders = function jsonsHeaders(array) {
  return Array.from(array.map(function (json) {
    return Object.keys(json);
  }).reduce(function (a, b) {
    return new Set([].concat(_toConsumableArray(a), _toConsumableArray(b)));
  }, []));
};

var jsons2arrays = exports.jsons2arrays = function jsons2arrays(jsons, headers) {
  headers = headers || jsonsHeaders(jsons);

  var headerLabels = headers;
  var headerKeys = headers;
  if (isJsons(headers)) {
    headerLabels = headers.map(function (header) {
      return header.label;
    });
    headerKeys = headers.map(function (header) {
      return header.key;
    });
  }

  var data = jsons.map(function (object) {
    return headerKeys.map(function (header) {
      return header in object ? object[header] : '';
    });
  });
  return [headerLabels].concat(_toConsumableArray(data));
};

var elementOrEmpty = exports.elementOrEmpty = function elementOrEmpty(element) {
  return element || element === 0 ? element : '';
};

var joiner = exports.joiner = function joiner(data) {
  var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ',';
  return data.map(function (row, index) {
    return row.map(function (element) {
      return "\"" + elementOrEmpty(element) + "\"";
    }).join(separator);
  }).join('\n');
};

var arrays2csv = exports.arrays2csv = function arrays2csv(data, headers, separator) {
  return joiner(headers ? [headers].concat(_toConsumableArray(data)) : data, separator);
};

var jsons2csv = exports.jsons2csv = function jsons2csv(data, headers, separator) {
  return joiner(jsons2arrays(data, headers), separator);
};

var string2csv = exports.string2csv = function string2csv(data, headers, separator) {
  return headers ? headers.join(separator) + '\n' + data : data;
};

var toCSV = exports.toCSV = function toCSV(data, headers, separator) {
  if (isJsons(data)) return jsons2csv(data, headers, separator);
  if (isArrays(data)) return arrays2csv(data, headers, separator);
  if (typeof data === 'string') return string2csv(data, headers, separator);
  throw new TypeError('Data should be a "String", "Array of arrays" OR "Array of objects" ');
};

var buildURI = exports.buildURI = function buildURI(data, uFEFF, headers, separator) {
  var csv = toCSV(data, headers, separator);
  var blob = new Blob([uFEFF ? '\uFEFF' : '', csv], { type: 'text/csv' });
  var dataURI = 'data:text/csv;charset=utf-8,' + (uFEFF ? '\uFEFF' : '') + csv;

  var URL = window.URL || window.webkitURL;

  return typeof URL.createObjectURL === 'undefined' ? dataURI : URL.createObjectURL(blob);
};