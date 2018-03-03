var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import BasePlugin from './../_base.js';
import Hooks from './../../pluginHooks';
import SheetClip from './../../../lib/SheetClip/SheetClip';
import { CellCoords, CellRange } from './../../3rdparty/walkontable/src';
import { getSelectionText } from './../../helpers/dom/element';
import { arrayEach } from './../../helpers/array';
import { rangeEach } from './../../helpers/number';
import { registerPlugin } from './../../plugins';
import Textarea from './textarea';
import copyItem from './contextMenuItem/copy';
import cutItem from './contextMenuItem/cut';
import EventManager from './../../eventManager';
import PasteEvent from './pasteEvent';

Hooks.getSingleton().register('afterCopyLimit');
Hooks.getSingleton().register('modifyCopyableRange');
Hooks.getSingleton().register('beforeCut');
Hooks.getSingleton().register('afterCut');
Hooks.getSingleton().register('beforePaste');
Hooks.getSingleton().register('afterPaste');
Hooks.getSingleton().register('beforeCopy');
Hooks.getSingleton().register('afterCopy');

var ROWS_LIMIT = 1000;
var COLUMNS_LIMIT = 1000;
var privatePool = new WeakMap();

/**
 * @description
 * This plugin enables the copy/paste functionality in the Handsontable.
 *
 * @example
 * ```js
 * ...
 * copyPaste: true,
 * ...
 * ```
 * @class CopyPaste
 * @plugin CopyPaste
 */

