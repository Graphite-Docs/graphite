'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeAuthRequest = makeAuthRequest;
exports.encryptPrivateKey = encryptPrivateKey;
exports.decryptPrivateKey = decryptPrivateKey;
exports.makeAuthResponse = makeAuthResponse;

var _jsontokens = require('jsontokens');

var _index = require('../index');

var _authConstants = require('./authConstants');

var _encryption = require('../encryption');

require('isomorphic-fetch');

var VERSION = '1.1.0';

/**
 * Generates an authentication request that can be sent to the Blockstack
 * browser for the user to approve sign in.
 * @param  {String} [transitPrivateKey=generateAndStoreTransitKey()] - hex encoded transit
 *   private key
 * @param {String} redirectURI - location to redirect user to after sign in approval
 * @param {String} manifestURI - location of this app's manifest file
 * @param {Array<String>} scopes - the permissions this app is requesting
 * @param {String} appDomain - the origin of this app
 * @param {Number} expiresAt - the time at which this request is no longer valid
 * @return {String} the authentication request
 */
function makeAuthRequest() {
  var transitPrivateKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _index.generateAndStoreTransitKey)();
  var redirectURI = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window.location.origin + '/';
  var manifestURI = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window.location.origin + '/manifest.json';
  var scopes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _authConstants.DEFAULT_SCOPE;
  var appDomain = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : window.location.origin;
  var expiresAt = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : (0, _index.nextHour)().getTime();

  /* Create the payload */
  var payload = {
    jti: (0, _index.makeUUID4)(),
    iat: Math.floor(new Date().getTime() / 1000), // JWT times are in seconds
    exp: Math.floor(expiresAt / 1000), // JWT times are in seconds
    iss: null,
    public_keys: [],
    domain_name: appDomain,
    manifest_uri: manifestURI,
    redirect_uri: redirectURI,
    version: VERSION,
    do_not_include_profile: true,
    supports_hub_url: true,
    scopes: scopes
  };

  console.log('blockstack.js: generating v' + VERSION + ' auth request');

  /* Convert the private key to a public key to an issuer */
  var publicKey = _jsontokens.SECP256K1Client.derivePublicKey(transitPrivateKey);
  payload.public_keys = [publicKey];
  var address = (0, _index.publicKeyToAddress)(publicKey);
  payload.iss = (0, _index.makeDIDFromAddress)(address);

  /* Sign and return the token */
  var tokenSigner = new _jsontokens.TokenSigner('ES256k', transitPrivateKey);
  var token = tokenSigner.sign(payload);

  return token;
}

function encryptPrivateKey(publicKey, privateKey) {
  var encryptedObj = (0, _encryption.encryptECIES)(publicKey, privateKey);
  var encryptedJSON = JSON.stringify(encryptedObj);
  return new Buffer(encryptedJSON).toString('hex');
}

function decryptPrivateKey(privateKey, hexedEncrypted) {
  var unhexedString = new Buffer(hexedEncrypted, 'hex').toString();
  var encryptedObj = JSON.parse(unhexedString);
  return (0, _encryption.decryptECIES)(privateKey, encryptedObj);
}

function makeAuthResponse(privateKey) {
  var profile = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var username = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var metadata = arguments[3];
  var coreToken = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var appPrivateKey = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  var expiresAt = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : (0, _index.nextMonth)().getTime();
  var transitPublicKey = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
  var hubUrl = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : null;

  /* Convert the private key to a public key to an issuer */
  var publicKey = _jsontokens.SECP256K1Client.derivePublicKey(privateKey);
  var address = (0, _index.publicKeyToAddress)(publicKey);

  /* See if we should encrypt with the transit key */
  var privateKeyPayload = appPrivateKey;
  var coreTokenPayload = coreToken;
  var additionalProperties = {};
  if (appPrivateKey !== undefined && appPrivateKey !== null) {
    console.log('blockstack.js: generating v' + VERSION + ' auth response');
    if (transitPublicKey !== undefined && transitPublicKey !== null) {
      privateKeyPayload = encryptPrivateKey(transitPublicKey, appPrivateKey);
      if (coreToken !== undefined && coreToken !== null) {
        coreTokenPayload = encryptPrivateKey(transitPublicKey, coreToken);
      }
    }
    additionalProperties = {
      email: metadata.email ? metadata.email : null,
      profile_url: metadata.profileUrl ? metadata.profileUrl : null,
      hubUrl: hubUrl,
      version: VERSION
    };
  } else {
    console.log('blockstack.js: generating legacy auth response');
  }

  /* Create the payload */
  var payload = Object.assign({}, {
    jti: (0, _index.makeUUID4)(),
    iat: Math.floor(new Date().getTime() / 1000), // JWT times are in seconds
    exp: Math.floor(expiresAt / 1000), // JWT times are in seconds
    iss: (0, _index.makeDIDFromAddress)(address),
    private_key: privateKeyPayload,
    public_keys: [publicKey],
    profile: profile,
    username: username,
    core_token: coreTokenPayload
  }, additionalProperties);

  /* Sign and return the token */
  var tokenSigner = new _jsontokens.TokenSigner('ES256k', privateKey);
  return tokenSigner.sign(payload);
}