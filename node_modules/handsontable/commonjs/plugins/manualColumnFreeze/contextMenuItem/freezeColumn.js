'use strict';

exports.__esModule = true;
exports.default = freezeColumnItem;

var _constants = require('./../../../i18n/constants');

var C = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function freezeColumnItem(manualColumnFreezePlugin) {
  return {
    key: 'freeze_column',
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_FREEZE_COLUMN);
    },
    callback: function callback() {
      var selectedColumn = this.getSelectedRange().from.col;

      manualColumnFreezePlugin.freezeColumn(selectedColumn);

      this.render();
      this.view.wt.wtOverlays.adjustElementsSize(true);
    },
    hidden: function hidden() {
      var selection = this.getSelectedRange();
      var hide = false;

      if (selection === void 0) {
        hide = true;
      } else if (selection.from.col !== selection.to.col || selection.from.col <= this.getSettings().fixedColumnsLeft - 1) {
        hide = true;
      }

      return hide;
    }
  };
}