import * as C from './../../../i18n/constants';

export default function unfreezeColumnItem(manualColumnFreezePlugin) {
  return {
    key: 'unfreeze_column',
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_UNFREEZE_COLUMN);
    },
    callback: function callback() {
      var selectedColumn = this.getSelectedRange().from.col;

      manualColumnFreezePlugin.unfreezeColumn(selectedColumn);

      this.render();
      this.view.wt.wtOverlays.adjustElementsSize(true);
    },
    hidden: function hidden() {
      var selection = this.getSelectedRange();
      var hide = false;

      if (selection === void 0) {
        hide = true;
      } else if (selection.from.col !== selection.to.col || selection.from.col >= this.getSettings().fixedColumnsLeft) {
        hide = true;
      }

      return hide;
    }
  };
}