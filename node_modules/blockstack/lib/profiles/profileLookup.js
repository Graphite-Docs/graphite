'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lookupProfile = lookupProfile;

var _profileZoneFiles = require('./profileZoneFiles');

var _config = require('../config');

/**
 * Look up a user profile by blockstack ID
 *
 * @param {string} username - The Blockstack ID of the profile to look up
 * @param {string} [zoneFileLookupURL=null] - The URL
 * to use for zonefile lookup. If falsey, lookupProfile will use the
 * blockstack.js getNameInfo function.
 * @returns {Promise} that resolves to a profile object
 */
function lookupProfile(username) {
  var zoneFileLookupURL = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (!username) {
    return Promise.reject();
  }
  var lookupPromise = void 0;
  if (zoneFileLookupURL) {
    var url = zoneFileLookupURL.replace(/\/$/, '') + '/' + username;
    lookupPromise = fetch(url).then(function (response) {
      return response.json();
    });
  } else {
    lookupPromise = _config.config.network.getNameInfo(username);
  }
  return lookupPromise.then(function (responseJSON) {
    if (responseJSON.hasOwnProperty('zonefile') && responseJSON.hasOwnProperty('address')) {
      return (0, _profileZoneFiles.resolveZoneFileToProfile)(responseJSON.zonefile, responseJSON.address);
    } else {
      throw new Error('Invalid zonefile lookup response: did not contain `address`' + ' or `zonefile` field');
    }
  });
}