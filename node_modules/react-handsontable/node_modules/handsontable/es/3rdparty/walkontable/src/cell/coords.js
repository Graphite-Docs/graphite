var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * CellCoords holds cell coordinates (row, column) and few method to validate them and
 * retrieve as an array or an object
 *
 * @class CellCoords
 */
var CellCoords = function () {
  /**
   * @param {Number} row Row index
   * @param {Number} col Column index
   */
  function CellCoords(row, col) {
    _classCallCheck(this, CellCoords);

    if (typeof row !== 'undefined' && typeof col !== 'undefined') {
      this.row = row;
      this.col = col;
    } else {
      this.row = null;
      this.col = null;
    }
  }

  /**
   * Checks if given set of coordinates is valid in context of a given Walkontable instance
   *
   * @param {Walkontable} wotInstance
   * @returns {Boolean}
   */


  _createClass(CellCoords, [{
    key: 'isValid',
    value: function isValid(wotInstance) {
      // is it a valid cell index (0 or higher)
      if (this.row < 0 || this.col < 0) {
        return false;
      }
      // is selection within total rows and columns
      if (this.row >= wotInstance.getSetting('totalRows') || this.col >= wotInstance.getSetting('totalColumns')) {
        return false;
      }

      return true;
    }

    /**
     * Checks if this cell coords are the same as cell coords given as a parameter
     *
     * @param {CellCoords} cellCoords
     * @returns {Boolean}
     */

  }, {
    key: 'isEqual',
    value: function isEqual(cellCoords) {
      if (cellCoords === this) {
        return true;
      }

      return this.row === cellCoords.row && this.col === cellCoords.col;
    }

    /**
     * Checks if tested coordinates are positioned in south-east from this cell coords
     *
     * @param {Object} testedCoords
     * @returns {Boolean}
     */

  }, {
    key: 'isSouthEastOf',
    value: function isSouthEastOf(testedCoords) {
      return this.row >= testedCoords.row && this.col >= testedCoords.col;
    }

    /**
     * Checks if tested coordinates are positioned in north-east from this cell coords
     *
     * @param {Object} testedCoords
     * @returns {Boolean}
     */

  }, {
    key: 'isNorthWestOf',
    value: function isNorthWestOf(testedCoords) {
      return this.row <= testedCoords.row && this.col <= testedCoords.col;
    }

    /**
     * Checks if tested coordinates are positioned in south-west from this cell coords
     *
     * @param {Object} testedCoords
     * @returns {Boolean}
     */

  }, {
    key: 'isSouthWestOf',
    value: function isSouthWestOf(testedCoords) {
      return this.row >= testedCoords.row && this.col <= testedCoords.col;
    }

    /**
     * Checks if tested coordinates are positioned in north-east from this cell coords
     *
     * @param {Object} testedCoords
     * @returns {Boolean}
     */

  }, {
    key: 'isNorthEastOf',
    value: function isNorthEastOf(testedCoords) {
      return this.row <= testedCoords.row && this.col >= testedCoords.col;
    }
  }]);

  return CellCoords;
}();

export default CellCoords;