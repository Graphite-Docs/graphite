'use strict';

exports.__esModule = true;
exports.KEY = undefined;
exports.default = readOnlyItem;

var _utils = require('./../utils');

var KEY = exports.KEY = 'make_read_only';

function readOnlyItem() {
  return {
    key: KEY,
    name: function name() {
      var _this = this;

      var label = 'Read only';
      var atLeastOneReadOnly = (0, _utils.checkSelectionConsistency)(this.getSelectedRange(), function (row, col) {
        return _this.getCellMeta(row, col).readOnly;
      });

      if (atLeastOneReadOnly) {
        label = (0, _utils.markLabelAsSelected)(label);
      }

      return label;
    },
    callback: function callback() {
      var _this2 = this;

      var range = this.getSelectedRange();
      var atLeastOneReadOnly = (0, _utils.checkSelectionConsistency)(range, function (row, col) {
        return _this2.getCellMeta(row, col).readOnly;
      });

      range.forAll(function (row, col) {
        _this2.setCellMeta(row, col, 'readOnly', !atLeastOneReadOnly);
      });
      this.render();
    },
    disabled: function disabled() {
      return !(this.getSelectedRange() && !this.selection.selectedHeader.corner);
    }
  };
}