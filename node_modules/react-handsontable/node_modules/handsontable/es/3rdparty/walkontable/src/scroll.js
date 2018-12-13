var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { innerHeight, innerWidth, getScrollLeft, getScrollTop, offset } from './../../../helpers/dom/element';
import { rangeEach, rangeEachReverse } from './../../../helpers/number';

/**
 * @class Scroll
 */

var Scroll = function () {
  /**
   * @param {Walkontable} wotInstance
   */
  function Scroll(wotInstance) {
    _classCallCheck(this, Scroll);

    this.wot = wotInstance;

    // legacy support
    this.instance = wotInstance;
  }

  /**
   * Scrolls viewport to a cell by minimum number of cells
   *
   * @param {CellCoords} coords
   */


  _createClass(Scroll, [{
    key: 'scrollViewport',
    value: function scrollViewport(coords) {
      if (!this.wot.drawn) {
        return;
      }

      var _getVariables2 = this._getVariables(),
          topOverlay = _getVariables2.topOverlay,
          leftOverlay = _getVariables2.leftOverlay,
          totalRows = _getVariables2.totalRows,
          totalColumns = _getVariables2.totalColumns,
          fixedRowsTop = _getVariables2.fixedRowsTop,
          fixedRowsBottom = _getVariables2.fixedRowsBottom,
          fixedColumnsLeft = _getVariables2.fixedColumnsLeft;

      if (coords.row < 0 || coords.row > Math.max(totalRows - 1, 0)) {
        throw new Error('row ' + coords.row + ' does not exist');
      }

      if (coords.col < 0 || coords.col > Math.max(totalColumns - 1, 0)) {
        throw new Error('column ' + coords.col + ' does not exist');
      }

      if (coords.row >= fixedRowsTop && coords.row < this.getFirstVisibleRow()) {
        topOverlay.scrollTo(coords.row);
      } else if (coords.row > this.getLastVisibleRow() && coords.row < totalRows - fixedRowsBottom) {
        topOverlay.scrollTo(coords.row, true);
      }

      if (coords.col >= fixedColumnsLeft && coords.col < this.getFirstVisibleColumn()) {
        leftOverlay.scrollTo(coords.col);
      } else if (coords.col > this.getLastVisibleColumn()) {
        leftOverlay.scrollTo(coords.col, true);
      }
    }

    /**
     * Get first visible row based on virtual dom and how table is visible in browser window viewport.
     *
     * @returns {Number}
     */

  }, {
    key: 'getFirstVisibleRow',
    value: function getFirstVisibleRow() {
      var _getVariables3 = this._getVariables(),
          topOverlay = _getVariables3.topOverlay,
          wtTable = _getVariables3.wtTable,
          wtViewport = _getVariables3.wtViewport,
          totalRows = _getVariables3.totalRows,
          fixedRowsTop = _getVariables3.fixedRowsTop;

      var firstVisibleRow = wtTable.getFirstVisibleRow();

      if (topOverlay.mainTableScrollableElement === window) {
        var rootElementOffset = offset(wtTable.wtRootElement);
        var totalTableHeight = innerHeight(wtTable.hider);
        var windowHeight = innerHeight(window);
        var windowScrollTop = getScrollTop(window);

        // Only calculate firstVisibleRow when table didn't filled (from up) whole viewport space
        if (rootElementOffset.top + totalTableHeight - windowHeight <= windowScrollTop) {
          var rowsHeight = wtViewport.getColumnHeaderHeight();

          rowsHeight += topOverlay.sumCellSizes(0, fixedRowsTop);

          rangeEachReverse(totalRows, 1, function (row) {
            rowsHeight += topOverlay.sumCellSizes(row - 1, row);

            if (rootElementOffset.top + totalTableHeight - rowsHeight <= windowScrollTop) {
              // Return physical row + 1
              firstVisibleRow = row;

              return false;
            }
          });
        }
      }

      return firstVisibleRow;
    }

    /**
     * Get last visible row based on virtual dom and how table is visible in browser window viewport.
     *
     * @returns {Number}
     */

  }, {
    key: 'getLastVisibleRow',
    value: function getLastVisibleRow() {
      var _getVariables4 = this._getVariables(),
          topOverlay = _getVariables4.topOverlay,
          wtTable = _getVariables4.wtTable,
          wtViewport = _getVariables4.wtViewport,
          totalRows = _getVariables4.totalRows;

      var lastVisibleRow = wtTable.getLastVisibleRow();

      if (topOverlay.mainTableScrollableElement === window) {
        var rootElementOffset = offset(wtTable.wtRootElement);
        var windowHeight = innerHeight(window);
        var windowScrollTop = getScrollTop(window);

        // Only calculate lastVisibleRow when table didn't filled (from bottom) whole viewport space
        if (rootElementOffset.top > windowScrollTop) {
          var rowsHeight = wtViewport.getColumnHeaderHeight();

          rangeEach(1, totalRows, function (row) {
            rowsHeight += topOverlay.sumCellSizes(row - 1, row);

            if (rootElementOffset.top + rowsHeight - windowScrollTop >= windowHeight) {
              // Return physical row - 1 (-2 because rangeEach gives row index + 1 - sumCellSizes requirements)
              lastVisibleRow = row - 2;

              return false;
            }
          });
        }
      }

      return lastVisibleRow;
    }

    /**
     * Get first visible column based on virtual dom and how table is visible in browser window viewport.
     *
     * @returns {Number}
     */

  }, {
    key: 'getFirstVisibleColumn',
    value: function getFirstVisibleColumn() {
      var _getVariables5 = this._getVariables(),
          leftOverlay = _getVariables5.leftOverlay,
          wtTable = _getVariables5.wtTable,
          wtViewport = _getVariables5.wtViewport,
          totalColumns = _getVariables5.totalColumns,
          fixedColumnsLeft = _getVariables5.fixedColumnsLeft;

      var firstVisibleColumn = wtTable.getFirstVisibleColumn();

      if (leftOverlay.mainTableScrollableElement === window) {
        var rootElementOffset = offset(wtTable.wtRootElement);
        var totalTableWidth = innerWidth(wtTable.hider);
        var windowWidth = innerWidth(window);
        var windowScrollLeft = getScrollLeft(window);

        // Only calculate firstVisibleColumn when table didn't filled (from left) whole viewport space
        if (rootElementOffset.left + totalTableWidth - windowWidth <= windowScrollLeft) {
          var columnsWidth = wtViewport.getRowHeaderWidth();

          rangeEachReverse(totalColumns, 1, function (column) {
            columnsWidth += leftOverlay.sumCellSizes(column - 1, column);

            if (rootElementOffset.left + totalTableWidth - columnsWidth <= windowScrollLeft) {
              // Return physical column + 1
              firstVisibleColumn = column;

              return false;
            }
          });
        }
      }

      return firstVisibleColumn;
    }

    /**
     * Get last visible column based on virtual dom and how table is visible in browser window viewport.
     *
     * @returns {Number}
     */

  }, {
    key: 'getLastVisibleColumn',
    value: function getLastVisibleColumn() {
      var _getVariables6 = this._getVariables(),
          leftOverlay = _getVariables6.leftOverlay,
          wtTable = _getVariables6.wtTable,
          wtViewport = _getVariables6.wtViewport,
          totalColumns = _getVariables6.totalColumns;

      var lastVisibleColumn = wtTable.getLastVisibleColumn();

      if (leftOverlay.mainTableScrollableElement === window) {
        var rootElementOffset = offset(wtTable.wtRootElement);
        var windowWidth = innerWidth(window);
        var windowScrollLeft = getScrollLeft(window);

        // Only calculate lastVisibleColumn when table didn't filled (from right) whole viewport space
        if (rootElementOffset.left > windowScrollLeft) {
          var columnsWidth = wtViewport.getRowHeaderWidth();

          rangeEach(1, totalColumns, function (column) {
            columnsWidth += leftOverlay.sumCellSizes(column - 1, column);

            if (rootElementOffset.left + columnsWidth - windowScrollLeft >= windowWidth) {
              // Return physical column - 1 (-2 because rangeEach gives column index + 1 - sumCellSizes requirements)
              lastVisibleColumn = column - 2;

              return false;
            }
          });
        }
      }

      return lastVisibleColumn;
    }

    /**
     * Returns collection of variables used to rows and columns visibility calculations.
     *
     * @returns {Object}
     * @private
     */

  }, {
    key: '_getVariables',
    value: function _getVariables() {
      var wot = this.wot;
      var topOverlay = wot.wtOverlays.topOverlay;
      var leftOverlay = wot.wtOverlays.leftOverlay;
      var wtTable = wot.wtTable;
      var wtViewport = wot.wtViewport;
      var totalRows = wot.getSetting('totalRows');
      var totalColumns = wot.getSetting('totalColumns');
      var fixedRowsTop = wot.getSetting('fixedRowsTop');
      var fixedRowsBottom = wot.getSetting('fixedRowsBottom');
      var fixedColumnsLeft = wot.getSetting('fixedColumnsLeft');

      return {
        topOverlay: topOverlay,
        leftOverlay: leftOverlay,
        wtTable: wtTable,
        wtViewport: wtViewport,
        totalRows: totalRows,
        totalColumns: totalColumns,
        fixedRowsTop: fixedRowsTop,
        fixedRowsBottom: fixedRowsBottom,
        fixedColumnsLeft: fixedColumnsLeft
      };
    }
  }]);

  return Scroll;
}();

export default Scroll;