var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import BasePlugin from './../_base';
import { arrayEach, arrayFilter } from './../../helpers/array';
import { cancelAnimationFrame, requestAnimationFrame } from './../../helpers/feature';
import { isVisible } from './../../helpers/dom/element';
import GhostTable from './../../utils/ghostTable';
import { isObject, objectEach, hasOwnProperty } from './../../helpers/object';
import { valueAccordingPercent, rangeEach } from './../../helpers/number';
import { registerPlugin } from './../../plugins';
import SamplesGenerator from './../../utils/samplesGenerator';
import { isPercentValue } from './../../helpers/string';

/**
 * @plugin AutoRowSize
 *
 * @description
 * This plugin allows to set row heights based on their highest cells.
 *
 * By default, the plugin is declared as `undefined`, which makes it disabled (same as if it was declared as `false`).
 * Enabling this plugin may decrease the overall table performance, as it needs to calculate the heights of all cells to
 * resize the rows accordingly.
 * If you experience problems with the performance, try turning this feature off and declaring the row heights manually.
 *
 * Row height calculations are divided into sync and async part. Each of this parts has their own advantages and
 * disadvantages. Synchronous calculations are faster but they block the browser UI, while the slower asynchronous operations don't
 * block the browser UI.
 *
 * To configure the sync/async distribution, you can pass an absolute value (number of columns) or a percentage value to a config object:
 * ```js
 * ...
 * // as a number (300 columns in sync, rest async)
 * autoRowSize: {syncLimit: 300},
 * ...
 *
 * ...
 * // as a string (percent)
 * autoRowSize: {syncLimit: '40%'},
 * ...
 * ```
 *
 * You can also use the `allowSampleDuplicates` option to allow sampling duplicate values when calculating the row height. Note, that this might have
 * a negative impact on performance.
 *
 * To configure this plugin see {@link Options#autoRowSize}.
 *
 * @example
 *
 * ```js
 * ...
 * var hot = new Handsontable(document.getElementById('example'), {
 *   date: getData(),
 *   autoRowSize: true
 * });
 * // Access to plugin instance:
 * var plugin = hot.getPlugin('autoRowSize');
 *
 * plugin.getRowHeight(4);
 *
 * if (plugin.isEnabled()) {
 *   // code...
 * }
 * ...
 * ```
 */

