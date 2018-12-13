'use strict';

exports.__esModule = true;

var _element = require('./../helpers/dom/element');

function cellDecorator(instance, TD, row, col, prop, value, cellProperties) {
  if (cellProperties.className) {
    if (TD.className) {
      TD.className = TD.className + ' ' + cellProperties.className;
    } else {
      TD.className = cellProperties.className;
    }
  }

  if (cellProperties.readOnly) {
    (0, _element.addClass)(TD, cellProperties.readOnlyCellClassName);
  }

  if (cellProperties.valid === false && cellProperties.invalidCellClassName) {
    (0, _element.addClass)(TD, cellProperties.invalidCellClassName);
  } else {
    (0, _element.removeClass)(TD, cellProperties.invalidCellClassName);
  }

  if (cellProperties.wordWrap === false && cellProperties.noWordWrapClassName) {
    (0, _element.addClass)(TD, cellProperties.noWordWrapClassName);
  }

  if (!value && cellProperties.placeholder) {
    (0, _element.addClass)(TD, cellProperties.placeholderCellClassName);
  }
} /**
   * Adds appropriate CSS class to table cell, based on cellProperties
   */
exports.default = cellDecorator;