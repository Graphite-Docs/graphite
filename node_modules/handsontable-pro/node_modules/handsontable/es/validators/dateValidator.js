import moment from 'moment';
import { getNormalizedDate } from '../helpers/date';
import { getEditorInstance } from '../editors';

/**
 * Date cell validator
 *
 * @private
 * @validator DateValidator
 * @dependencies moment
 * @param {*} value - Value of edited cell
 * @param {Function} callback - Callback called with validation result
 */
export default function dateValidator(value, callback) {
  var valid = true;
  var dateEditor = getEditorInstance('date', this.instance);

  if (value == null) {
    value = '';
  }
  var isValidDate = moment(new Date(value)).isValid() || moment(value, dateEditor.defaultDateFormat).isValid();
  // is it in the specified format
  var isValidFormat = moment(value, this.dateFormat || dateEditor.defaultDateFormat, true).isValid();

  if (this.allowEmpty && value === '') {
    isValidDate = true;
    isValidFormat = true;
  }
  if (!isValidDate) {
    valid = false;
  }
  if (!isValidDate && isValidFormat) {
    valid = true;
  }

  if (isValidDate && !isValidFormat) {
    if (this.correctFormat === true) {
      // if format correction is enabled
      var correctedValue = correctFormat(value, this.dateFormat);
      var row = this.instance.runHooks('unmodifyRow', this.row);
      var column = this.instance.runHooks('unmodifyCol', this.col);

      this.instance.setDataAtCell(row, column, correctedValue, 'dateValidator');
      valid = true;
    } else {
      valid = false;
    }
  }

  callback(valid);
};

/**
 * Format the given string using moment.js' format feature
 *
 * @param {String} value
 * @param {String} dateFormat
 * @returns {String}
 */
export function correctFormat(value, dateFormat) {
  var dateFromDate = moment(getNormalizedDate(value));
  var dateFromMoment = moment(value, dateFormat);
  var isAlphanumeric = value.search(/[A-z]/g) > -1;
  var date = void 0;

  if (dateFromDate.isValid() && dateFromDate.format('x') === dateFromMoment.format('x') || !dateFromMoment.isValid() || isAlphanumeric) {
    date = dateFromDate;
  } else {
    date = dateFromMoment;
  }

  return date.format(dateFormat);
};