var AutoRowSize = function (_BasePlugin) {
  _inherits(AutoRowSize, _BasePlugin);

  _createClass(AutoRowSize, null, [{
    key: 'CALCULATION_STEP',
    get: function get() {
      return 50;
    }
  }, {
    key: 'SYNC_CALCULATION_LIMIT',
    get: function get() {
      return 500;
    }
  }]);

  function AutoRowSize(hotInstance) {
    _classCallCheck(this, AutoRowSize);

    /**
     * Cached rows heights.
     *
     * @type {Array}
     */
    var _this = _possibleConstructorReturn(this, (AutoRowSize.__proto__ || Object.getPrototypeOf(AutoRowSize)).call(this, hotInstance));

    _this.heights = [];
    /**
     * Instance of {@link GhostTable} for rows and columns size calculations.
     *
     * @type {GhostTable}
     */
    _this.ghostTable = new GhostTable(_this.hot);
    /**
     * Instance of {@link SamplesGenerator} for generating samples necessary for rows height calculations.
     *
     * @type {SamplesGenerator}
     */
    _this.samplesGenerator = new SamplesGenerator(function (row, col) {
      if (row >= 0) {
        return _this.hot.getDataAtCell(row, col);
      } else if (row === -1) {
        return _this.hot.getColHeader(col);
      }
      return null;
    });
    /**
     * `true` if only the first calculation was performed.
     *
     * @type {Boolean}
     */
    _this.firstCalculation = true;
    /**
     * `true` if the size calculation is in progress.
     *
     * @type {Boolean}
     */
    _this.inProgress = false;

    // moved to constructor to allow auto-sizing the rows when the plugin is disabled
    _this.addHook('beforeRowResize', function (row, size, isDblClick) {
      return _this.onBeforeRowResize(row, size, isDblClick);
    });
    return _this;
  }

  /**
   * Check if the plugin is enabled in the Handsontable settings.
   *
   * @returns {Boolean}
   */


  _createClass(AutoRowSize, [{
    key: 'isEnabled',
    value: function isEnabled() {
      return this.hot.getSettings().autoRowSize === true || isObject(this.hot.getSettings().autoRowSize);
    }

    /**
     * Enable plugin for this Handsontable instance.
     */

  }, {
    key: 'enablePlugin',
    value: function enablePlugin() {
      var _this2 = this;

      if (this.enabled) {
        return;
      }

      this.setSamplingOptions();

      this.addHook('afterLoadData', function () {
        return _this2.onAfterLoadData();
      });
      this.addHook('beforeChange', function (changes) {
        return _this2.onBeforeChange(changes);
      });
      this.addHook('beforeColumnMove', function () {
        return _this2.recalculateAllRowsHeight();
      });
      this.addHook('beforeColumnResize', function () {
        return _this2.recalculateAllRowsHeight();
      });
      this.addHook('beforeColumnSort', function () {
        return _this2.clearCache();
      });
      this.addHook('beforeRender', function (force) {
        return _this2.onBeforeRender(force);
      });
      this.addHook('beforeRowMove', function (rowStart, rowEnd) {
        return _this2.onBeforeRowMove(rowStart, rowEnd);
      });
      this.addHook('modifyRowHeight', function (height, row) {
        return _this2.getRowHeight(row, height);
      });
      this.addHook('modifyColumnHeaderHeight', function () {
        return _this2.getColumnHeaderHeight();
      });
      _get(AutoRowSize.prototype.__proto__ || Object.getPrototypeOf(AutoRowSize.prototype), 'enablePlugin', this).call(this);
    }

    /**
     * Disable plugin for this Handsontable instance.
     */

  }, {
    key: 'disablePlugin',
    value: function disablePlugin() {
      _get(AutoRowSize.prototype.__proto__ || Object.getPrototypeOf(AutoRowSize.prototype), 'disablePlugin', this).call(this);
    }

    /**
     * Calculate a given rows height.
     *
     * @param {Number|Object} rowRange Row range object.
     * @param {Number|Object} colRange Column range object.
     * @param {Boolean} [force=false] If `true` force calculate height even when value was cached earlier.
     */

  }, {
    key: 'calculateRowsHeight',
    value: function calculateRowsHeight() {
      var rowRange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { from: 0, to: this.hot.countRows() - 1 };

      var _this3 = this;

      var colRange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { from: 0, to: this.hot.countCols() - 1 };
      var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (typeof rowRange === 'number') {
        rowRange = { from: rowRange, to: rowRange };
      }
      if (typeof colRange === 'number') {
        colRange = { from: colRange, to: colRange };
      }

      if (this.hot.getColHeader(0) !== null) {
        var samples = this.samplesGenerator.generateRowSamples(-1, colRange);

        this.ghostTable.addColumnHeadersRow(samples.get(-1));
      }

      rangeEach(rowRange.from, rowRange.to, function (row) {
        // For rows we must calculate row height even when user had set height value manually.
        // We can shrink column but cannot shrink rows!
        if (force || _this3.heights[row] === void 0) {
          var _samples = _this3.samplesGenerator.generateRowSamples(row, colRange);

          _samples.forEach(function (sample, row) {
            _this3.ghostTable.addRow(row, sample);
          });
        }
      });
      if (this.ghostTable.rows.length) {
        this.ghostTable.getHeights(function (row, height) {
          _this3.heights[row] = height;
        });
        this.ghostTable.clean();
      }
    }

    /**
     * Calculate the height of all the rows.
     *
     * @param {Object|Number} colRange Column range object.
     */

  }, {
    key: 'calculateAllRowsHeight',
    value: function calculateAllRowsHeight() {
      var _this4 = this;

      var colRange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { from: 0, to: this.hot.countCols() - 1 };

      var current = 0;
      var length = this.hot.countRows() - 1;
      var timer = null;

      this.inProgress = true;

      var loop = function loop() {
        // When hot was destroyed after calculating finished cancel frame
        if (!_this4.hot) {
          cancelAnimationFrame(timer);
          _this4.inProgress = false;

          return;
        }
        _this4.calculateRowsHeight({ from: current, to: Math.min(current + AutoRowSize.CALCULATION_STEP, length) }, colRange);
        current = current + AutoRowSize.CALCULATION_STEP + 1;

        if (current < length) {
          timer = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(timer);
          _this4.inProgress = false;

          // @TODO Should call once per render cycle, currently fired separately in different plugins
          _this4.hot.view.wt.wtOverlays.adjustElementsSize(true);
          // tmp
          if (_this4.hot.view.wt.wtOverlays.leftOverlay.needFullRender) {
            _this4.hot.view.wt.wtOverlays.leftOverlay.clone.draw();
          }
        }
      };
      // sync
      if (this.firstCalculation && this.getSyncCalculationLimit()) {
        this.calculateRowsHeight({ from: 0, to: this.getSyncCalculationLimit() }, colRange);
        this.firstCalculation = false;
        current = this.getSyncCalculationLimit() + 1;
      }
      // async
      if (current < length) {
        loop();
      } else {
        this.inProgress = false;
        this.hot.view.wt.wtOverlays.adjustElementsSize(false);
      }
    }

    /**
     * Set the sampling options.
     *
     * @private
     */

  }, {
    key: 'setSamplingOptions',
    value: function setSamplingOptions() {
      var setting = this.hot.getSettings().autoRowSize;
      var samplingRatio = setting && hasOwnProperty(setting, 'samplingRatio') ? this.hot.getSettings().autoRowSize.samplingRatio : void 0;
      var allowSampleDuplicates = setting && hasOwnProperty(setting, 'allowSampleDuplicates') ? this.hot.getSettings().autoRowSize.allowSampleDuplicates : void 0;

      if (samplingRatio && !isNaN(samplingRatio)) {
        this.samplesGenerator.setSampleCount(parseInt(samplingRatio, 10));
      }

      if (allowSampleDuplicates) {
        this.samplesGenerator.setAllowDuplicates(allowSampleDuplicates);
      }
    }

    /**
     * Recalculate all rows height (overwrite cache values).
     */

  }, {
    key: 'recalculateAllRowsHeight',
    value: function recalculateAllRowsHeight() {
      if (isVisible(this.hot.view.wt.wtTable.TABLE)) {
        this.clearCache();
        this.calculateAllRowsHeight();
      }
    }

    /**
     * Get value which tells how much rows will be calculated synchronously. Rest rows will be calculated asynchronously.
     *
     * @returns {Number}
     */

  }, {
    key: 'getSyncCalculationLimit',
    value: function getSyncCalculationLimit() {
      /* eslint-disable no-bitwise */
      var limit = AutoRowSize.SYNC_CALCULATION_LIMIT;
      var rowsLimit = this.hot.countRows() - 1;

      if (isObject(this.hot.getSettings().autoRowSize)) {
        limit = this.hot.getSettings().autoRowSize.syncLimit;

        if (isPercentValue(limit)) {
          limit = valueAccordingPercent(rowsLimit, limit);
        } else {
          // Force to Number
          limit >>= 0;
        }
      }

      return Math.min(limit, rowsLimit);
    }

    /**
     * Get the calculated row height.
     *
     * @param {Number} row Visual row index.
     * @param {Number} [defaultHeight] Default row height. It will be pick up if no calculated height found.
     * @returns {Number}
     */

  }, {
    key: 'getRowHeight',
    value: function getRowHeight(row) {
      var defaultHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : void 0;

      var height = defaultHeight;

      if (this.heights[row] !== void 0 && this.heights[row] > (defaultHeight || 0)) {
        height = this.heights[row];
      }

      return height;
    }

    /**
     * Get the calculated column header height.
     *
     * @returns {Number|undefined}
     */

  }, {
    key: 'getColumnHeaderHeight',
    value: function getColumnHeaderHeight() {
      return this.heights[-1];
    }

    /**
     * Get the first visible row.
     *
     * @returns {Number} Returns row index or -1 if table is not rendered.
     */

  }, {
    key: 'getFirstVisibleRow',
    value: function getFirstVisibleRow() {
      var wot = this.hot.view.wt;

      if (wot.wtViewport.rowsVisibleCalculator) {
        return wot.wtTable.getFirstVisibleRow();
      }
      if (wot.wtViewport.rowsRenderCalculator) {
        return wot.wtTable.getFirstRenderedRow();
      }

      return -1;
    }

    /**
     * Get the last visible row.
     *
     * @returns {Number} Returns row index or -1 if table is not rendered.
     */

  }, {
    key: 'getLastVisibleRow',
    value: function getLastVisibleRow() {
      var wot = this.hot.view.wt;

      if (wot.wtViewport.rowsVisibleCalculator) {
        return wot.wtTable.getLastVisibleRow();
      }
      if (wot.wtViewport.rowsRenderCalculator) {
        return wot.wtTable.getLastRenderedRow();
      }

      return -1;
    }

    /**
     * Clear cached heights.
     */

  }, {
    key: 'clearCache',
    value: function clearCache() {
      this.heights.length = 0;
      this.heights[-1] = void 0;
    }

    /**
     * Clear cache by range.
     *
     * @param {Object|Number} range Row range object.
     */

  }, {
    key: 'clearCacheByRange',
    value: function clearCacheByRange(range) {
      var _this5 = this;

      if (typeof range === 'number') {
        range = { from: range, to: range };
      }
      rangeEach(Math.min(range.from, range.to), Math.max(range.from, range.to), function (row) {
        _this5.heights[row] = void 0;
      });
    }

    /**
     * @returns {Boolean}
     */

  }, {
    key: 'isNeedRecalculate',
    value: function isNeedRecalculate() {
      return !!arrayFilter(this.heights, function (item) {
        return item === void 0;
      }).length;
    }

    /**
     * On before render listener.
     *
     * @private
     */

  }, {
    key: 'onBeforeRender',
    value: function onBeforeRender() {
      var force = this.hot.renderCall;
      this.calculateRowsHeight({ from: this.getFirstVisibleRow(), to: this.getLastVisibleRow() }, void 0, force);

      var fixedRowsBottom = this.hot.getSettings().fixedRowsBottom;

      // Calculate rows height synchronously for bottom overlay
      if (fixedRowsBottom) {
        var totalRows = this.hot.countRows() - 1;
        this.calculateRowsHeight({ from: totalRows - fixedRowsBottom, to: totalRows });
      }

      if (this.isNeedRecalculate() && !this.inProgress) {
        this.calculateAllRowsHeight();
      }
    }

    /**
     * On before row move listener.
     *
     * @private
     * @param {Number} from Row index where was grabbed.
     * @param {Number} to Destination row index.
     */

  }, {
    key: 'onBeforeRowMove',
    value: function onBeforeRowMove(from, to) {
      this.clearCacheByRange({ from: from, to: to });
      this.calculateAllRowsHeight();
    }

    /**
     * On before row resize listener.
     *
     * @private
     * @param {Number} row
     * @param {Number} size
     * @param {Boolean} isDblClick
     * @returns {Number}
     */

  }, {
    key: 'onBeforeRowResize',
    value: function onBeforeRowResize(row, size, isDblClick) {
      if (isDblClick) {
        this.calculateRowsHeight(row, void 0, true);
        size = this.getRowHeight(row);
      }

      return size;
    }

    /**
     * On after load data listener.
     *
     * @private
     */

  }, {
    key: 'onAfterLoadData',
    value: function onAfterLoadData() {
      var _this6 = this;

      if (this.hot.view) {
        this.recalculateAllRowsHeight();
      } else {
        // first load - initialization
        setTimeout(function () {
          if (_this6.hot) {
            _this6.recalculateAllRowsHeight();
          }
        }, 0);
      }
    }

    /**
     * On before change listener.
     *
     * @private
     * @param {Array} changes
     */

  }, {
    key: 'onBeforeChange',
    value: function onBeforeChange(changes) {
      var range = null;

      if (changes.length === 1) {
        range = changes[0][0];
      } else if (changes.length > 1) {
        range = {
          from: changes[0][0],
          to: changes[changes.length - 1][0]
        };
      }
      if (range !== null) {
        this.clearCacheByRange(range);
      }
    }

    /**
     * Destroy plugin instance.
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.ghostTable.clean();
      _get(AutoRowSize.prototype.__proto__ || Object.getPrototypeOf(AutoRowSize.prototype), 'destroy', this).call(this);
    }
  }]);

  return AutoRowSize;
}(BasePlugin);

registerPlugin('autoRowSize', AutoRowSize);

export default AutoRowSize;