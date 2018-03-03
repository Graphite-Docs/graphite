var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import moment from 'moment';
import { addClass, hasClass, removeClass } from './../../helpers/dom/element';
import { arrayMap, arrayReduce } from './../../helpers/array';
import { isEmpty } from './../../helpers/mixed';
import { hasOwnProperty } from './../../helpers/object';
import BasePlugin from './../_base';
import { registerPlugin } from './../../plugins';
import mergeSort from './../../utils/sortingAlgorithms/mergeSort';
import Hooks from './../../pluginHooks';

Hooks.getSingleton().register('beforeColumnSort');
Hooks.getSingleton().register('afterColumnSort');

// TODO: Implement mixin arrayMapper to ColumnSorting plugin.

/**
 * @plugin ColumnSorting
 *
 * @description
 * This plugin sorts the view by a column (but does not sort the data source!).
 * To enable the plugin, set the `columnSorting` property to either:
 * * a boolean value (`true`/`false`),
 * * an object defining the initial sorting order (see the example below).
 *
 * @example
 * ```js
 * ...
 * // as boolean
 * columnSorting: true
 * ...
 * // as a object with initial order (sort ascending column at index 2)
 * columnSorting: {
 *  column: 2,
 *  sortOrder: true, // true = ascending, false = descending, undefined = original order
 *  sortEmptyCells: true // true = the table sorts empty cells, false = the table moves all empty cells to the end of the table
 * }
 * ...
 * ```
 * @dependencies ObserveChanges
 */

