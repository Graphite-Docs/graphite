'use strict';

exports.__esModule = true;
exports.default = numericValidator;
/**
 * Numeric cell validator
 *
 * @private
 * @validator NumericValidator
 * @param {*} value - Value of edited cell
 * @param {*} callback - Callback called with validation result
 */
function numericValidator(value, callback) {
  if (value == null) {
    value = '';
  }
  if (this.allowEmpty && value === '') {
    callback(true);
  } else if (value === '') {
    callback(false);
  } else {
    callback(/^-?\d*(\.|,)?\d*$/.test(value));
  }
};