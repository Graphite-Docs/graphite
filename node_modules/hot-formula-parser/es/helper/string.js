/* eslint-disable import/prefer-default-export */
/**
 * Trim value by cutting character starting from the beginning and ending at the same time.
 *
 * @param {String} string String to trimming.
 * @param {Number} [margin=1] Number of character to cut.
 * @returns {String}
 */
export function trimEdges(string) {
  var margin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  string = string.substring(margin, string.length - margin);

  return string;
}