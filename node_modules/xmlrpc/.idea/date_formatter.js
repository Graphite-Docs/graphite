var dateFormatter = exports

// Source: http://webcloud.se/log/JavaScript-and-ISO-8601/
var iso8601 = new RegExp(
  '([0-9]{4})([-]?([0-9]{2})([-]?([0-9]{2})'
+ '(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?'
+ '(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?'
)

/*
 * Converts a date time stamp following the ISO8601 format to a JavaScript Date
 * object.
 *
 * @param {String} time - String representation of timestamp.
 * @return {Date}       - Date object from timestamp.
 */
dateFormatter.decodeIso8601 = function(time) {
  var dateParts = time.toString().match(iso8601)
  if (!dateParts) {
    throw new Error('Expected a ISO8601 datetime but got \'' + time + '\'')
  }

  var date = [
    [dateParts[1], dateParts[3] || '01', dateParts[5] || '01'].join('-')
    , 'T'
    , [dateParts[7] || '00', dateParts[8] || '00', dateParts[10] || '00'].join(':')
    , '.'
    , dateParts[12] || '000'
    , dateParts[13] || dateFormatter.formatCurrentOffset()
  ].join('')

  return new Date(date)
}

/**
 * Converts a JavaScript Date object to an ISO8601 timestamp.
 *
 * @param {Date} date - Date object.
 * @return {String}   - String representation of timestamp.
 */
dateFormatter.encodeIso8601 = function(date) {
  return date.toISOString().replace(/\.\d{3}Z/, 'Z')
}

/**
 * Helper function to pad the digits with 0s to meet date formatting
 * requirements.
 *
 * @param {Number} digit  - The number to pad.
 * @param {Number} length - Length of digit string, prefix with 0s if not
 *                          already length.
 * @return {String}       - String with the padded digit
 */
function zeroPad(digit, length) {
  var padded = '' + digit
  while (padded.length < length) {
    padded = '0' + padded
  }

  return padded
}

/**
 * Helper function to get the current timezone to default decoding to
 * rather than UTC. (for backward compatibility)
 *
 * @return {String} - in the format /Z|[+-]\d{2}:\d{2}/
 */
dateFormatter.formatCurrentOffset = function () {
  var offset = new Date().getTimezoneOffset()
  return (offset === 0) ? 'Z' : [
      (offset < 0) ? '+' : '-'
    , zeroPad(Math.abs(Math.floor(offset/60)),2)
    , ':'
    , zeroPad(Math.abs(offset%60),2)
  ].join('')
}
