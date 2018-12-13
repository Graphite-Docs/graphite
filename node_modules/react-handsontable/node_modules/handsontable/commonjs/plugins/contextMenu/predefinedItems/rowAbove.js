'use strict';

exports.__esModule = true;
exports.KEY = undefined;
exports.default = rowAboveItem;

var _utils = require('./../utils');

var KEY = exports.KEY = 'row_above';

function rowAboveItem() {
  return {
    key: KEY,
    name: 'Insert row above',

    callback: function callback(key, selection) {
      this.alter('insert_row', selection.start.row, 1, 'ContextMenu.rowAbove');
    },
    disabled: function disabled() {
      var selected = (0, _utils.getValidSelection)(this);

      return !selected || this.selection.selectedHeader.cols || this.countRows() >= this.getSettings().maxRows;
    },
    hidden: function hidden() {
      return !this.getSettings().allowInsertRow;
    }
  };
}