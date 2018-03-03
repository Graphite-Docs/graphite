'use strict';

exports.__esModule = true;

var _pluginHooks = require('./../../pluginHooks');

var _pluginHooks2 = _interopRequireDefault(_pluginHooks);

var _array = require('./../../helpers/array');

var _number = require('./../../helpers/number');

var _object = require('./../../helpers/object');

var _event = require('./../../helpers/dom/event');

var _src = require('./../../3rdparty/walkontable/src');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @description
 * Handsontable UndoRedo plugin. It allows to undo and redo certain actions done in the table.
 * Please note, that not all actions are currently undo-able.
 *
 * @example
 * ```js
 * ...
 * undo: true
 * ...
 * ```
 * @class UndoRedo
 * @plugin UndoRedo
 */
/**
 * Handsontable UndoRedo class
 */
function UndoRedo(instance) {
  var plugin = this;
  this.instance = instance;
  this.doneActions = [];
  this.undoneActions = [];
  this.ignoreNewActions = false;

  instance.addHook('afterChange', function (changes, source) {
    if (changes && source !== 'UndoRedo.undo' && source !== 'UndoRedo.redo') {
      plugin.done(new UndoRedo.ChangeAction(changes));
    }
  });

  instance.addHook('afterCreateRow', function (index, amount, source) {
    if (source === 'UndoRedo.undo' || source === 'UndoRedo.undo' || source === 'auto') {
      return;
    }

    var action = new UndoRedo.CreateRowAction(index, amount);
    plugin.done(action);
  });

  instance.addHook('beforeRemoveRow', function (index, amount, logicRows, source) {
    if (source === 'UndoRedo.undo' || source === 'UndoRedo.redo' || source === 'auto') {
      return;
    }

    var originalData = plugin.instance.getSourceDataArray();

    index = (originalData.length + index) % originalData.length;

    var removedData = (0, _object.deepClone)(originalData.slice(index, index + amount));

    plugin.done(new UndoRedo.RemoveRowAction(index, removedData));
  });

  instance.addHook('afterCreateCol', function (index, amount, source) {
    if (source === 'UndoRedo.undo' || source === 'UndoRedo.redo' || source === 'auto') {
      return;
    }

    plugin.done(new UndoRedo.CreateColumnAction(index, amount));
  });

  instance.addHook('beforeRemoveCol', function (index, amount, logicColumns, source) {
    if (source === 'UndoRedo.undo' || source === 'UndoRedo.redo' || source === 'auto') {
      return;
    }

    var originalData = plugin.instance.getSourceDataArray();

    index = (plugin.instance.countCols() + index) % plugin.instance.countCols();

    var removedData = [];
    var headers = [];
    var indexes = [];

    (0, _number.rangeEach)(originalData.length - 1, function (i) {
      var column = [];
      var origRow = originalData[i];

      (0, _number.rangeEach)(index, index + (amount - 1), function (j) {
        column.push(origRow[instance.runHooks('modifyCol', j)]);
      });
      removedData.push(column);
    });

    (0, _number.rangeEach)(amount - 1, function (i) {
      indexes.push(instance.runHooks('modifyCol', index + i));
    });

    if (Array.isArray(instance.getSettings().colHeaders)) {
      (0, _number.rangeEach)(amount - 1, function (i) {
        headers.push(instance.getSettings().colHeaders[instance.runHooks('modifyCol', index + i)] || null);
      });
    }

    var manualColumnMovePlugin = plugin.instance.getPlugin('manualColumnMove');

    var columnsMap = manualColumnMovePlugin.isEnabled() ? manualColumnMovePlugin.columnsMapper.__arrayMap : [];
    var action = new UndoRedo.RemoveColumnAction(index, indexes, removedData, headers, columnsMap);

    plugin.done(action);
  });

  instance.addHook('beforeCellAlignment', function (stateBefore, range, type, alignment) {
    var action = new UndoRedo.CellAlignmentAction(stateBefore, range, type, alignment);
    plugin.done(action);
  });

  instance.addHook('beforeFilter', function (conditionsStack) {
    plugin.done(new UndoRedo.FiltersAction(conditionsStack));
  });

  instance.addHook('beforeRowMove', function (movedRows, target) {
    if (movedRows === false) {
      return;
    }

    plugin.done(new UndoRedo.RowMoveAction(movedRows, target));
  });
};

