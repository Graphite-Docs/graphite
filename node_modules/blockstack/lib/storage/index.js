'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GaiaHubConfig = exports.BLOCKSTACK_GAIA_HUB_LABEL = exports.uploadToGaiaHub = exports.connectToGaiaHub = undefined;
exports.getUserAppFileUrl = getUserAppFileUrl;
exports.getFile = getFile;
exports.putFile = putFile;
exports.getAppBucketUrl = getAppBucketUrl;
exports.deleteFile = deleteFile;

var _hub = require('./hub');

var _encryption = require('../encryption');

var _auth = require('../auth');

var _keys = require('../keys');

var _profiles = require('../profiles');

/**
 * Fetch the public read URL of a user file for the specified app.
 * @param {String} path - the path to the file to read
 * @param {String} username - The Blockstack ID of the user to look up
 * @param {String} appOrigin - The app origin
 * @param {string} [zoneFileLookupURL=http://localhost:6270/v1/names/] The URL
 * to use for zonefile lookup
 * @return {Promise} that resolves to the public read URL of the file
 * or rejects with an error
 */
function getUserAppFileUrl(path, username, appOrigin) {
  var zoneFileLookupURL = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'http://localhost:6270/v1/names/';

  return (0, _profiles.lookupProfile)(username, zoneFileLookupURL).then(function (profile) {
    if (profile.hasOwnProperty('apps')) {
      if (profile.apps.hasOwnProperty(appOrigin)) {
        return profile.apps[appOrigin];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }).then(function (bucketUrl) {
    if (bucketUrl) {
      var bucket = bucketUrl.replace(/\/?(\?|#|$)/, '/$1');
      return '' + bucket + path;
    } else {
      return null;
    }
  });
}

/**
 * Retrieves the specified file from the app's data store.
 * @param {String} path - the path to the file to read
 * @param {Object} [options=null] - options object
 * @param {Boolean} [options.decrypt=false] - try to decrypt the data with the app private key
 * @param {String} options.username - the Blockstack ID to lookup for multi-player storage
 * @param {String} options.app - the app to lookup for multi-player storage -
 * defaults to current origin
 * @param {String} [options.zoneFileLookupURL=http://localhost:6270/v1/names/] - the Blockstack
 * core endpoint URL to use for zonefile lookup
 * @returns {Promise} that resolves to the raw data in the file
 * or rejects with an error
 */


function getFile(path, options) {
  var defaults = {
    decrypt: false,
    username: null,
    app: window.location.origin,
    zoneFileLookupURL: 'http://localhost:6270/v1/names/'
  };

  var opt = Object.assign({}, defaults, options);

  return (0, _hub.getOrSetLocalGaiaHubConnection)().then(function (gaiaHubConfig) {
    if (opt.username) {
      return getUserAppFileUrl(path, opt.username, opt.app, opt.zoneFileLookupURL);
    } else {
      return (0, _hub.getFullReadUrl)(path, gaiaHubConfig);
    }
  }).then(function (readUrl) {
    return new Promise(function (resolve, reject) {
      if (!readUrl) {
        reject(null);
      } else {
        resolve(readUrl);
      }
    });
  }).then(function (readUrl) {
    return fetch(readUrl);
  }).then(function (response) {
    if (response.status !== 200) {
      if (response.status === 404) {
        console.log('getFile ' + path + ' returned 404, returning null');
        return null;
      } else {
        throw new Error('getFile ' + path + ' failed with HTTP status ' + response.status);
      }
    }
    var contentType = response.headers.get('Content-Type');
    if (contentType === null || opt.decrypt || contentType.startsWith('text') || contentType === 'application/json') {
      return response.text();
    } else {
      return response.arrayBuffer();
    }
  }).then(function (storedContents) {
    if (opt.decrypt && storedContents !== null) {
      var privateKey = (0, _auth.loadUserData)().appPrivateKey;
      var cipherObject = JSON.parse(storedContents);
      return (0, _encryption.decryptECIES)(privateKey, cipherObject);
    } else {
      return storedContents;
    }
  });
}

/**
 * Stores the data provided in the app's data store to to the file specified.
 * @param {String} path - the path to store the data in
 * @param {String|Buffer} content - the data to store in the file
 * @param {Object} [options=null]- options object
 * @param {Boolean} [options.encrypt=false] - encrypt the data with the app private key
 * @return {Promise} that resolves if the operation succeed and rejects
 * if it failed
 */
function putFile(path, content, options) {
  var defaults = {
    encrypt: false
  };

  var opt = Object.assign({}, defaults, options);

  var contentType = 'text/plain';
  if (typeof content !== 'string') {
    contentType = 'application/octet-stream';
  }
  if (opt.encrypt) {
    var privateKey = (0, _auth.loadUserData)().appPrivateKey;
    var publicKey = (0, _keys.getPublicKeyFromPrivate)(privateKey);
    var cipherObject = (0, _encryption.encryptECIES)(publicKey, content);
    content = JSON.stringify(cipherObject);
    contentType = 'application/json';
  }
  return (0, _hub.getOrSetLocalGaiaHubConnection)().then(function (gaiaHubConfig) {
    return (0, _hub.uploadToGaiaHub)(path, content, gaiaHubConfig, contentType);
  });
}

/**
 * Get the app storage bucket URL
 * @param {String} gaiaHubUrl - the gaia hub URL
 * @param {String} appPrivateKey - the app private key used to generate the app address
 * @returns {Promise} That resolves to the URL of the app index file
 * or rejects if it fails
 */
function getAppBucketUrl(gaiaHubUrl, appPrivateKey) {
  return (0, _hub.getBucketUrl)(gaiaHubUrl, appPrivateKey);
}

/**
 * Deletes the specified file from the app's data store.
 * @param {String} path - the path to the file to delete
 * @returns {Promise} that resolves when the file has been removed
 * or rejects with an error
 */
function deleteFile(path) {
  throw new Error('Delete of ' + path + ' not supported by gaia hubs');
}

exports.connectToGaiaHub = _hub.connectToGaiaHub;
exports.uploadToGaiaHub = _hub.uploadToGaiaHub;
exports.BLOCKSTACK_GAIA_HUB_LABEL = _hub.BLOCKSTACK_GAIA_HUB_LABEL;
exports.GaiaHubConfig = _hub.GaiaHubConfig;