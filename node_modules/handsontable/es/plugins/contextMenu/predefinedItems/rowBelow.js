import { getValidSelection } from './../utils';
import * as C from './../../../i18n/constants';

export var KEY = 'row_below';

export default function rowBelowItem() {
  return {
    key: KEY,
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_ROW_BELOW);
    },
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