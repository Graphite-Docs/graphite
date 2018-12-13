export var KEY = 'redo';

export default function redoItem() {
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