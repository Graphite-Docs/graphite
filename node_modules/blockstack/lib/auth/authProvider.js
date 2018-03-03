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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAuthRequestFromURL() {
  var queryDict = _queryString2.default.parse(location.search);
  if (queryDict.authRequest !== null && queryDict.authRequest !== undefined) {
    return queryDict.authRequest.split(_utils.BLOCKSTACK_HANDLER + ':').join('');
  } else {
    return null;
  }
}

function fetchAppManifest(authRequest) {
  return new Promise(function (resolve, reject) {
    if (!authRequest) {
      reject('Invalid auth request');
    } else {
      var payload = (0, _jsontokens.decodeToken)(authRequest).payload;
      var manifestURI = payload.manifest_uri;
      try {
        fetch(manifestURI).then(function (response) {
          return response.text();
        }).then(function (responseText) {
          return JSON.parse(responseText);
        }).then(function (responseJSON) {
          resolve(responseJSON);
        }).catch(function (e) {
          console.log(e.stack);
          reject('URI request couldn\'t be completed');
        });
      } catch (e) {
        console.log(e.stack);
        reject('URI request couldn\'t be completed');
      }
    }
  });
}

function redirectUserToApp(authRequest, authResponse) {
  var payload = (0, _jsontokens.decodeToken)(authRequest).payload;
  var redirectURI = payload.redirect_uri;
  console.log(redirectURI);
  if (redirectURI) {
    redirectURI = (0, _index.updateQueryStringParameter)(redirectURI, 'authResponse', authResponse);
  } else {
    throw new Error('Invalid redirect URI');
  }
  window.location = redirectURI;
}