UndoRedo.prototype.done = function (action) {
  if (!this.ignoreNewActions) {
    this.doneActions.push(action);
    this.undoneActions.length = 0;
  }
};

/**
 * Undo last edit.
 *
 * @function undo
 * @memberof UndoRedo#
 */
UndoRedo.prototype.undo = function () {
  if (this.isUndoAvailable()) {
    var action = this.doneActions.pop();
    var actionClone = (0, _object.deepClone)(action);
    var instance = this.instance;

    var continueAction = instance.runHooks('beforeUndo', actionClone);

    if (continueAction === false) {
      return;
    }

    this.ignoreNewActions = true;
    var that = this;
    action.undo(this.instance, function () {
      that.ignoreNewActions = false;
      that.undoneActions.push(action);
    });

    instance.runHooks('afterUndo', actionClone);
  }
};

/**
 * Redo edit (used to reverse an undo).
 *
 * @function redo
 * @memberof UndoRedo#
 */
UndoRedo.prototype.redo = function () {
  if (this.isRedoAvailable()) {
    var action = this.undoneActions.pop();
    var actionClone = (0, _object.deepClone)(action);
    var instance = this.instance;

    var continueAction = instance.runHooks('beforeRedo', actionClone);

    if (continueAction === false) {
      return;
    }

    this.ignoreNewActions = true;
    var that = this;
    action.redo(this.instance, function () {
      that.ignoreNewActions = false;
      that.doneActions.push(action);
    });

    instance.runHooks('afterRedo', actionClone);
  }
};

/**
 * Check if undo action is available.
 *
 * @function isUndoAvailable
 * @memberof UndoRedo#
 * @return {Boolean} Return `true` if undo can be performed, `false` otherwise
 */
UndoRedo.prototype.isUndoAvailable = function () {
  return this.doneActions.length > 0;
};

/**
 * Check if redo action is available.
 *
 * @function isRedoAvailable
 * @memberof UndoRedo#
 * @return {Boolean} Return `true` if redo can be performed, `false` otherwise.
 */
UndoRedo.prototype.isRedoAvailable = function () {
  return this.undoneActions.length > 0;
};

/**
 * Clears undo history.
 *
 * @function clear
 * @memberof UndoRedo#
 */
UndoRedo.prototype.clear = function () {
  this.doneActions.length = 0;
  this.undoneActions.length = 0;
};

UndoRedo.Action = function () {};
UndoRedo.Action.prototype.undo = function () {};
UndoRedo.Action.prototype.redo = function () {};

/**
 * Change action.
 */
UndoRedo.ChangeAction = function (changes) {
  this.changes = changes;
  this.actionType = 'change';
};
(0, _object.inherit)(UndoRedo.ChangeAction, UndoRedo.Action);

UndoRedo.ChangeAction.prototype.undo = function (instance, undoneCallback) {
  var data = (0, _object.deepClone)(this.changes),
      emptyRowsAtTheEnd = instance.countEmptyRows(true),
      emptyColsAtTheEnd = instance.countEmptyCols(true);

  for (var i = 0, len = data.length; i < len; i++) {
    data[i].splice(3, 1);
  }

  instance.addHookOnce('afterChange', undoneCallback);

  instance.setDataAtRowProp(data, null, null, 'UndoRedo.undo');

  for (var _i = 0, _len = data.length; _i < _len; _i++) {
    if (instance.getSettings().minSpareRows && data[_i][0] + 1 + instance.getSettings().minSpareRows === instance.countRows() && emptyRowsAtTheEnd == instance.getSettings().minSpareRows) {

      instance.alter('remove_row', parseInt(data[_i][0] + 1, 10), instance.getSettings().minSpareRows);
      instance.undoRedo.doneActions.pop();
    }

    if (instance.getSettings().minSpareCols && data[_i][1] + 1 + instance.getSettings().minSpareCols === instance.countCols() && emptyColsAtTheEnd == instance.getSettings().minSpareCols) {

      instance.alter('remove_col', parseInt(data[_i][1] + 1, 10), instance.getSettings().minSpareCols);
      instance.undoRedo.doneActions.pop();
    }
  }
};
UndoRedo.ChangeAction.prototype.redo = function (instance, onFinishCallback) {
  var data = (0, _object.deepClone)(this.changes);

  for (var i = 0, len = data.length; i < len; i++) {
    data[i].splice(2, 1);
  }

  instance.addHookOnce('afterChange', onFinishCallback);
  instance.setDataAtRowProp(data, null, null, 'UndoRedo.redo');
};

