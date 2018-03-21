'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BLOCKSTACK_GAIA_HUB_LABEL = undefined;
exports.uploadToGaiaHub = uploadToGaiaHub;
exports.getFullReadUrl = getFullReadUrl;
exports.connectToGaiaHub = connectToGaiaHub;
exports.setLocalGaiaHubConnection = setLocalGaiaHubConnection;
exports.getOrSetLocalGaiaHubConnection = getOrSetLocalGaiaHubConnection;
exports.getBucketUrl = getBucketUrl;

var _bitcoinjsLib = require('bitcoinjs-lib');

var _bitcoinjsLib2 = _interopRequireDefault(_bitcoinjsLib);

var _bigi = require('bigi');

var _bigi2 = _interopRequireDefault(_bigi);

var _authApp = require('../auth/authApp');

var _authConstants = require('../auth/authConstants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BLOCKSTACK_GAIA_HUB_LABEL = exports.BLOCKSTACK_GAIA_HUB_LABEL = 'blockstack-gaia-hub-config';

function uploadToGaiaHub(filename, contents, hubConfig) {
  var contentType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'application/octet-stream';

  return new Promise(function (resolve) {
    console.log('uploadToGaiaHub: uploading ' + filename + ' to ' + hubConfig.server);
    return fetch(hubConfig.server + '/store/' + hubConfig.address + '/' + filename, { method: 'POST',
      headers: {
        'Content-Type': contentType,
        Authorization: 'bearer ' + hubConfig.token
      },
      body: contents }).then(function (response) {
      return response.text();
    }).then(function (responseText) {
      return JSON.parse(responseText);
    }).then(function (responseJSON) {
      resolve(responseJSON.publicURL);
    });
  });
}

function getFullReadUrl(filename, hubConfig) {
  return '' + hubConfig.url_prefix + hubConfig.address + '/' + filename;
}

function connectToGaiaHub(gaiaHubUrl, challengeSignerHex) {
  console.log('connectToGaiaHub: ' + gaiaHubUrl + '/hub_info');
  var challengeSigner = new _bitcoinjsLib2.default.ECPair(_bigi2.default.fromHex(challengeSignerHex));
  return new Promise(function (resolve) {
    fetch(gaiaHubUrl + '/hub_info').then(function (response) {
      return response.text();
    }).then(function (responseText) {
      return JSON.parse(responseText);
    }).then(function (responseJSON) {
      var readURL = responseJSON.read_url_prefix;
      var challenge = responseJSON.challenge_text;
      var digest = _bitcoinjsLib2.default.crypto.sha256(challenge);
      var signature = challengeSigner.sign(digest).toDER().toString('hex');
      var publickey = challengeSigner.getPublicKeyBuffer().toString('hex');
      var token = new Buffer(JSON.stringify({ publickey: publickey, signature: signature })).toString('base64');
      var address = challengeSigner.getAddress();
      resolve({ url_prefix: readURL,
        address: address,
        token: token,
        server: gaiaHubUrl });
    });
  });
}

/**
 * These two functions are app-specific connections to gaia hub,
 *   they read the user data object for information on setting up
 *   a hub connection, and store the hub config to localstorage
 * @private
 * @returns {Promise} that resolves to the new gaia hub connection
 */
function setLocalGaiaHubConnection() {
  var userData = (0, _authApp.loadUserData)();

  if (!userData.hubUrl) {
    userData.hubUrl = _authConstants.BLOCKSTACK_DEFAULT_GAIA_HUB_URL;

    window.localStorage.setItem(_authConstants.BLOCKSTACK_STORAGE_LABEL, JSON.stringify(userData));

    userData = (0, _authApp.loadUserData)();
  }

  return connectToGaiaHub(userData.hubUrl, userData.appPrivateKey).then(function (gaiaConfig) {
    localStorage.setItem(BLOCKSTACK_GAIA_HUB_LABEL, JSON.stringify(gaiaConfig));
    return gaiaConfig;
  });
}

function getOrSetLocalGaiaHubConnection() {
  var hubConfig = JSON.parse(localStorage.getItem(BLOCKSTACK_GAIA_HUB_LABEL));
  if (hubConfig !== null) {
    return new Promise(function (resolve) {
      return resolve(hubConfig);
    });
  } else {
    return setLocalGaiaHubConnection();
  }
}

function getBucketUrl(gaiaHubUrl, appPrivateKey) {
  console.log('connectToGaiaHub: ' + gaiaHubUrl + '/hub_info');
  var challengeSigner = new _bitcoinjsLib2.default.ECPair(_bigi2.default.fromHex(appPrivateKey));
  return new Promise(function (resolve) {
    fetch(gaiaHubUrl + '/hub_info').then(function (response) {
      return response.text();
    }).then(function (responseText) {
      return JSON.parse(responseText);
    }).then(function (responseJSON) {
      var readURL = responseJSON.read_url_prefix;
      var address = challengeSigner.getAddress();
      var bucketUrl = '' + readURL + address + '/';
      resolve(bucketUrl);
    });
  });
}