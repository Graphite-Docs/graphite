'use strict';

exports.__esModule = true;
exports.KEY = undefined;
exports.default = columnRightItem;

var _utils = require('./../utils');

var KEY = exports.KEY = 'col_right';

function columnRightItem() {
  return {
    key: KEY,
    name: 'Insert column on the right',

    callback: function callback(key, selection) {
      this.alter('insert_col', selection.end.col + 1, 1, 'ContextMenu.columnRight');
    },
    disabled: function disabled() {
      var selected = (0, _utils.getValidSelection)(this);

      if (!selected) {
        return true;
      }
      if (!this.isColumnModificationAllowed()) {
        return true;
      }
      var entireRowSelection = [selected[0], 0, selected[0], this.countCols() - 1];
      var rowSelected = entireRowSelection.join(',') == selected.join(',');
      var onlyOneColumn = this.countCols() === 1;

      return selected[1] < 0 || this.countCols() >= this.getSettings().maxCols || !onlyOneColumn && rowSelected;
    },
    hidden: function hidden() {
      return !this.getSettings().allowInsertColumn;
    }
  };
}