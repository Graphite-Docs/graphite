'use strict';

exports.__esModule = true;
exports.default = undoItem;
var KEY = exports.KEY = 'undo';

function undoItem() {
  return {
    key: KEY,
    name: 'Undo',

    callback: function callback() {
      this.undo();
    },
    disabled: function disabled() {
      return this.undoRedo && !this.undoRedo.isUndoAvailable();
    }
  };
}