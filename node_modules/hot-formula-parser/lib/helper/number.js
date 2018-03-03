'use strict';

exports.__esModule = true;
exports.toNumber = toNumber;
exports.invertNumber = invertNumber;
/**
 * Convert value into number.
 *
 * @param {String|Number} number
 * @returns {*}
 */
function toNumber(number) {
  var result = void 0;

  if (typeof number === 'number') {
    result = number;
  } else if (typeof number === 'string') {
    result = number.indexOf('.') > -1 ? parseFloat(number) : parseInt(number, 10);
  }

  return result;
}

/**
 * Invert provided number.
 *
 * @param {Number} number
 * @returns {Number} Returns inverted number.
 */
function invertNumber(number) {
  return -1 * toNumber(number);
}