/**
 * Create row action.
 */
UndoRedo.CreateRowAction = function (index, amount) {
  this.index = index;
  this.amount = amount;
  this.actionType = 'insert_row';
};
(0, _object.inherit)(UndoRedo.CreateRowAction, UndoRedo.Action);

UndoRedo.CreateRowAction.prototype.undo = function (instance, undoneCallback) {
  var rowCount = instance.countRows(),
      minSpareRows = instance.getSettings().minSpareRows;

  if (this.index >= rowCount && this.index - minSpareRows < rowCount) {
    this.index -= minSpareRows; // work around the situation where the needed row was removed due to an 'undo' of a made change
  }

  instance.addHookOnce('afterRemoveRow', undoneCallback);
  instance.alter('remove_row', this.index, this.amount, 'UndoRedo.undo');
};
UndoRedo.CreateRowAction.prototype.redo = function (instance, redoneCallback) {
  instance.addHookOnce('afterCreateRow', redoneCallback);
  instance.alter('insert_row', this.index, this.amount, 'UndoRedo.redo');
};

/**
 * Remove row action.
 */
UndoRedo.RemoveRowAction = function (index, data) {
  this.index = index;
  this.data = data;
  this.actionType = 'remove_row';
};
(0, _object.inherit)(UndoRedo.RemoveRowAction, UndoRedo.Action);

UndoRedo.RemoveRowAction.prototype.undo = function (instance, undoneCallback) {
  instance.alter('insert_row', this.index, this.data.length, 'UndoRedo.undo');
  instance.addHookOnce('afterRender', undoneCallback);
  instance.populateFromArray(this.index, 0, this.data, void 0, void 0, 'UndoRedo.undo');
};
UndoRedo.RemoveRowAction.prototype.redo = function (instance, redoneCallback) {
  instance.addHookOnce('afterRemoveRow', redoneCallback);
  instance.alter('remove_row', this.index, this.data.length, 'UndoRedo.redo');
};

/**
 * Create column action.
 */
UndoRedo.CreateColumnAction = function (index, amount) {
  this.index = index;
  this.amount = amount;
  this.actionType = 'insert_col';
};
(0, _object.inherit)(UndoRedo.CreateColumnAction, UndoRedo.Action);

UndoRedo.CreateColumnAction.prototype.undo = function (instance, undoneCallback) {
  instance.addHookOnce('afterRemoveCol', undoneCallback);
  instance.alter('remove_col', this.index, this.amount, 'UndoRedo.undo');
};
UndoRedo.CreateColumnAction.prototype.redo = function (instance, redoneCallback) {
  instance.addHookOnce('afterCreateCol', redoneCallback);
  instance.alter('insert_col', this.index, this.amount, 'UndoRedo.redo');
};

/**
 * Remove column action.
 */
UndoRedo.RemoveColumnAction = function (index, indexes, data, headers, columnPositions) {
  this.index = index;
  this.indexes = indexes;
  this.data = data;
  this.amount = this.data[0].length;
  this.headers = headers;
  this.columnPositions = columnPositions.slice(0);
  this.actionType = 'remove_col';
};
(0, _object.inherit)(UndoRedo.RemoveColumnAction, UndoRedo.Action);