var ColumnSorting = function (_BasePlugin) {
  _inherits(ColumnSorting, _BasePlugin);

  function ColumnSorting(hotInstance) {
    _classCallCheck(this, ColumnSorting);

    var _this2 = _possibleConstructorReturn(this, (ColumnSorting.__proto__ || Object.getPrototypeOf(ColumnSorting)).call(this, hotInstance));

    _this2.sortIndicators = [];
    _this2.lastSortedColumn = null;
    _this2.sortEmptyCells = false;
    return _this2;
  }

  /**
   * Check if the plugin is enabled in the handsontable settings.
   *
   * @returns {Boolean}
   */


  _createClass(ColumnSorting, [{
    key: 'isEnabled',
    value: function isEnabled() {
      return !!this.hot.getSettings().columnSorting;
    }

    /**
     * Enable plugin for this Handsontable instance.
     */

  }, {
    key: 'enablePlugin',
    value: function enablePlugin() {
      var _this3 = this;

      if (this.enabled) {
        return;
      }

      this.setPluginOptions();

      var _this = this;
      this.hot.sortIndex = [];

      this.hot.sort = function () {
        var args = Array.prototype.slice.call(arguments);

        return _this.sortByColumn.apply(_this, _toConsumableArray(args));
      };

      if (typeof this.hot.getSettings().observeChanges === 'undefined') {
        this.enableObserveChangesPlugin();
      }

      this.addHook('afterTrimRow', function (row) {
        return _this3.sort();
      });
      this.addHook('afterUntrimRow', function (row) {
        return _this3.sort();
      });
      this.addHook('modifyRow', function (row) {
        return _this3.translateRow(row);
      });
      this.addHook('unmodifyRow', function (row) {
        return _this3.untranslateRow(row);
      });
      this.addHook('afterUpdateSettings', function () {
        return _this3.onAfterUpdateSettings();
      });
      this.addHook('afterGetColHeader', function (col, TH) {
        return _this3.getColHeader(col, TH);
      });
      this.addHook('afterOnCellMouseDown', function (event, target) {
        return _this3.onAfterOnCellMouseDown(event, target);
      });
      this.addHook('afterCreateRow', function () {
        _this.afterCreateRow.apply(_this, arguments);
      });
      this.addHook('afterRemoveRow', function () {
        _this.afterRemoveRow.apply(_this, arguments);
      });
      this.addHook('afterInit', function () {
        return _this3.sortBySettings();
      });
      this.addHook('afterLoadData', function () {
        _this3.hot.sortIndex = [];

        if (_this3.hot.view) {
          _this3.sortBySettings();
        }
      });
      if (this.hot.view) {
        this.sortBySettings();
      }
      _get(ColumnSorting.prototype.__proto__ || Object.getPrototypeOf(ColumnSorting.prototype), 'enablePlugin', this).call(this);
    }

    /**
     * Disable plugin for this Handsontable instance.
     */

  }, {
    key: 'disablePlugin',
    value: function disablePlugin() {
      this.hot.sort = void 0;
      _get(ColumnSorting.prototype.__proto__ || Object.getPrototypeOf(ColumnSorting.prototype), 'disablePlugin', this).call(this);
    }

    /**
     * afterUpdateSettings callback.
     *
     * @private
     */

  }, {
    key: 'onAfterUpdateSettings',
    value: function onAfterUpdateSettings() {
      this.sortBySettings();
    }
  }, {
    key: 'sortBySettings',
    value: function sortBySettings() {
      var sortingSettings = this.hot.getSettings().columnSorting;
      var loadedSortingState = this.loadSortingState();
      var sortingColumn = void 0;
      var sortingOrder = void 0;

      if (typeof loadedSortingState === 'undefined') {
        sortingColumn = sortingSettings.column;
        sortingOrder = sortingSettings.sortOrder;
      } else {
        sortingColumn = loadedSortingState.sortColumn;
        sortingOrder = loadedSortingState.sortOrder;
      }
      if (typeof sortingColumn === 'number') {
        this.lastSortedColumn = sortingColumn;
        this.sortByColumn(sortingColumn, sortingOrder);
      }
    }

    /**
     * Set sorted column and order info
     *
     * @param {number} col Sorted visual column index.
     * @param {boolean|undefined} order Sorting order (`true` for ascending, `false` for descending).
     */

  }, {
    key: 'setSortingColumn',
    value: function setSortingColumn(col, order) {
      if (typeof col == 'undefined') {
        this.hot.sortColumn = void 0;
        this.hot.sortOrder = void 0;

        return;
      } else if (this.hot.sortColumn === col && typeof order == 'undefined') {
        if (this.hot.sortOrder === false) {
          this.hot.sortOrder = void 0;
        } else {
          this.hot.sortOrder = !this.hot.sortOrder;
        }
      } else {
        this.hot.sortOrder = typeof order === 'undefined' ? true : order;
      }

      this.hot.sortColumn = col;
    }
  }, {
    key: 'sortByColumn',
    value: function sortByColumn(col, order) {
      this.setSortingColumn(col, order);

      if (typeof this.hot.sortColumn == 'undefined') {
        return;
      }

      var allowSorting = this.hot.runHooks('beforeColumnSort', this.hot.sortColumn, this.hot.sortOrder);

      if (allowSorting !== false) {
        this.sort();
      }
      this.updateOrderClass();
      this.updateSortIndicator();

      this.hot.runHooks('afterColumnSort', this.hot.sortColumn, this.hot.sortOrder);

      this.hot.render();
      this.saveSortingState();
    }

    /**
     * Save the sorting state
     */

  }, {
    key: 'saveSortingState',
    value: function saveSortingState() {
      var sortingState = {};

      if (typeof this.hot.sortColumn != 'undefined') {
        sortingState.sortColumn = this.hot.sortColumn;
      }

      if (typeof this.hot.sortOrder != 'undefined') {
        sortingState.sortOrder = this.hot.sortOrder;
      }

      if (hasOwnProperty(sortingState, 'sortColumn') || hasOwnProperty(sortingState, 'sortOrder')) {
        this.hot.runHooks('persistentStateSave', 'columnSorting', sortingState);
      }
    }

    /**
     * Load the sorting state.
     *
     * @returns {*} Previously saved sorting state.
     */

  }, {
    key: 'loadSortingState',
    value: function loadSortingState() {
      var storedState = {};
      this.hot.runHooks('persistentStateLoad', 'columnSorting', storedState);

      return storedState.value;
    }

    /**
     * Update sorting class name state.
     */

  }, {
    key: 'updateOrderClass',
    value: function updateOrderClass() {
      var orderClass = void 0;

      if (this.hot.sortOrder === true) {
        orderClass = 'ascending';
      } else if (this.hot.sortOrder === false) {
        orderClass = 'descending';
      }
      this.sortOrderClass = orderClass;
    }
  }, {
    key: 'enableObserveChangesPlugin',
    value: function enableObserveChangesPlugin() {
      var _this = this;

      this.hot._registerTimeout(setTimeout(function () {
        _this.hot.updateSettings({
          observeChanges: true
        });
      }, 0));
    }

    /**
     * Default sorting algorithm.
     *
     * @param {Boolean} sortOrder Sorting order - `true` for ascending, `false` for descending.
     * @param {Object} columnMeta Column meta object.
     * @returns {Function} The comparing function.
     */

  }, {
    key: 'defaultSort',
    value: function defaultSort(sortOrder, columnMeta) {
      return function (a, b) {
        if (typeof a[1] == 'string') {
          a[1] = a[1].toLowerCase();
        }
        if (typeof b[1] == 'string') {
          b[1] = b[1].toLowerCase();
        }

        if (a[1] === b[1]) {
          return 0;
        }

        if (isEmpty(a[1])) {
          if (isEmpty(b[1])) {
            return 0;
          }

          if (columnMeta.columnSorting.sortEmptyCells) {
            return sortOrder ? -1 : 1;
          }

          return 1;
        }
        if (isEmpty(b[1])) {
          if (isEmpty(a[1])) {
            return 0;
          }

          if (columnMeta.columnSorting.sortEmptyCells) {
            return sortOrder ? 1 : -1;
          }

          return -1;
        }

        if (isNaN(a[1]) && !isNaN(b[1])) {
          return sortOrder ? 1 : -1;
        } else if (!isNaN(a[1]) && isNaN(b[1])) {
          return sortOrder ? -1 : 1;
        } else if (!(isNaN(a[1]) || isNaN(b[1]))) {
          a[1] = parseFloat(a[1]);
          b[1] = parseFloat(b[1]);
        }
        if (a[1] < b[1]) {
          return sortOrder ? -1 : 1;
        }
        if (a[1] > b[1]) {
          return sortOrder ? 1 : -1;
        }

        return 0;
      };
    }

    /**
     * Date sorting algorithm
     * @param {Boolean} sortOrder Sorting order (`true` for ascending, `false` for descending).
     * @param {Object} columnMeta Column meta object.
     * @returns {Function} The compare function.
     */

  }, {
    key: 'dateSort',
    value: function dateSort(sortOrder, columnMeta) {
      return function (a, b) {
        if (a[1] === b[1]) {
          return 0;
        }

        if (isEmpty(a[1])) {
          if (isEmpty(b[1])) {
            return 0;
          }

          if (columnMeta.columnSorting.sortEmptyCells) {
            return sortOrder ? -1 : 1;
          }

          return 1;
        }

        if (isEmpty(b[1])) {
          if (isEmpty(a[1])) {
            return 0;
          }

          if (columnMeta.columnSorting.sortEmptyCells) {
            return sortOrder ? 1 : -1;
          }

          return -1;
        }

        var aDate = moment(a[1], columnMeta.dateFormat);
        var bDate = moment(b[1], columnMeta.dateFormat);

        if (!aDate.isValid()) {
          return 1;
        }
        if (!bDate.isValid()) {
          return -1;
        }

        if (bDate.isAfter(aDate)) {
          return sortOrder ? -1 : 1;
        }
        if (bDate.isBefore(aDate)) {
          return sortOrder ? 1 : -1;
        }

        return 0;
      };
    }

    /**
     * Numeric sorting algorithm.
     *
     * @param {Boolean} sortOrder Sorting order (`true` for ascending, `false` for descending).
     * @param {Object} columnMeta Column meta object.
     * @returns {Function} The compare function.
     */

  }, {
    key: 'numericSort',
    value: function numericSort(sortOrder, columnMeta) {
      return function (a, b) {
        var parsedA = parseFloat(a[1]);
        var parsedB = parseFloat(b[1]);

        // Watch out when changing this part of code!
        // Check below returns 0 (as expected) when comparing empty string, null, undefined
        if (parsedA === parsedB || isNaN(parsedA) && isNaN(parsedB)) {
          return 0;
        }

        if (columnMeta.columnSorting.sortEmptyCells) {
          if (isEmpty(a[1])) {
            return sortOrder ? -1 : 1;
          }

          if (isEmpty(b[1])) {
            return sortOrder ? 1 : -1;
          }
        }

        if (isNaN(parsedA)) {
          return 1;
        }

        if (isNaN(parsedB)) {
          return -1;
        }

        if (parsedA < parsedB) {
          return sortOrder ? -1 : 1;
        } else if (parsedA > parsedB) {
          return sortOrder ? 1 : -1;
        }

        return 0;
      };
    }

    /**
     * Perform the sorting.
     */

  }, {
    key: 'sort',
    value: function sort() {
      if (typeof this.hot.sortOrder == 'undefined') {
        this.hot.sortIndex.length = 0;

        return;
      }

      var colMeta = this.hot.getCellMeta(0, this.hot.sortColumn);
      var emptyRows = this.hot.countEmptyRows();
      var sortFunction = void 0;
      var nrOfRows = void 0;

      this.hot.sortingEnabled = false; // this is required by translateRow plugin hook
      this.hot.sortIndex.length = 0;

      if (typeof colMeta.columnSorting.sortEmptyCells === 'undefined') {
        colMeta.columnSorting = { sortEmptyCells: this.sortEmptyCells };
      }

      if (this.hot.getSettings().maxRows === Number.POSITIVE_INFINITY) {
        nrOfRows = this.hot.countRows() - this.hot.getSettings().minSpareRows;
      } else {
        nrOfRows = this.hot.countRows() - emptyRows;
      }

      for (var i = 0, ilen = nrOfRows; i < ilen; i++) {
        this.hot.sortIndex.push([i, this.hot.getDataAtCell(i, this.hot.sortColumn)]);
      }

      if (colMeta.sortFunction) {
        sortFunction = colMeta.sortFunction;
      } else {
        switch (colMeta.type) {
          case 'date':
            sortFunction = this.dateSort;
            break;
          case 'numeric':
            sortFunction = this.numericSort;
            break;
          default:
            sortFunction = this.defaultSort;
        }
      }

      mergeSort(this.hot.sortIndex, sortFunction(this.hot.sortOrder, colMeta));

      // Append spareRows
      for (var _i = this.hot.sortIndex.length; _i < this.hot.countRows(); _i++) {
        this.hot.sortIndex.push([_i, this.hot.getDataAtCell(_i, this.hot.sortColumn)]);
      }

      this.hot.sortingEnabled = true; // this is required by translateRow plugin hook
    }

    /**
     * Update indicator states.
     */

  }, {
    key: 'updateSortIndicator',
    value: function updateSortIndicator() {
      if (typeof this.hot.sortOrder == 'undefined') {
        return;
      }
      var colMeta = this.hot.getCellMeta(0, this.hot.sortColumn);

      this.sortIndicators[this.hot.sortColumn] = colMeta.sortIndicator;
    }

    /**
     * `modifyRow` hook callback. Translates physical row index to the sorted row index.
     *
     * @param {Number} row Row index.
     * @returns {Number} Sorted row index.
     */

  }, {
    key: 'translateRow',
    value: function translateRow(row) {
      if (this.hot.sortingEnabled && typeof this.hot.sortOrder !== 'undefined' && this.hot.sortIndex && this.hot.sortIndex.length && this.hot.sortIndex[row]) {
        return this.hot.sortIndex[row][0];
      }

      return row;
    }

    /**
     * Translates sorted row index to physical row index.
     *
     * @param {Number} row Sorted (visual) row index.
     * @returns {number} Physical row index.
     */

  }, {
    key: 'untranslateRow',
    value: function untranslateRow(row) {
      if (this.hot.sortingEnabled && this.hot.sortIndex && this.hot.sortIndex.length) {
        for (var i = 0; i < this.hot.sortIndex.length; i++) {
          if (this.hot.sortIndex[i][0] == row) {
            return i;
          }
        }
      }
    }

    /**
     * `afterGetColHeader` callback. Adds column sorting css classes to clickable headers.
     *
     * @private
     * @param {Number} col Visual column index.
     * @param {Element} TH TH HTML element.
     */

  }, {
    key: 'getColHeader',
    value: function getColHeader(col, TH) {
      if (col < 0 || !TH.parentNode) {
        return false;
      }

      var headerLink = TH.querySelector('.colHeader');
      var colspan = TH.getAttribute('colspan');
      var TRs = TH.parentNode.parentNode.childNodes;
      var headerLevel = Array.prototype.indexOf.call(TRs, TH.parentNode);
      headerLevel -= TRs.length;

      if (!headerLink) {
        return;
      }

      if (this.hot.getSettings().columnSorting && col >= 0 && headerLevel === -1) {
        addClass(headerLink, 'columnSorting');
      }
      removeClass(headerLink, 'descending');
      removeClass(headerLink, 'ascending');

      if (this.sortIndicators[col]) {
        if (col === this.hot.sortColumn) {
          if (this.sortOrderClass === 'ascending') {
            addClass(headerLink, 'ascending');
          } else if (this.sortOrderClass === 'descending') {
            addClass(headerLink, 'descending');
          }
        }
      }
    }

    /**
     * Check if any column is in a sorted state.
     *
     * @returns {Boolean}
     */

  }, {
    key: 'isSorted',
    value: function isSorted() {
      return typeof this.hot.sortColumn != 'undefined';
    }

    /**
     * `afterCreateRow` callback. Updates the sorting state after a row have been created.
     *
     * @private
     * @param {Number} index Visual row index.
     * @param {Number} amount
     */

  }, {
    key: 'afterCreateRow',
    value: function afterCreateRow(index, amount) {
      if (!this.isSorted()) {
        return;
      }

      for (var i = 0; i < this.hot.sortIndex.length; i++) {
        if (this.hot.sortIndex[i][0] >= index) {
          this.hot.sortIndex[i][0] += amount;
        }
      }

      for (var _i2 = 0; _i2 < amount; _i2++) {
        this.hot.sortIndex.splice(index + _i2, 0, [index + _i2, this.hot.getSourceData()[index + _i2][this.hot.sortColumn + this.hot.colOffset()]]);
      }

      this.saveSortingState();
    }

    /**
     * `afterRemoveRow` hook callback.
     *
     * @private
     * @param {Number} index Visual row index.
     * @param {Number} amount
     */

  }, {
    key: 'afterRemoveRow',
    value: function afterRemoveRow(index, amount) {
      if (!this.isSorted()) {
        return;
      }
      var removedRows = this.hot.sortIndex.splice(index, amount);

      removedRows = arrayMap(removedRows, function (row) {
        return row[0];
      });

      function countRowShift(logicalRow) {
        // Todo: compare perf between reduce vs sort->each->brake
        return arrayReduce(removedRows, function (count, removedLogicalRow) {
          if (logicalRow > removedLogicalRow) {
            count++;
          }

          return count;
        }, 0);
      }

      this.hot.sortIndex = arrayMap(this.hot.sortIndex, function (logicalRow, physicalRow) {
        var rowShift = countRowShift(logicalRow[0]);

        if (rowShift) {
          logicalRow[0] -= rowShift;
        }

        return logicalRow;
      });

      this.saveSortingState();
    }

    /**
     * Set options by passed settings
     *
     * @private
     */

  }, {
    key: 'setPluginOptions',
    value: function setPluginOptions() {
      var columnSorting = this.hot.getSettings().columnSorting;

      if ((typeof columnSorting === 'undefined' ? 'undefined' : _typeof(columnSorting)) === 'object') {
        this.sortEmptyCells = columnSorting.sortEmptyCells || false;
      } else {
        this.sortEmptyCells = false;
      }
    }

    /**
     * `onAfterOnCellMouseDown` hook callback.
     *
     * @private
     * @param {Event} event Event which are provided by hook.
     * @param {CellCoords} coords Visual coords of the selected cell.
     */

  }, {
    key: 'onAfterOnCellMouseDown',
    value: function onAfterOnCellMouseDown(event, coords) {
      if (coords.row > -1) {
        return;
      }

      if (hasClass(event.realTarget, 'columnSorting')) {
        // reset order state on every new column header click
        if (coords.col !== this.lastSortedColumn) {
          this.hot.sortOrder = true;
        }

        this.lastSortedColumn = coords.col;

        this.sortByColumn(coords.col);
      }
    }
  }]);

  return ColumnSorting;
}(BasePlugin);

registerPlugin('columnSorting', ColumnSorting);

export default ColumnSorting;