import { getValidSelection } from './../utils';
import * as C from './../../../i18n/constants';

export var KEY = 'clear_column';

export default function clearColumnItem() {
  return {
    key: KEY,
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_CLEAR_COLUMN);
    },
    callback: function callback(key, selection) {
      var column = selection.start.col;

      if (this.countRows()) {
        this.populateFromArray(0, column, [[null]], Math.max(selection.start.row, selection.end.row), column, 'ContextMenu.clearColumn');
      }
    },
    disabled: function disabled() {
      var selected = getValidSelection(this);

      if (!selected) {
        return true;
      }
      var entireRowSelection = [selected[0], 0, selected[0], this.countCols() - 1];
      var rowSelected = entireRowSelection.join(',') === selected.join(',');

      return selected[1] < 0 || this.countCols() >= this.getSettings().maxCols || rowSelected;
    }
  };
}