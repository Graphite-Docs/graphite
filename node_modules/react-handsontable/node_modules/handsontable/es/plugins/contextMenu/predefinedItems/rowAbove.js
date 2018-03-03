import { getValidSelection } from './../utils';

export var KEY = 'row_above';

export default function rowAboveItem() {
  return {
    key: KEY,
    name: 'Insert row above',

    callback: function callback(key, selection) {
      this.alter('insert_row', selection.start.row, 1, 'ContextMenu.rowAbove');
    },
    disabled: function disabled() {
      var selected = getValidSelection(this);

      return !selected || this.selection.selectedHeader.cols || this.countRows() >= this.getSettings().maxRows;
    },
    hidden: function hidden() {
      return !this.getSettings().allowInsertRow;
    }
  };
}