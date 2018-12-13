import { getValidSelection } from './../utils';

export var KEY = 'row_below';

export default function rowBelowItem() {
  return {
    key: KEY,
    name: 'Insert row below',

    callback: function callback(key, selection) {
      this.alter('insert_row', selection.end.row + 1, 1, 'ContextMenu.rowBelow');
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