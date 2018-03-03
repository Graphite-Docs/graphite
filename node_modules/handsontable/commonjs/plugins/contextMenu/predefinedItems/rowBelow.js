'use strict';

exports.__esModule = true;
exports.KEY = undefined;
exports.default = rowBelowItem;

var _utils = require('./../utils');

var _constants = require('./../../../i18n/constants');

var C = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var KEY = exports.KEY = 'row_below';

function rowBelowItem() {
  return {
    key: KEY,
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_ROW_BELOW);
    },
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