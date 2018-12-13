export var KEY = 'undo';

export default function undoItem() {
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