'use strict';

exports.__esModule = true;
exports.KEY = undefined;
exports.default = rowBelowItem;

var _utils = require('./../utils');

var KEY = exports.KEY = 'row_below';

function rowBelowItem() {
  return {
    key: KEY,
    name: 'Insert row below',

    callback: function callback(key, selection) {
      this.alter('insert_row', selection.end.row + 1, 1, 'ContextMenu.rowBelow');
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