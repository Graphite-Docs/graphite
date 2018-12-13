'use strict';

exports.__esModule = true;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = defaultSort;

var _mixed = require('../../../helpers/mixed');

var _utils = require('../utils');

/**
 * Default sorting algorithm.
 *
 * @param {String} sortOrder Sorting order (`asc` for ascending, `desc` for descending and `none` for initial state).
 * @param {Object} columnMeta Column meta object.
 * @returns {Function} The compare function.
 */
function defaultSort(sortOrder, columnMeta) {
  // We are sorting array of arrays. Single array is in form [rowIndex, ...value]. We compare just values, stored at second index of array.
  return function (_ref, _ref2) {
    var _ref4 = _slicedToArray(_ref, 2),
        firstValue = _ref4[1];

    var _ref3 = _slicedToArray(_ref2, 2),
        secondValue = _ref3[1];

    var sortEmptyCells = columnMeta.columnSorting.sortEmptyCells;

    var value = firstValue;
    var nextValue = secondValue;

    if (typeof value === 'string') {
      value = value.toLowerCase();
    }

    if (typeof nextValue === 'string') {
      nextValue = nextValue.toLowerCase();
    }

    if (value === nextValue) {
      return _utils.DO_NOT_SWAP;
    }

    if ((0, _mixed.isEmpty)(value)) {
      if ((0, _mixed.isEmpty)(nextValue)) {
        // Two empty values
        return _utils.DO_NOT_SWAP;
      }

      // Just fist value is empty and `sortEmptyCells` option was set
      if (sortEmptyCells) {
        return sortOrder === 'asc' ? _utils.FIRST_BEFORE_SECOND : _utils.FIRST_AFTER_SECOND;
      }

      return _utils.FIRST_AFTER_SECOND;
    }

    if ((0, _mixed.isEmpty)(nextValue)) {
      // Just second value is empty and `sortEmptyCells` option was set
      if (sortEmptyCells) {
        return sortOrder === 'asc' ? _utils.FIRST_AFTER_SECOND : _utils.FIRST_BEFORE_SECOND;
      }

      return _utils.FIRST_BEFORE_SECOND;
    }

    if (isNaN(value) && !isNaN(nextValue)) {
      return sortOrder === 'asc' ? _utils.FIRST_AFTER_SECOND : _utils.FIRST_BEFORE_SECOND;
    } else if (!isNaN(value) && isNaN(nextValue)) {
      return sortOrder === 'asc' ? _utils.FIRST_BEFORE_SECOND : _utils.FIRST_AFTER_SECOND;
    } else if (!(isNaN(value) || isNaN(nextValue))) {
      value = parseFloat(value);
      nextValue = parseFloat(nextValue);
    }

    if (value < nextValue) {
      return sortOrder === 'asc' ? _utils.FIRST_BEFORE_SECOND : _utils.FIRST_AFTER_SECOND;
    }

    if (value > nextValue) {
      return sortOrder === 'asc' ? _utils.FIRST_AFTER_SECOND : _utils.FIRST_BEFORE_SECOND;
    }

    return _utils.DO_NOT_SWAP;
  };
}