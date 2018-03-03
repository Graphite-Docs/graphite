var _errors;

export var ERROR = 'ERROR';
export var ERROR_DIV_ZERO = 'DIV/0';
export var ERROR_NAME = 'NAME';
export var ERROR_NOT_AVAILABLE = 'N/A';
export var ERROR_NULL = 'NULL';
export var ERROR_NUM = 'NUM';
export var ERROR_REF = 'REF';
export var ERROR_VALUE = 'VALUE';

var errors = (_errors = {}, _errors[ERROR] = '#ERROR!', _errors[ERROR_DIV_ZERO] = '#DIV/0!', _errors[ERROR_NAME] = '#NAME?', _errors[ERROR_NOT_AVAILABLE] = '#N/A', _errors[ERROR_NULL] = '#NULL!', _errors[ERROR_NUM] = '#NUM!', _errors[ERROR_REF] = '#REF!', _errors[ERROR_VALUE] = '#VALUE!', _errors);

/**
 * Return error type based on provided error id.
 *
 * @param {String} type Error type.
 * @returns {String|null} Returns error id.
 */
export default function error(type) {
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
export function isValidStrict(type) {
  var valid = false;

  for (var i in errors) {
    if (Object.prototype.hasOwnProperty.call(errors, i) && errors[i] === type) {
      valid = true;
      break;
    }
  }

  return valid;
}