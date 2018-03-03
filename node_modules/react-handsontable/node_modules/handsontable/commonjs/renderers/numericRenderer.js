'use strict';

exports.__esModule = true;

var _numbro = require('numbro');

var _numbro2 = _interopRequireDefault(_numbro);

var _index = require('./index');

var _number = require('./../helpers/number');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Numeric cell renderer
 *
 * @private
 * @renderer NumericRenderer
 * @dependencies numbro
 * @param {Object} instance Handsontable instance
 * @param {Element} TD Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param value Value to render (remember to escape unsafe HTML before inserting to DOM!)
 * @param {Object} cellProperties Cell properties (shared by cell renderer and editor)
 */
function numericRenderer(instance, TD, row, col, prop, value, cellProperties) {
  if ((0, _number.isNumeric)(value)) {
    if (typeof cellProperties.language !== 'undefined') {
      _numbro2.default.culture(cellProperties.language);
    }

    value = (0, _numbro2.default)(value).format(cellProperties.format || '0');

    var className = cellProperties.className || '';

    var classArr = className.length ? className.split(' ') : [];

    if (classArr.indexOf('htLeft') < 0 && classArr.indexOf('htCenter') < 0 && classArr.indexOf('htRight') < 0 && classArr.indexOf('htJustify') < 0) {
      classArr.push('htRight');
    }

    if (classArr.indexOf('htNumeric') < 0) {
      classArr.push('htNumeric');
    }

    cellProperties.className = classArr.join(' ');
  }

  (0, _index.getRenderer)('text')(instance, TD, row, col, prop, value, cellProperties);
}

exports.default = numericRenderer;