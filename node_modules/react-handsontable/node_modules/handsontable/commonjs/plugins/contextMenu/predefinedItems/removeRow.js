'use strict';

exports.__esModule = true;
exports.KEY = undefined;
exports.default = removeRowItem;

var _utils = require('./../utils');

var KEY = exports.KEY = 'remove_row';

function removeRowItem() {
  return {
    key: KEY,
    name: 'Remove row',

    callback: function callback(key, selection) {
      var amount = selection.end.row - selection.start.row + 1;

      this.alter('remove_row', selection.start.row, amount, 'ContextMenu.removeRow');
    },
    disabled: function disabled() {
      var selected = (0, _utils.getValidSelection)(this);
      var totalRows = this.countRows();

      return !selected || this.selection.selectedHeader.cols || this.selection.selectedHeader.corner || !totalRows;
    },
    hidden: function hidden() {
      return !this.getSettings().allowRemoveRow;
    }
  };
}