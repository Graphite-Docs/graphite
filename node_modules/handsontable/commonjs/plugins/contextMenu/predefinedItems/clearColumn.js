'use strict';

exports.__esModule = true;
exports.KEY = undefined;
exports.default = clearColumnItem;

var _utils = require('./../utils');

var _constants = require('./../../../i18n/constants');

var C = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var KEY = exports.KEY = 'clear_column';

function clearColumnItem() {
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
      var selected = (0, _utils.getValidSelection)(this);

      if (!selected) {
        return true;
      }
      var entireRowSelection = [selected[0], 0, selected[0], this.countCols() - 1];
      var rowSelected = entireRowSelection.join(',') === selected.join(',');

      return selected[1] < 0 || this.countCols() >= this.getSettings().maxCols || rowSelected;
    }
  };
}