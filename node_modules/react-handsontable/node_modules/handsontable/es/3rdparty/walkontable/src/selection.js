var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { addClass } from './../../../helpers/dom/element';
import Border from './border';
import CellCoords from './cell/coords';
import CellRange from './cell/range';

/**
 * @class Selection
 */

var Selection = function () {
  /**
   * @param {Object} settings
   * @param {CellRange} cellRange
   */
  function Selection(settings, cellRange) {
    _classCallCheck(this, Selection);

    this.settings = settings;
    this.cellRange = cellRange || null;
    this.instanceBorders = {};
  }

  /**
   * Each Walkontable clone requires it's own border for every selection. This method creates and returns selection
   * borders per instance
   *
   * @param {Walkontable} wotInstance
   * @returns {Border}
   */


  _createClass(Selection, [{
    key: 'getBorder',
    value: function getBorder(wotInstance) {
      if (this.instanceBorders[wotInstance.guid]) {
        return this.instanceBorders[wotInstance.guid];
      }

      // where is this returned?
      this.instanceBorders[wotInstance.guid] = new Border(wotInstance, this.settings);
    }

    /**
     * Checks if selection is empty
     *
     * @returns {Boolean}
     */

  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this.cellRange === null;
    }

    /**
     * Adds a cell coords to the selection
     *
     * @param {CellCoords} coords
     */

  }, {
    key: 'add',
    value: function add(coords) {
      if (this.isEmpty()) {
        this.cellRange = new CellRange(coords, coords, coords);
      } else {
        this.cellRange.expand(coords);
      }
    }

    /**
     * If selection range from or to property equals oldCoords, replace it with newCoords. Return boolean
     * information about success
     *
     * @param {CellCoords} oldCoords
     * @param {CellCoords} newCoords
     * @returns {Boolean}
     */

  }, {
    key: 'replace',
    value: function replace(oldCoords, newCoords) {
      if (!this.isEmpty()) {
        if (this.cellRange.from.isEqual(oldCoords)) {
          this.cellRange.from = newCoords;

          return true;
        }
        if (this.cellRange.to.isEqual(oldCoords)) {
          this.cellRange.to = newCoords;

          return true;
        }
      }

      return false;
    }

    /**
     * Clears selection
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.cellRange = null;
    }

    /**
     * Returns the top left (TL) and bottom right (BR) selection coordinates
     *
     * @returns {Array} Returns array of coordinates for example `[1, 1, 5, 5]`
     */

  }, {
    key: 'getCorners',
    value: function getCorners() {
      var topLeft = this.cellRange.getTopLeftCorner();
      var bottomRight = this.cellRange.getBottomRightCorner();

      return [topLeft.row, topLeft.col, bottomRight.row, bottomRight.col];
    }

    /**
     * Adds class name to cell element at given coords
     *
     * @param {Walkontable} wotInstance Walkontable instance
     * @param {Number} sourceRow Cell row coord
     * @param {Number} sourceColumn Cell column coord
     * @param {String} className Class name
     */

  }, {
    key: 'addClassAtCoords',
    value: function addClassAtCoords(wotInstance, sourceRow, sourceColumn, className) {
      var TD = wotInstance.wtTable.getCell(new CellCoords(sourceRow, sourceColumn));

      if ((typeof TD === 'undefined' ? 'undefined' : _typeof(TD)) === 'object') {
        addClass(TD, className);
      }
    }

    /**
     * @param wotInstance
     */

  }, {
    key: 'draw',
    value: function draw(wotInstance) {
      if (this.isEmpty()) {
        if (this.settings.border) {
          var border = this.getBorder(wotInstance);

          if (border) {
            border.disappear();
          }
        }

        return;
      }
      var renderedRows = wotInstance.wtTable.getRenderedRowsCount();
      var renderedColumns = wotInstance.wtTable.getRenderedColumnsCount();
      var corners = this.getCorners();
      var sourceRow = void 0,
          sourceCol = void 0,
          TH = void 0;

      for (var column = 0; column < renderedColumns; column++) {
        sourceCol = wotInstance.wtTable.columnFilter.renderedToSource(column);

        if (sourceCol >= corners[1] && sourceCol <= corners[3]) {
          TH = wotInstance.wtTable.getColumnHeader(sourceCol);

          if (TH) {
            var newClasses = [];

            if (this.settings.highlightHeaderClassName) {
              newClasses.push(this.settings.highlightHeaderClassName);
            }

            if (this.settings.highlightColumnClassName) {
              newClasses.push(this.settings.highlightColumnClassName);
            }

            addClass(TH, newClasses);
          }
        }
      }

      for (var row = 0; row < renderedRows; row++) {
        sourceRow = wotInstance.wtTable.rowFilter.renderedToSource(row);

        if (sourceRow >= corners[0] && sourceRow <= corners[2]) {
          TH = wotInstance.wtTable.getRowHeader(sourceRow);

          if (TH) {
            var _newClasses = [];

            if (this.settings.highlightHeaderClassName) {
              _newClasses.push(this.settings.highlightHeaderClassName);
            }

            if (this.settings.highlightRowClassName) {
              _newClasses.push(this.settings.highlightRowClassName);
            }

            addClass(TH, _newClasses);
          }
        }

        for (var _column = 0; _column < renderedColumns; _column++) {
          sourceCol = wotInstance.wtTable.columnFilter.renderedToSource(_column);

          if (sourceRow >= corners[0] && sourceRow <= corners[2] && sourceCol >= corners[1] && sourceCol <= corners[3]) {
            // selected cell
            if (this.settings.className) {
              this.addClassAtCoords(wotInstance, sourceRow, sourceCol, this.settings.className);
            }
          } else if (sourceRow >= corners[0] && sourceRow <= corners[2]) {
            // selection is in this row
            if (this.settings.highlightRowClassName) {
              this.addClassAtCoords(wotInstance, sourceRow, sourceCol, this.settings.highlightRowClassName);
            }
          } else if (sourceCol >= corners[1] && sourceCol <= corners[3]) {
            // selection is in this column
            if (this.settings.highlightColumnClassName) {
              this.addClassAtCoords(wotInstance, sourceRow, sourceCol, this.settings.highlightColumnClassName);
            }
          }
        }
      }
      wotInstance.getSetting('onBeforeDrawBorders', corners, this.settings.className);

      if (this.settings.border) {
        var _border = this.getBorder(wotInstance);

        if (_border) {
          // warning! border.appear modifies corners!
          _border.appear(corners);
        }
      }
    }
  }]);

  return Selection;
}();

export default Selection;