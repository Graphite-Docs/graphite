'use strict';

exports.__esModule = true;

var _element = require('./../helpers/dom/element');

var _index = require('./index');

/**
 * @private
 * @renderer HtmlRenderer
 * @param instance
 * @param TD
 * @param row
 * @param col
 * @param prop
 * @param value
 * @param cellProperties
 */
function htmlRenderer(instance, TD, row, col, prop, value, cellProperties) {
  (0, _index.getRenderer)('base').apply(this, arguments);

  if (value === null || value === void 0) {
    value = '';
  }

  (0, _element.fastInnerHTML)(TD, value);
}

exports.default = htmlRenderer;