UndoRedo.RemoveColumnAction.prototype.undo = function (instance, undoneCallback) {
  var _this = this;

  var row = void 0;
  var ascendingIndexes = this.indexes.slice(0).sort();
  var sortByIndexes = function sortByIndexes(elem, j, arr) {
    return arr[_this.indexes.indexOf(ascendingIndexes[j])];
  };

  var sortedData = [];
  (0, _number.rangeEach)(this.data.length - 1, function (i) {
    sortedData[i] = (0, _array.arrayMap)(_this.data[i], sortByIndexes);
  });

  var sortedHeaders = [];
  sortedHeaders = (0, _array.arrayMap)(this.headers, sortByIndexes);

  var changes = [];

  // TODO: Temporary hook for undo/redo mess
  instance.runHooks('beforeCreateCol', this.indexes[0], this.indexes[this.indexes.length - 1], 'UndoRedo.undo');

  (0, _number.rangeEach)(this.data.length - 1, function (i) {
    row = instance.getSourceDataAtRow(i);

    (0, _number.rangeEach)(ascendingIndexes.length - 1, function (j) {
      row.splice(ascendingIndexes[j], 0, sortedData[i][j]);
      changes.push([i, ascendingIndexes[j], null, sortedData[i][j]]);
    });
  });

  // TODO: Temporary hook for undo/redo mess
  if (instance.getPlugin('formulas')) {
    instance.getPlugin('formulas').onAfterSetDataAtCell(changes);
  }

  if (typeof this.headers !== 'undefined') {
    (0, _number.rangeEach)(sortedHeaders.length - 1, function (j) {
      instance.getSettings().colHeaders.splice(ascendingIndexes[j], 0, sortedHeaders[j]);
    });
  }

  if (instance.getPlugin('manualColumnMove')) {
    instance.getPlugin('manualColumnMove').columnsMapper.__arrayMap = this.columnPositions;
  }

  instance.addHookOnce('afterRender', undoneCallback);

  // TODO: Temporary hook for undo/redo mess
  instance.runHooks('afterCreateCol', this.indexes[0], this.indexes[this.indexes.length - 1], 'UndoRedo.undo');

  if (instance.getPlugin('formulas')) {
    instance.getPlugin('formulas').recalculateFull();
  }

  instance.render();
};

UndoRedo.RemoveColumnAction.prototype.redo = function (instance, redoneCallback) {
  instance.addHookOnce('afterRemoveCol', redoneCallback);
  instance.alter('remove_col', this.index, this.amount, 'UndoRedo.redo');
};

/**
 * Cell alignment action.
 */
UndoRedo.CellAlignmentAction = function (stateBefore, range, type, alignment) {
  this.stateBefore = stateBefore;
  this.range = range;
  this.type = type;
  this.alignment = alignment;
};
UndoRedo.CellAlignmentAction.prototype.undo = function (instance, undoneCallback) {
  if (!instance.getPlugin('contextMenu').isEnabled()) {
    return;
  }
  for (var row = this.range.from.row; row <= this.range.to.row; row++) {
    for (var col = this.range.from.col; col <= this.range.to.col; col++) {
      instance.setCellMeta(row, col, 'className', this.stateBefore[row][col] || ' htLeft');
    }
  }

  instance.addHookOnce('afterRender', undoneCallback);
  instance.render();
};
UndoRedo.CellAlignmentAction.prototype.redo = function (instance, undoneCallback) {
  if (!instance.getPlugin('contextMenu').isEnabled()) {
    return;
  }
  instance.selectCell(this.range.from.row, this.range.from.col, this.range.to.row, this.range.to.col);
  instance.getPlugin('contextMenu').executeCommand('alignment:' + this.alignment.replace('ht', '').toLowerCase());

  instance.addHookOnce('afterRender', undoneCallback);
  instance.render();
};

/**
 * Filters action.
 */
UndoRedo.FiltersAction = function (conditionsStack) {
  this.conditionsStack = conditionsStack;
  this.actionType = 'filter';
};
(0, _object.inherit)(UndoRedo.FiltersAction, UndoRedo.Action);

UndoRedo.FiltersAction.prototype.undo = function (instance, undoneCallback) {
  var filters = instance.getPlugin('filters');

  instance.addHookOnce('afterRender', undoneCallback);

  filters.conditionCollection.importAllConditions(this.conditionsStack.slice(0, this.conditionsStack.length - 1));
  filters.filter();
};
UndoRedo.FiltersAction.prototype.redo = function (instance, redoneCallback) {
  var filters = instance.getPlugin('filters');

  instance.addHookOnce('afterRender', redoneCallback);

  filters.conditionCollection.importAllConditions(this.conditionsStack);
  filters.filter();
};

/**
 * ManualRowMove action.
 * @TODO: removeRow undo should works on logical index
 */
UndoRedo.RowMoveAction = function (movedRows, target) {
  this.rows = movedRows.slice();
  this.target = target;
};
(0, _object.inherit)(UndoRedo.RowMoveAction, UndoRedo.Action);

