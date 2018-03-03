'use strict';

exports.__esModule = true;

var _errors;

exports['default'] = error;
exports.isValidStrict = isValidStrict;
var ERROR = exports.ERROR = 'ERROR';
var ERROR_DIV_ZERO = exports.ERROR_DIV_ZERO = 'DIV/0';
var ERROR_NAME = exports.ERROR_NAME = 'NAME';
var ERROR_NOT_AVAILABLE = exports.ERROR_NOT_AVAILABLE = 'N/A';
var ERROR_NULL = exports.ERROR_NULL = 'NULL';
var ERROR_NUM = exports.ERROR_NUM = 'NUM';
var ERROR_REF = exports.ERROR_REF = 'REF';
var ERROR_VALUE = exports.ERROR_VALUE = 'VALUE';

var errors = (_errors = {}, _errors[ERROR] = '#ERROR!', _errors[ERROR_DIV_ZERO] = '#DIV/0!', _errors[ERROR_NAME] = '#NAME?', _errors[ERROR_NOT_AVAILABLE] = '#N/A', _errors[ERROR_NULL] = '#NULL!', _errors[ERROR_NUM] = '#NUM!', _errors[ERROR_REF] = '#REF!', _errors[ERROR_VALUE] = '#VALUE!', _errors);

/**
 * Return error type based on provided error id.
 *
 * @param {String} type Error type.
 * @returns {String|null} Returns error id.
 */
function error(type) {
  var result = void 0;

  type = (type + '').replace(/#|!|\?/g, '');

  if (errors[type]) {
    result = errors[type];
  }

  return result ? result : null;
}

/**
 * Check if error type is strict valid with knows errors.
 *
 * @param {String} Error type.
 * @return {Boolean}
 */
function isValidStrict(type) {
  var valid = false;

  for (var i in errors) {
    if (Object.prototype.hasOwnProperty.call(errors, i) && errors[i] === type) {
      valid = true;
      break;
    }
  }

  return valid;
}