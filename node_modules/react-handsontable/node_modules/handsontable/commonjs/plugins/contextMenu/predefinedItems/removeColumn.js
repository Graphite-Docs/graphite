'use strict';

exports.__esModule = true;
exports.KEY = undefined;
exports.default = removeColumnItem;

var _utils = require('./../utils');

var KEY = exports.KEY = 'remove_col';

function removeColumnItem() {
  return {
    key: KEY,
    name: 'Remove column',

    callback: function callback(key, selection) {
      var amount = selection.end.col - selection.start.col + 1;

      this.alter('remove_col', selection.start.col, amount, 'ContextMenu.removeColumn');
    },
    disabled: function disabled() {
      var selected = (0, _utils.getValidSelection)(this);
      var totalColumns = this.countCols();

      return !selected || this.selection.selectedHeader.rows || this.selection.selectedHeader.corner || !this.isColumnModificationAllowed() || !totalColumns;
    },
    hidden: function hidden() {
      return !this.getSettings().allowRemoveColumn;
    }
  };
}