UndoRedo.RowMoveAction.prototype.undo = function (instance, undoneCallback) {
  var manualRowMove = instance.getPlugin('manualRowMove');

  instance.addHookOnce('afterRender', undoneCallback);
  var mod = this.rows[0] < this.target ? -1 * this.rows.length : 0;
  var newTarget = this.rows[0] > this.target ? this.rows[0] + this.rows.length : this.rows[0];
  var newRows = [];
  var rowsLen = this.rows.length + mod;

  for (var i = mod; i < rowsLen; i++) {
    newRows.push(this.target + i);
  }
  manualRowMove.moveRows(newRows.slice(), newTarget);
  instance.render();

  instance.selection.setRangeStartOnly(new _src.CellCoords(this.rows[0], 0));
  instance.selection.setRangeEnd(new _src.CellCoords(this.rows[this.rows.length - 1], instance.countCols() - 1));
};
UndoRedo.RowMoveAction.prototype.redo = function (instance, redoneCallback) {
  var manualRowMove = instance.getPlugin('manualRowMove');

  instance.addHookOnce('afterRender', redoneCallback);
  manualRowMove.moveRows(this.rows.slice(), this.target);
  instance.render();
  var startSelection = this.rows[0] < this.target ? this.target - this.rows.length : this.target;
  instance.selection.setRangeStartOnly(new _src.CellCoords(startSelection, 0));
  instance.selection.setRangeEnd(new _src.CellCoords(startSelection + this.rows.length - 1, instance.countCols() - 1));
};

function init() {
  var instance = this;
  var pluginEnabled = typeof instance.getSettings().undo == 'undefined' || instance.getSettings().undo;

  if (pluginEnabled) {
    if (!instance.undoRedo) {
      /**
       * Instance of Handsontable.UndoRedo Plugin {@link Handsontable.UndoRedo}
       *
       * @alias undoRedo
       * @memberof! Handsontable.Core#
       * @type {UndoRedo}
       */
      instance.undoRedo = new UndoRedo(instance);

      exposeUndoRedoMethods(instance);

      instance.addHook('beforeKeyDown', onBeforeKeyDown);
      instance.addHook('afterChange', onAfterChange);
    }
  } else if (instance.undoRedo) {
    delete instance.undoRedo;

    removeExposedUndoRedoMethods(instance);

    instance.removeHook('beforeKeyDown', onBeforeKeyDown);
    instance.removeHook('afterChange', onAfterChange);
  }
}

function onBeforeKeyDown(event) {
  var instance = this;

  var ctrlDown = (event.ctrlKey || event.metaKey) && !event.altKey;

  if (ctrlDown) {
    if (event.keyCode === 89 || event.shiftKey && event.keyCode === 90) {
      // CTRL + Y or CTRL + SHIFT + Z
      instance.undoRedo.redo();
      (0, _event.stopImmediatePropagation)(event);
    } else if (event.keyCode === 90) {
      // CTRL + Z
      instance.undoRedo.undo();
      (0, _event.stopImmediatePropagation)(event);
    }
  }
}

function onAfterChange(changes, source) {
  var instance = this;
  if (source === 'loadData') {
    return instance.undoRedo.clear();
  }
}

function exposeUndoRedoMethods(instance) {
  /**
   * {@link UndoRedo#undo}
   * @alias undo
   * @memberof! Handsontable.Core#
   */
  instance.undo = function () {
    return instance.undoRedo.undo();
  };

  /**
   * {@link UndoRedo#redo}
   * @alias redo
   * @memberof! Handsontable.Core#
   */
  instance.redo = function () {
    return instance.undoRedo.redo();
  };

  /**
   * {@link UndoRedo#isUndoAvailable}
   * @alias isUndoAvailable
   * @memberof! Handsontable.Core#
   */
  instance.isUndoAvailable = function () {
    return instance.undoRedo.isUndoAvailable();
  };

  /**
   * {@link UndoRedo#isRedoAvailable}
   * @alias isRedoAvailable
   * @memberof! Handsontable.Core#
   */
  instance.isRedoAvailable = function () {
    return instance.undoRedo.isRedoAvailable();
  };

  /**
   * {@link UndoRedo#clear}
   * @alias clearUndo
   * @memberof! Handsontable.Core#
   */
  instance.clearUndo = function () {
    return instance.undoRedo.clear();
  };
}

function removeExposedUndoRedoMethods(instance) {
  delete instance.undo;
  delete instance.redo;
  delete instance.isUndoAvailable;
  delete instance.isRedoAvailable;
  delete instance.clearUndo;
}

var hook = _pluginHooks2.default.getSingleton();

hook.add('afterInit', init);
hook.add('afterUpdateSettings', init);

hook.register('beforeUndo');
hook.register('afterUndo');
hook.register('beforeRedo');
hook.register('afterRedo');

exports.default = UndoRedo;