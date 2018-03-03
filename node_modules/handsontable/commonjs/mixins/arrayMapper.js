'use strict';

exports.__esModule = true;

var _array = require('./../helpers/array');

var _object = require('./../helpers/object');

var _number = require('./../helpers/number');

var MIXIN_NAME = 'arrayMapper';

/**
 * @type {Object}
 */
var arrayMapper = {
  _arrayMap: [],

  /**
   * Get value by map index.
   *
   * @param {Number} index Array index.
   * @return {*} Returns value mapped to passed index.
   */
  getValueByIndex: function getValueByIndex(index) {
    var value = void 0;

    // eslint-disable-next-line no-cond-assign, no-return-assign
    return (value = this._arrayMap[index]) === void 0 ? null : value;
  },


  /**
   * Get map index by its value.
   *
   * @param {*} value Value to search.
   * @returns {Number} Returns array index.
   */
  getIndexByValue: function getIndexByValue(value) {
    var index = void 0;

    // eslint-disable-next-line no-cond-assign, no-return-assign
    return (index = this._arrayMap.indexOf(value)) === -1 ? null : index;
  },


  /**
   * Insert new items to array mapper starting at passed index. New entries will be a continuation of last value in the array.
   *
   * @param {Number} index Array index.
   * @param {Number} [amount=1] Defines how many items will be created to an array.
   * @returns {Array} Returns added items.
   */
  insertItems: function insertItems(index) {
    var _this = this;

    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    var newIndex = (0, _array.arrayMax)(this._arrayMap) + 1;
    var addedItems = [];

    (0, _number.rangeEach)(amount - 1, function (count) {
      addedItems.push(_this._arrayMap.splice(index + count, 0, newIndex + count));
    });

    return addedItems;
  },


  /**
   * Remove items from array mapper.
   *
   * @param {Number} index Array index.
   * @param {Number} [amount=1] Defines how many items will be created to an array.
   * @returns {Array} Returns removed items.
   */
  removeItems: function removeItems(index) {
    var _this2 = this;

    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    var removedItems = [];

    if (Array.isArray(index)) {
      var mapCopy = [].concat(this._arrayMap);

      // Sort descending
      index.sort(function (a, b) {
        return b - a;
      });

      removedItems = (0, _array.arrayReduce)(index, function (acc, item) {
        _this2._arrayMap.splice(item, 1);

        return acc.concat(mapCopy.slice(item, item + 1));
      }, []);
    } else {
      removedItems = this._arrayMap.splice(index, amount);
    }

    return removedItems;
  },


  /**
   * Unshift items (remove and shift chunk of array to the left).
   *
   * @param {Number|Array} index Array index or Array of indexes to unshift.
   * @param {Number} [amount=1] Defines how many items will be removed from an array (when index is passed as number).
   */
  unshiftItems: function unshiftItems(index) {
    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    var removedItems = this.removeItems(index, amount);

    function countRowShift(logicalRow) {
      // Todo: compare perf between reduce vs sort->each->brake
      return (0, _array.arrayReduce)(removedItems, function (count, removedLogicalRow) {
        if (logicalRow > removedLogicalRow) {
          count++;
        }

        return count;
      }, 0);
    }

    this._arrayMap = (0, _array.arrayMap)(this._arrayMap, function (logicalRow, physicalRow) {
      var rowShift = countRowShift(logicalRow);

      if (rowShift) {
        logicalRow -= rowShift;
      }

      return logicalRow;
    });
  },


  /**
   * Shift (right shifting) items starting at passed index.
   *
   * @param {Number} index Array index.
   * @param {Number} [amount=1] Defines how many items will be created to an array.
   */
  shiftItems: function shiftItems(index) {
    var _this3 = this;

    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    this._arrayMap = (0, _array.arrayMap)(this._arrayMap, function (row) {
      if (row >= index) {
        row += amount;
      }

      return row;
    });

    (0, _number.rangeEach)(amount - 1, function (count) {
      _this3._arrayMap.splice(index + count, 0, index + count);
    });
  },


  /**
   * Clear all stored index<->value information from an array.
   */
  clearMap: function clearMap() {
    this._arrayMap.length = 0;
  }
};

(0, _object.defineGetter)(arrayMapper, 'MIXIN_NAME', MIXIN_NAME, {
  writable: false,
  enumerable: false
});

exports.default = arrayMapper;