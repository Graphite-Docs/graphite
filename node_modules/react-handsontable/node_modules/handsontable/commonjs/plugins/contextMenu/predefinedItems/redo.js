'use strict';

exports.__esModule = true;
exports.default = redoItem;
var KEY = exports.KEY = 'redo';

function redoItem() {
  return {
    key: KEY,
    name: 'Redo',

    callback: function callback() {
      this.redo();
    },
    disabled: function disabled() {
      return this.undoRedo && !this.undoRedo.isRedoAvailable();
    }
  };
}