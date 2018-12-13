'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAuthRequestFromURL = getAuthRequestFromURL;
exports.fetchAppManifest = fetchAppManifest;
exports.redirectUserToApp = redirectUserToApp;

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var _jsontokens = require('jsontokens');

var _index = require('../index');

var _utils = require('../utils');

var _logger = require('../logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Retrieves the authentication request from the query string
 * @return {String|null} the authentication request or `null` if
 * the query string parameter `authRequest` is not found
 * @private
 */
function getAuthRequestFromURL() {
  var queryDict = _queryString2.default.parse(location.search);
  if (queryDict.authRequest !== null && queryDict.authRequest !== undefined) {
    return queryDict.authRequest.split(_utils.BLOCKSTACK_HANDLER + ':').join('');
  } else {
    return null;
  }
}

/**
 * Fetches the contents of the manifest file specified in the authentication request
 *
 * @param  {String} authRequest encoded and signed authentication request
 * @return {Promise<Object|String>} Returns a `Promise` that resolves to the JSON
 * object manifest file unless there's an error in which case rejects with an error
 * message.
 * @private
 */
function fetchAppManifest(authRequest) {
  return new Promise(function (resolve, reject) {
    if (!authRequest) {
      reject('Invalid auth request');
    } else {
      var payload = (0, _jsontokens.decodeToken)(authRequest).payload;
      var manifestURI = payload.manifest_uri;
      try {
        _logger.Logger.debug('Fetching manifest from ' + manifestURI);
        fetch(manifestURI).then(function (response) {
          return response.text();
        }).then(function (responseText) {
          return JSON.parse(responseText);
        }).then(function (responseJSON) {
          resolve(responseJSON);
        }).catch(function (e) {
          _logger.Logger.debug(e.stack);
          reject('Could not fetch manifest.json');
        });
      } catch (e) {
        _logger.Logger.debug(e.stack);
        reject('Could not fetch manifest.json');
      }
    }
  });
}

/**
 * Redirect the user's browser to the app using the `redirect_uri`
 * specified in the authentication request, passing the authentication
 * response token as a query parameter.
 *
 * @param {String} authRequest  encoded and signed authentication request token
 * @param  {String} authResponse encoded and signed authentication response token
 * @return {void}
 * @throws {Error} if there is no redirect uri
 * @private
 */
function redirectUserToApp(authRequest, authResponse) {
  var payload = (0, _jsontokens.decodeToken)(authRequest).payload;
  var redirectURI = payload.redirect_uri;
  _logger.Logger.debug(redirectURI);
  if (redirectURI) {
    redirectURI = (0, _index.updateQueryStringParameter)(redirectURI, 'authResponse', authResponse);
  } else {
    throw new Error('Invalid redirect URI');
  }
  window.location = redirectURI;
}