'use strict';

exports.__esModule = true;
exports.normalizeSelection = normalizeSelection;
exports.isSeparator = isSeparator;
exports.hasSubMenu = hasSubMenu;
exports.isDisabled = isDisabled;
exports.isSelectionDisabled = isSelectionDisabled;
exports.getValidSelection = getValidSelection;
exports.prepareVerticalAlignClass = prepareVerticalAlignClass;
exports.prepareHorizontalAlignClass = prepareHorizontalAlignClass;
exports.getAlignmentClasses = getAlignmentClasses;
exports.align = align;
exports.checkSelectionConsistency = checkSelectionConsistency;
exports.markLabelAsSelected = markLabelAsSelected;
exports.isItemHidden = isItemHidden;
exports.filterSeparators = filterSeparators;

var _array = require('./../../helpers/array');

var _element = require('./../../helpers/dom/element');

var _separator = require('./predefinedItems/separator');

function normalizeSelection(selRange) {
  return {
    start: selRange.getTopLeftCorner(),
    end: selRange.getBottomRightCorner()
  };
}

function isSeparator(cell) {
  return (0, _element.hasClass)(cell, 'htSeparator');
}

function hasSubMenu(cell) {
  return (0, _element.hasClass)(cell, 'htSubmenu');
}

function isDisabled(cell) {
  return (0, _element.hasClass)(cell, 'htDisabled');
}

function isSelectionDisabled(cell) {
  return (0, _element.hasClass)(cell, 'htSelectionDisabled');
}

function getValidSelection(hot) {
  var selected = hot.getSelected();

  if (!selected) {
    return null;
  }
  if (selected[0] < 0) {
    return null;
  }

  return selected;
}

function prepareVerticalAlignClass(className, alignment) {
  if (className.indexOf(alignment) != -1) {
    return className;
  }
  className = className.replace('htTop', '').replace('htMiddle', '').replace('htBottom', '').replace('  ', '');

  className += ' ' + alignment;

  return className;
}

function prepareHorizontalAlignClass(className, alignment) {
  if (className.indexOf(alignment) != -1) {
    return className;
  }
  className = className.replace('htLeft', '').replace('htCenter', '').replace('htRight', '').replace('htJustify', '').replace('  ', '');

  className += ' ' + alignment;

  return className;
}

function getAlignmentClasses(range, callback) {
  var classes = {};

  for (var row = range.from.row; row <= range.to.row; row++) {
    for (var col = range.from.col; col <= range.to.col; col++) {
      if (!classes[row]) {
        classes[row] = [];
      }
      classes[row][col] = callback(row, col);
    }
  }

  return classes;
}

function align(range, type, alignment, cellDescriptor, propertySetter) {
  if (range.from.row == range.to.row && range.from.col == range.to.col) {
    applyAlignClassName(range.from.row, range.from.col, type, alignment, cellDescriptor, propertySetter);
  } else {
    for (var row = range.from.row; row <= range.to.row; row++) {
      for (var col = range.from.col; col <= range.to.col; col++) {
        applyAlignClassName(row, col, type, alignment, cellDescriptor, propertySetter);
      }
    }
  }
}

function applyAlignClassName(row, col, type, alignment, cellDescriptor, propertySetter) {
  var cellMeta = cellDescriptor(row, col);
  var className = alignment;

  if (cellMeta.className) {
    if (type === 'vertical') {
      className = prepareVerticalAlignClass(cellMeta.className, alignment);
    } else {
      className = prepareHorizontalAlignClass(cellMeta.className, alignment);
    }
  }

  propertySetter(row, col, 'className', className);
}

function checkSelectionConsistency(range, comparator) {
  var result = false;

  if (range) {
    range.forAll(function (row, col) {
      if (comparator(row, col)) {
        result = true;

        return false;
      }
    });
  }

  return result;
}

function markLabelAsSelected(label) {
  // workaround for https://github.com/handsontable/handsontable/issues/1946
  return '<span class="selected">' + String.fromCharCode(10003) + '</span>' + label;
}

function isItemHidden(item, instance) {
  return !item.hidden || !(typeof item.hidden == 'function' && item.hidden.call(instance));
}

function shiftSeparators(items, separator) {
  var result = items.slice(0);

  for (var i = 0; i < result.length;) {
    if (result[i].name === separator) {
      result.shift();
    } else {
      break;
    }
  }
  return result;
}

function popSeparators(items, separator) {
  var result = items.slice(0);

  result.reverse();
  result = shiftSeparators(result, separator);
  result.reverse();

  return result;
}

function removeDuplicatedSeparators(items) {
  var result = [];

  (0, _array.arrayEach)(items, function (value, index) {
    if (index > 0) {
      if (result[result.length - 1].name !== value.name) {
        result.push(value);
      }
    } else {
      result.push(value);
    }
  });

  return result;
}

function filterSeparators(items) {
  var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _separator.KEY;

  var result = items.slice(0);

  result = shiftSeparators(result, separator);
  result = popSeparators(result, separator);
  result = removeDuplicatedSeparators(result);

  return result;
}