'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _src = require('./../../../3rdparty/walkontable/src');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Class responsible for all of the Selection-related operations on merged cells.
 *
 * @class SelectionCalculations
 * @plugin MergeCells
 * @util
 */
var SelectionCalculations = function () {
  function SelectionCalculations() {
    _classCallCheck(this, SelectionCalculations);
  }

  _createClass(SelectionCalculations, [{
    key: 'snapDelta',

    /**
     * "Snap" the delta value according to defined merged cells. (In other words, compensate the rowspan -
     * e.g. going up with `delta.row = -1` over a merged cell with `rowspan = 3`, `delta.row` should change to `-3`.)
     *
     * @param {Object} delta The delta object containing `row` and `col` properties.
     * @param {CellRange} selectionRange The selection range.
     * @param {Object} mergedCell A merged cell object.
     */
    value: function snapDelta(delta, selectionRange, mergedCell) {
      var cellCoords = selectionRange.to;
      var newRow = cellCoords.row + delta.row;
      var newColumn = cellCoords.col + delta.col;

      if (delta.row) {
        this.jumpOverMergedCell(delta, mergedCell, newRow);
      } else if (delta.col) {
        this.jumpOverMergedCell(delta, mergedCell, newColumn);
      }
    }

    /**
     * "Jump" over the merged cell (compensate for the indexes within the merged cell to get past it)
     *
     * @private
     * @param {Object} delta The delta object.
     * @param {MergedCellCoords} mergedCell The merge cell object.
     * @param {Number} newIndex New row/column index, created with the delta.
     */

  }, {
    key: 'jumpOverMergedCell',
    value: function jumpOverMergedCell(delta, mergeCell, newIndex) {
      var flatDelta = delta.row || delta.col;
      var includesIndex = null;
      var firstIndex = null;
      var lastIndex = null;

      if (delta.row) {
        includesIndex = mergeCell.includesVertically(newIndex);
        firstIndex = mergeCell.row;
        lastIndex = mergeCell.getLastRow();
      } else if (delta.col) {
        includesIndex = mergeCell.includesHorizontally(newIndex);
        firstIndex = mergeCell.col;
        lastIndex = mergeCell.getLastColumn();
      }

      if (flatDelta === 0) {
        return;
      } else if (flatDelta > 0) {
        if (includesIndex && newIndex !== firstIndex) {
          flatDelta += lastIndex - newIndex + 1;
        }
      } else if (includesIndex && newIndex !== lastIndex) {
        flatDelta -= newIndex - firstIndex + 1;
      }

      if (delta.row) {
        delta.row = flatDelta;
      } else if (delta.col) {
        delta.col = flatDelta;
      }
    }

    /**
     * Get a selection range with `to` property incremented by the provided delta.
     *
     * @param {CellRange} oldSelectionRange The base selection range.
     * @param {Object} delta The delta object with `row` and `col` properties.
     * @returns {CellRange} A new `CellRange` object.
     */

  }, {
    key: 'getUpdatedSelectionRange',
    value: function getUpdatedSelectionRange(oldSelectionRange, delta) {
      return new _src.CellRange(oldSelectionRange.highlight, oldSelectionRange.from, new _src.CellCoords(oldSelectionRange.to.row + delta.row, oldSelectionRange.to.col + delta.col));
    }
  }]);

  return SelectionCalculations;
}();

exports.default = SelectionCalculations;