import { arrayEach } from './../../helpers/array';
import { hasClass } from './../../helpers/dom/element';
import { KEY as SEPARATOR } from './predefinedItems/separator';

export function normalizeSelection(selRange) {
  return {
    start: selRange.getTopLeftCorner(),
    end: selRange.getBottomRightCorner()
  };
}

export function isSeparator(cell) {
  return hasClass(cell, 'htSeparator');
}

export function hasSubMenu(cell) {
  return hasClass(cell, 'htSubmenu');
}

export function isDisabled(cell) {
  return hasClass(cell, 'htDisabled');
}

export function isSelectionDisabled(cell) {
  return hasClass(cell, 'htSelectionDisabled');
}

export function getValidSelection(hot) {
  var selected = hot.getSelected();

  if (!selected) {
    return null;
  }
  if (selected[0] < 0) {
    return null;
  }

  return selected;
}

export function prepareVerticalAlignClass(className, alignment) {
  if (className.indexOf(alignment) != -1) {
    return className;
  }
  className = className.replace('htTop', '').replace('htMiddle', '').replace('htBottom', '').replace('  ', '');

  className += ' ' + alignment;

  return className;
}

export function prepareHorizontalAlignClass(className, alignment) {
  if (className.indexOf(alignment) != -1) {
    return className;
  }
  className = className.replace('htLeft', '').replace('htCenter', '').replace('htRight', '').replace('htJustify', '').replace('  ', '');

  className += ' ' + alignment;

  return className;
}

export function getAlignmentClasses(range, callback) {
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

export function align(range, type, alignment, cellDescriptor, propertySetter) {
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

export function checkSelectionConsistency(range, comparator) {
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

export function markLabelAsSelected(label) {
  // workaround for https://github.com/handsontable/handsontable/issues/1946
  return '<span class="selected">' + String.fromCharCode(10003) + '</span>' + label;
}

export function isItemHidden(item, instance) {
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

  arrayEach(items, function (value, index) {
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

export function filterSeparators(items) {
  var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : SEPARATOR;

  var result = items.slice(0);

  result = shiftSeparators(result, separator);
  result = popSeparators(result, separator);
  result = removeDuplicatedSeparators(result);

  return result;
}