'use strict';

exports.__esModule = true;
exports.FIRST_AFTER_SECOND = exports.FIRST_BEFORE_SECOND = exports.DO_NOT_SWAP = undefined;
exports.getSortFunctionForColumn = getSortFunctionForColumn;

var _date = require('./sortFunction/date');

var _date2 = _interopRequireDefault(_date);

var _default = require('./sortFunction/default');

var _default2 = _interopRequireDefault(_default);

var _numeric = require('./sortFunction/numeric');

var _numeric2 = _interopRequireDefault(_numeric);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DO_NOT_SWAP = exports.DO_NOT_SWAP = 0;
var FIRST_BEFORE_SECOND = exports.FIRST_BEFORE_SECOND = -1;
var FIRST_AFTER_SECOND = exports.FIRST_AFTER_SECOND = 1;

/**
 * Gets sort function for the particular column basing on its column meta.
 *
 * @private
 * @param {Object} columnMeta
 * @returns {Function}
 */
function getSortFunctionForColumn(columnMeta) {
  if (columnMeta.sortFunction) {
    return columnMeta.sortFunction;
  } else if (columnMeta.type === 'date') {
    return _date2.default;
  } else if (columnMeta.type === 'numeric') {
    return _numeric2.default;
  }

  return _default2.default;
}