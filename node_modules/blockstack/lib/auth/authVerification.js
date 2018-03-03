'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.doSignaturesMatchPublicKeys = doSignaturesMatchPublicKeys;
exports.doPublicKeysMatchIssuer = doPublicKeysMatchIssuer;
exports.doPublicKeysMatchUsername = doPublicKeysMatchUsername;
exports.isIssuanceDateValid = isIssuanceDateValid;
exports.isExpirationDateValid = isExpirationDateValid;
exports.isManifestUriValid = isManifestUriValid;
exports.isRedirectUriValid = isRedirectUriValid;
exports.verifyAuthRequest = verifyAuthRequest;
exports.verifyAuthRequestAndLoadManifest = verifyAuthRequestAndLoadManifest;
exports.verifyAuthResponse = verifyAuthResponse;

var _jsontokens = require('jsontokens');

var _index = require('../index');

function doSignaturesMatchPublicKeys(token) {
  var payload = (0, _jsontokens.decodeToken)(token).payload;
  var publicKeys = payload.public_keys;
  if (publicKeys.length === 1) {
    var publicKey = publicKeys[0];
    try {
      var tokenVerifier = new _jsontokens.TokenVerifier('ES256k', publicKey);
      var signatureVerified = tokenVerifier.verify(token);
      if (signatureVerified) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  } else {
    throw new Error('Multiple public keys are not supported');
  }
}

function doPublicKeysMatchIssuer(token) {
  var payload = (0, _jsontokens.decodeToken)(token).payload;
  var publicKeys = payload.public_keys;
  var addressFromIssuer = (0, _index.getAddressFromDID)(payload.iss);

  if (publicKeys.length === 1) {
    var addressFromPublicKeys = (0, _index.publicKeyToAddress)(publicKeys[0]);
    if (addressFromPublicKeys === addressFromIssuer) {
      return true;
    }
  } else {
    throw new Error('Multiple public keys are not supported');
  }

  return false;
}

function doPublicKeysMatchUsername(token, nameLookupURL) {
  return new Promise(function (resolve) {
    var payload = (0, _jsontokens.decodeToken)(token).payload;

    if (!payload.username) {
      resolve(true);
      return;
    }

    if (payload.username === null) {
      resolve(true);
      return;
    }

    if (nameLookupURL === null) {
      resolve(false);
      return;
    }

    var username = payload.username;
    var url = nameLookupURL.replace(/\/$/, '') + '/' + username;

    try {
      fetch(url).then(function (response) {
        return response.text();
      }).then(function (responseText) {
        return JSON.parse(responseText);
      }).then(function (responseJSON) {
        if (responseJSON.hasOwnProperty('address')) {
          var nameOwningAddress = responseJSON.address;
          var addressFromIssuer = (0, _index.getAddressFromDID)(payload.iss);
          if (nameOwningAddress === addressFromIssuer) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      }).catch(function () {
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

function isIssuanceDateValid(token) {
  var payload = (0, _jsontokens.decodeToken)(token).payload;
  if (payload.iat) {
    if (typeof payload.iat !== 'number') {
      return false;
    }
    var issuedAt = new Date(payload.iat * 1000); // JWT times are in seconds
    if (new Date().getTime() < issuedAt.getTime()) {
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
}

function isExpirationDateValid(token) {
  var payload = (0, _jsontokens.decodeToken)(token).payload;
  if (payload.exp) {
    if (typeof payload.exp !== 'number') {
      return false;
    }
    var expiresAt = new Date(payload.exp * 1000); // JWT times are in seconds
    if (new Date().getTime() > expiresAt.getTime()) {
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
}

function isManifestUriValid(token) {
  var payload = (0, _jsontokens.decodeToken)(token).payload;
  return (0, _index.isSameOriginAbsoluteUrl)(payload.domain_name, payload.manifest_uri);
}

function isRedirectUriValid(token) {
  var payload = (0, _jsontokens.decodeToken)(token).payload;
  return (0, _index.isSameOriginAbsoluteUrl)(payload.domain_name, payload.redirect_uri);
}

/**
 * Verify authentication request is valid
 * @param  {String} token [description]
 * @return {Promise} that resolves to true if the auth request
 *  is valid and false if it does not
 *  @private
 */
function verifyAuthRequest(token) {
  return new Promise(function (resolve, reject) {
    if ((0, _jsontokens.decodeToken)(token).header.alg === 'none') {
      reject('Token must be signed in order to be verified');
    }

    Promise.all([isExpirationDateValid(token), isIssuanceDateValid(token), doSignaturesMatchPublicKeys(token), doPublicKeysMatchIssuer(token), isManifestUriValid(token), isRedirectUriValid(token)]).then(function (values) {
      if (values.every(Boolean)) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * Verify the authentication response is valid and
 * fetch the app manifest file if valid. Otherwise, reject the promise.
 * @param  {String} token the authentication request token
 * @return {Promise} that resolves to the app manifest file in JSON format
 * or rejects if the auth request or app manifest file is invalid
 * @private
 */
function verifyAuthRequestAndLoadManifest(token) {
  return new Promise(function (resolve, reject) {
    return verifyAuthRequest(token).then(function (valid) {
      if (valid) {
        return (0, _index.fetchAppManifest)(token).then(function (appManifest) {
          resolve(appManifest);
        });
      } else {
        reject();
        return Promise.reject();
      }
    });
  });
}

/**
 * Verify the authentication response is valid
 * @param {String} token the authentication response token
 * @param {String} nameLookupURL the url use to verify owner of a username
 * @return {Promise} that resolves to true if auth response
 * is valid and false if it does not
 */
function verifyAuthResponse(token, nameLookupURL) {
  return new Promise(function (resolve) {
    Promise.all([isExpirationDateValid(token), isIssuanceDateValid(token), doSignaturesMatchPublicKeys(token), doPublicKeysMatchIssuer(token), doPublicKeysMatchUsername(token, nameLookupURL)]).then(function (values) {
      if (values.every(Boolean)) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}