var CopyPaste = function (_BasePlugin) {
  _inherits(CopyPaste, _BasePlugin);

  function CopyPaste(hotInstance) {
    _classCallCheck(this, CopyPaste);

    /**
     * Event manager
     *
     * @type {EventManager}
     */
    var _this = _possibleConstructorReturn(this, (CopyPaste.__proto__ || Object.getPrototypeOf(CopyPaste)).call(this, hotInstance));

    _this.eventManager = new EventManager(_this);
    /**
     * Maximum number of columns than can be copied to clipboard using <kbd>CTRL</kbd> + <kbd>C</kbd>.
     *
     * @private
     * @type {Number}
     * @default 1000
     */
    _this.columnsLimit = COLUMNS_LIMIT;
    /**
     * Ranges of the cells coordinates, which should be used to copy/cut/paste actions.
     *
     * @private
     * @type {Array}
     */
    _this.copyableRanges = [];
    /**
     * Defines paste (<kbd>CTRL</kbd> + <kbd>V</kbd>) behavior.
     * * Default value `"overwrite"` will paste clipboard value over current selection.
     * * When set to `"shift_down"`, clipboard data will be pasted in place of current selection, while all selected cells are moved down.
     * * When set to `"shift_right"`, clipboard data will be pasted in place of current selection, while all selected cells are moved right.
     *
     * @private
     * @type {String}
     * @default 'overwrite'
     */
    _this.pasteMode = 'overwrite';
    /**
     * Maximum number of rows than can be copied to clipboard using <kbd>CTRL</kbd> + <kbd>C</kbd>.
     *
     * @private
     * @type {Number}
     * @default 1000
     */
    _this.rowsLimit = ROWS_LIMIT;
    /**
     * The `textarea` element which is necessary to process copying, cutting off and pasting.
     *
     * @private
     * @type {HTMLElement}
     * @default undefined
     */
    _this.textarea = void 0;

    privatePool.set(_this, {
      isTriggeredByCopy: false,
      isTriggeredByCut: false,
      isBeginEditing: false,
      isFragmentSelectionEnabled: false
    });
    return _this;
  }

  /**
   * Check if plugin is enabled.
   *
   * @returns {Boolean}
   */


  _createClass(CopyPaste, [{
    key: 'isEnabled',
    value: function isEnabled() {
      return !!this.hot.getSettings().copyPaste;
    }

    /**
     * Enable the plugin.
     */

  }, {
    key: 'enablePlugin',
    value: function enablePlugin() {
      var _this2 = this;

      if (this.enabled) {
        return;
      }
      var settings = this.hot.getSettings();
      var priv = privatePool.get(this);

      this.textarea = Textarea.getSingleton();
      priv.isFragmentSelectionEnabled = settings.fragmentSelection;

      if (_typeof(settings.copyPaste) === 'object') {
        this.pasteMode = settings.copyPaste.pasteMode || this.pasteMode;
        this.rowsLimit = settings.copyPaste.rowsLimit || this.rowsLimit;
        this.columnsLimit = settings.copyPaste.columnsLimit || this.columnsLimit;
      }

      this.addHook('afterContextMenuDefaultOptions', function (options) {
        return _this2.onAfterContextMenuDefaultOptions(options);
      });
      this.addHook('afterSelectionEnd', function () {
        return _this2.onAfterSelectionEnd();
      });

      this.registerEvents();

      _get(CopyPaste.prototype.__proto__ || Object.getPrototypeOf(CopyPaste.prototype), 'enablePlugin', this).call(this);
    }

    /**
     * Updates the plugin to use the latest options you have specified.
     */

  }, {
    key: 'updatePlugin',
    value: function updatePlugin() {
      this.disablePlugin();
      this.enablePlugin();

      _get(CopyPaste.prototype.__proto__ || Object.getPrototypeOf(CopyPaste.prototype), 'updatePlugin', this).call(this);
    }

    /**
     * Disable plugin for this Handsontable instance.
     */

  }, {
    key: 'disablePlugin',
    value: function disablePlugin() {
      if (this.textarea) {
        this.textarea.destroy();
      }

      _get(CopyPaste.prototype.__proto__ || Object.getPrototypeOf(CopyPaste.prototype), 'disablePlugin', this).call(this);
    }

    /**
     * Prepares copyable text from the cells selection in the invisible textarea.
     *
     * @function setCopyable
     * @memberof CopyPaste#
     */

  }, {
    key: 'setCopyableText',
    value: function setCopyableText() {
      var selRange = this.hot.getSelectedRange();

      if (!selRange) {
        return;
      }

      var topLeft = selRange.getTopLeftCorner();
      var bottomRight = selRange.getBottomRightCorner();
      var startRow = topLeft.row;
      var startCol = topLeft.col;
      var endRow = bottomRight.row;
      var endCol = bottomRight.col;
      var finalEndRow = Math.min(endRow, startRow + this.rowsLimit - 1);
      var finalEndCol = Math.min(endCol, startCol + this.columnsLimit - 1);

      this.copyableRanges.length = 0;

      this.copyableRanges.push({
        startRow: startRow,
        startCol: startCol,
        endRow: finalEndRow,
        endCol: finalEndCol
      });

      this.copyableRanges = this.hot.runHooks('modifyCopyableRange', this.copyableRanges);

      if (endRow !== finalEndRow || endCol !== finalEndCol) {
        this.hot.runHooks('afterCopyLimit', endRow - startRow + 1, endCol - startCol + 1, this.rowsLimit, this.columnsLimit);
      }
    }

    /**
     * Create copyable text releated to range objects.
     *
     * @since 0.19.0
     * @param {Array} ranges Array of Objects with properties `startRow`, `endRow`, `startCol` and `endCol`.
     * @returns {String} Returns string which will be copied into clipboard.
     */

  }, {
    key: 'getRangedCopyableData',
    value: function getRangedCopyableData(ranges) {
      var _this3 = this;

      var dataSet = [];
      var copyableRows = [];
      var copyableColumns = [];

      // Count all copyable rows and columns
      arrayEach(ranges, function (range) {
        rangeEach(range.startRow, range.endRow, function (row) {
          if (copyableRows.indexOf(row) === -1) {
            copyableRows.push(row);
          }
        });
        rangeEach(range.startCol, range.endCol, function (column) {
          if (copyableColumns.indexOf(column) === -1) {
            copyableColumns.push(column);
          }
        });
      });
      // Concat all rows and columns data defined in ranges into one copyable string
      arrayEach(copyableRows, function (row) {
        var rowSet = [];

        arrayEach(copyableColumns, function (column) {
          rowSet.push(_this3.hot.getCopyableData(row, column));
        });

        dataSet.push(rowSet);
      });

      return SheetClip.stringify(dataSet);
    }

    /**
     * Create copyable text releated to range objects.
     *
     * @since 0.31.1
     * @param {Array} ranges Array of Objects with properties `startRow`, `startCol`, `endRow` and `endCol`.
     * @returns {Array} Returns array of arrays which will be copied into clipboard.
     */

  }, {
    key: 'getRangedData',
    value: function getRangedData(ranges) {
      var _this4 = this;

      var dataSet = [];
      var copyableRows = [];
      var copyableColumns = [];

      // Count all copyable rows and columns
      arrayEach(ranges, function (range) {
        rangeEach(range.startRow, range.endRow, function (row) {
          if (copyableRows.indexOf(row) === -1) {
            copyableRows.push(row);
          }
        });
        rangeEach(range.startCol, range.endCol, function (column) {
          if (copyableColumns.indexOf(column) === -1) {
            copyableColumns.push(column);
          }
        });
      });
      // Concat all rows and columns data defined in ranges into one copyable string
      arrayEach(copyableRows, function (row) {
        var rowSet = [];

        arrayEach(copyableColumns, function (column) {
          rowSet.push(_this4.hot.getCopyableData(row, column));
        });

        dataSet.push(rowSet);
      });

      return dataSet;
    }

    /**
     * Copy action.
     */

  }, {
    key: 'copy',
    value: function copy() {
      var priv = privatePool.get(this);

      priv.isTriggeredByCopy = true;

      this.textarea.select();
      document.execCommand('copy');
    }

    /**
     * Cut action.
     */

  }, {
    key: 'cut',
    value: function cut() {
      var priv = privatePool.get(this);

      priv.isTriggeredByCut = true;

      this.textarea.select();
      document.execCommand('cut');
    }

    /**
     * Simulated paste action.
     *
     * @param {String} [value=''] New value, which should be `pasted`.
     */

  }, {
    key: 'paste',
    value: function paste() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var pasteData = new PasteEvent();
      pasteData.clipboardData.setData('text/plain', value);

      this.onPaste(pasteData);
    }

    /**
     * Register event listeners.
     *
     * @private
     */

  }, {
    key: 'registerEvents',
    value: function registerEvents() {
      var _this5 = this;

      this.eventManager.addEventListener(this.textarea.element, 'paste', function (event) {
        return _this5.onPaste(event);
      });
      this.eventManager.addEventListener(this.textarea.element, 'cut', function (event) {
        return _this5.onCut(event);
      });
      this.eventManager.addEventListener(this.textarea.element, 'copy', function (event) {
        return _this5.onCopy(event);
      });
    }

    /**
     * `copy` event callback on textarea element.
     *
     * @param {Event} event ClipboardEvent.
     * @private
     */

  }, {
    key: 'onCopy',
    value: function onCopy(event) {
      var priv = privatePool.get(this);

      if (!this.hot.isListening() && !priv.isTriggeredByCopy) {
        return;
      }

      this.setCopyableText();
      priv.isTriggeredByCopy = false;

      var rangedData = this.getRangedData(this.copyableRanges);
      var allowCopying = !!this.hot.runHooks('beforeCopy', rangedData, this.copyableRanges);
      var value = '';

      if (allowCopying) {
        value = SheetClip.stringify(rangedData);

        if (event && event.clipboardData) {
          event.clipboardData.setData('text/plain', value);
        } else if (typeof ClipboardEvent === 'undefined') {
          window.clipboardData.setData('Text', value);
        }

        this.hot.runHooks('afterCopy', rangedData, this.copyableRanges);
      }

      event.preventDefault();
    }

    /**
     * `cut` event callback on textarea element.
     *
     * @param {Event} event ClipboardEvent.
     * @private
     */

  }, {
    key: 'onCut',
    value: function onCut(event) {
      var priv = privatePool.get(this);

      if (!this.hot.isListening() && !priv.isTriggeredByCut) {
        return;
      }

      this.setCopyableText();
      priv.isTriggeredByCut = false;

      var rangedData = this.getRangedData(this.copyableRanges);
      var allowCuttingOut = !!this.hot.runHooks('beforeCut', rangedData, this.copyableRanges);
      var value = void 0;

      if (allowCuttingOut) {
        value = SheetClip.stringify(rangedData);

        if (event && event.clipboardData) {
          event.clipboardData.setData('text/plain', value);
        } else if (typeof ClipboardEvent === 'undefined') {
          window.clipboardData.setData('Text', value);
        }

        this.hot.selection.empty();
        this.hot.runHooks('afterCut', rangedData, this.copyableRanges);
      }

      event.preventDefault();
    }

    /**
     * `paste` event callback on textarea element.
     *
     * @param {Event} event ClipboardEvent or pseudo ClipboardEvent, if paste was called manually.
     * @private
     */

  }, {
    key: 'onPaste',
    value: function onPaste(event) {
      var _this6 = this;

      if (!this.hot.isListening()) {
        return;
      }
      if (event && event.preventDefault) {
        event.preventDefault();
      }

      var inputArray = void 0;

      if (event && typeof event.clipboardData !== 'undefined') {
        this.textarea.setValue(event.clipboardData.getData('text/plain'));
      } else if (typeof ClipboardEvent === 'undefined' && typeof window.clipboardData !== 'undefined') {
        this.textarea.setValue(window.clipboardData.getData('Text'));
      }

      inputArray = SheetClip.parse(this.textarea.getValue());
      this.textarea.setValue(' ');

      if (inputArray.length === 0) {
        return;
      }

      var allowPasting = !!this.hot.runHooks('beforePaste', inputArray, this.copyableRanges);

      if (!allowPasting) {
        return;
      }

      var selected = this.hot.getSelected();
      var coordsFrom = new CellCoords(selected[0], selected[1]);
      var coordsTo = new CellCoords(selected[2], selected[3]);
      var cellRange = new CellRange(coordsFrom, coordsFrom, coordsTo);
      var topLeftCorner = cellRange.getTopLeftCorner();
      var bottomRightCorner = cellRange.getBottomRightCorner();
      var areaStart = topLeftCorner;
      var areaEnd = new CellCoords(Math.max(bottomRightCorner.row, inputArray.length - 1 + topLeftCorner.row), Math.max(bottomRightCorner.col, inputArray[0].length - 1 + topLeftCorner.col));

      var isSelRowAreaCoverInputValue = coordsTo.row - coordsFrom.row >= inputArray.length - 1;
      var isSelColAreaCoverInputValue = coordsTo.col - coordsFrom.col >= inputArray[0].length - 1;

      this.hot.addHookOnce('afterChange', function (changes) {
        var changesLength = changes ? changes.length : 0;

        if (changesLength) {
          var offset = { row: 0, col: 0 };
          var highestColumnIndex = -1;

          arrayEach(changes, function (change, index) {
            var nextChange = changesLength > index + 1 ? changes[index + 1] : null;

            if (nextChange) {
              if (!isSelRowAreaCoverInputValue) {
                offset.row += Math.max(nextChange[0] - change[0] - 1, 0);
              }
              if (!isSelColAreaCoverInputValue && change[1] > highestColumnIndex) {
                highestColumnIndex = change[1];
                offset.col += Math.max(nextChange[1] - change[1] - 1, 0);
              }
            }
          });
          _this6.hot.selectCell(areaStart.row, areaStart.col, areaEnd.row + offset.row, areaEnd.col + offset.col);
        }
      });

      this.hot.populateFromArray(areaStart.row, areaStart.col, inputArray, areaEnd.row, areaEnd.col, 'CopyPaste.paste', this.pasteMode);
      this.hot.runHooks('afterPaste', inputArray, this.copyableRanges);
    }

    /**
     * Add copy, cut and paste options to the Context Menu.
     *
     * @private
     * @param {Object} options Contains default added options of the Context Menu.
     */

  }, {
    key: 'onAfterContextMenuDefaultOptions',
    value: function onAfterContextMenuDefaultOptions(options) {
      options.items.push({
        name: '---------'
      }, copyItem(this), cutItem(this));
    }

    /**
     * We have to keep focus on textarea element, to make possible use of the browser tools (copy, cut, paste).
     *
     * @private
     */

  }, {
    key: 'onAfterSelectionEnd',
    value: function onAfterSelectionEnd() {
      var priv = privatePool.get(this);
      var editor = this.hot.getActiveEditor();

      if (editor && typeof editor.isOpened !== 'undefined' && editor.isOpened()) {
        return;
      }
      if (priv.isFragmentSelectionEnabled && !this.textarea.isActive() && getSelectionText()) {
        return;
      }

      this.setCopyableText();
      this.textarea.select();
    }

    /**
     * Destroy plugin instance.
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.textarea) {
        this.textarea.destroy();
      }

      _get(CopyPaste.prototype.__proto__ || Object.getPrototypeOf(CopyPaste.prototype), 'destroy', this).call(this);
    }
  }]);

  return CopyPaste;
}(BasePlugin);

registerPlugin('CopyPaste', CopyPaste);

export default CopyPaste;