'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BLOCKSTACK_HANDLER = undefined;
exports.nextYear = nextYear;
exports.nextMonth = nextMonth;
exports.nextHour = nextHour;
exports.updateQueryStringParameter = updateQueryStringParameter;
exports.isLaterVersion = isLaterVersion;
exports.makeUUID4 = makeUUID4;
exports.isSameOriginAbsoluteUrl = isSameOriginAbsoluteUrl;

var _uriJs = require('uri-js');

var BLOCKSTACK_HANDLER = exports.BLOCKSTACK_HANDLER = 'blockstack';
/**
 * Time
 * @private
 */

function nextYear() {
  return new Date(new Date().setFullYear(new Date().getFullYear() + 1));
}

function nextMonth() {
  return new Date(new Date().setMonth(new Date().getMonth() + 1));
}

function nextHour() {
  return new Date(new Date().setHours(new Date().getHours() + 1));
}

/**
 * Query Strings
 * @private
 */

function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  var separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + value + '$2');
  } else {
    return '' + uri + separator + key + '=' + value;
  }
}

/**
 * Versioning
 * @param {string} v1 - the left half of the version inequality
 * @param {string} v2 - right half of the version inequality
 * @returns {bool} iff v1 >= v2
 */
function isLaterVersion(v1, v2) {
  var v1tuple = v1.split('.').map(function (x) {
    return parseInt(x, 10);
  });
  var v2tuple = v2.split('.').map(function (x) {
    return parseInt(x, 10);
  });

  for (var index = 0; index < v2.length; index++) {
    if (index >= v1.length) {
      v2tuple.push(0);
    }
    if (v1tuple[index] < v2tuple[index]) {
      return false;
    }
  }
  return true;
}

/**
 * UUIDs
 * @private
 */

function makeUUID4() {
  var d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); // use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
}

/**
 * Checks if both urls pass the same origin check & are absolute
 * @param  {[type]}  uri1 first uri to check
 * @param  {[type]}  uri2 second uri to check
 * @return {Boolean} true if they pass the same origin check
 * @private
 */
function isSameOriginAbsoluteUrl(uri1, uri2) {
  var parsedUri1 = (0, _uriJs.parse)(uri1);
  var parsedUri2 = (0, _uriJs.parse)(uri2);

  var port1 = parsedUri1.port | 0 || (parsedUri1.scheme === 'https' ? 443 : 80);
  var port2 = parsedUri2.port | 0 || (parsedUri2.scheme === 'https' ? 443 : 80);

  var match = {
    scheme: parsedUri1.scheme === parsedUri2.scheme,
    hostname: parsedUri1.hostname === parsedUri2.hostname,
    port: port1 === port2,
    absolute: parsedUri1.reference === 'absolute' && parsedUri2.reference === 'absolute'
  };

  return match.scheme && match.hostname && match.port && match.absolute;
}