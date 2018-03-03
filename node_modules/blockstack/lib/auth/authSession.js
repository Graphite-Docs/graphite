'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeCoreSessionRequest = makeCoreSessionRequest;
exports.sendCoreSessionRequest = sendCoreSessionRequest;
exports.getCoreSession = getCoreSession;

var _jsontokens = require('jsontokens');

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Create an authentication token to be sent to the Core API server
 * in order to generate a Core session JWT.
 *
 * @param appDomain (String) The unique application identifier (e.g. foo.app, www.foo.com, etc).
 * @param appMethods (Array) The list of API methods this application will need.
 * @param appPrivateKey (String) The application-specific private key
 * @param blockchainId (String|null) This is the blockchain ID of the requester,
 *
 * @returns a JWT signed by the app's private key
 * @private
 */
function makeCoreSessionRequest(appDomain, appMethods, appPrivateKey) {
  var blockchainID = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var thisDevice = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

  if (thisDevice === null) {
    thisDevice = '.default';
  }

  // TODO: multi-device
  var appPublicKey = _jsontokens.SECP256K1Client.derivePublicKey(appPrivateKey);
  var appPublicKeys = [{
    public_key: appPublicKey,
    device_id: thisDevice
  }];

  var authBody = {
    version: 1,
    blockchain_id: blockchainID,
    app_private_key: appPrivateKey,
    app_domain: appDomain,
    methods: appMethods,
    app_public_keys: appPublicKeys,
    device_id: thisDevice

    // make token
  };var tokenSigner = new _jsontokens.TokenSigner('ES256k', appPrivateKey);
  var token = tokenSigner.sign(authBody);

  return token;
}

/*
 * Send Core a request for a session token.
 *
 * @param coreAuthRequest (String) a signed JWT encoding the authentication request
 * @param apiPassword (String) the API password for Core
 *
 * Returns a JWT signed with the Core API server's private key that authorizes the bearer
 * to carry out the requested operations.
 * @private
 */
function sendCoreSessionRequest(coreHost, corePort, coreAuthRequest, apiPassword) {
  return new Promise(function (resolve, reject) {
    if (!apiPassword) {
      reject('Missing API password');
      return null;
    }

    var options = {
      headers: {
        Authorization: 'bearer ' + apiPassword
      }
    };

    var url = 'http://' + coreHost + ':' + corePort + '/v1/auth?authRequest=' + coreAuthRequest;

    return (0, _isomorphicFetch2.default)(url, options).then(function (response) {
      if (!response.ok) {
        reject('HTTP status not OK');
        return null;
      }
      return response.text();
    }).then(function (responseText) {
      return JSON.parse(responseText);
    }).then(function (responseJson) {
      var token = responseJson.token;
      if (!token) {
        reject('Failed to get Core session token');
        return null;
      }
      resolve(token);
      return token;
    }).catch(function (error) {
      console.error(error);
      reject('Invalid Core response: not JSON');
    });
  });
}

/*
 * Get a core session token.  Generate an auth request, sign it, send it to Core,
 * and get back a session token.
 *
 * @param coreHost (String) Core API server's hostname
 * @param corePort (Integer) Core API server's port number
 * @param appPrivateKey (String) Application's private key
 * @param blockchainId (String|null) blockchain ID of the user signing in.
 * `null` if user has no blockchain ID
 *
 * Returns a Promise that resolves to a Core session token.
 * @private
 */
function getCoreSession(coreHost, corePort, apiPassword, appPrivateKey) {
  var blockchainId = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var authRequest = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  var deviceId = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : '0';

  if (!authRequest) {
    return Promise.reject('No authRequest provided');
  }

  var payload = null;
  var authRequestObject = null;
  try {
    authRequestObject = (0, _jsontokens.decodeToken)(authRequest);
    if (!authRequestObject) {
      return Promise.reject('Invalid authRequest in URL query string');
    }
    if (!authRequestObject.payload) {
      return Promise.reject('Invalid authRequest in URL query string');
    }
    payload = authRequestObject.payload;
  } catch (e) {
    console.error(e.stack);
    return Promise.reject('Failed to parse authRequest in URL');
  }

  var appDomain = payload.domain_name;
  if (!appDomain) {
    return Promise.reject('No domain_name in authRequest');
  }
  var appMethods = payload.scopes;

  var coreAuthRequest = makeCoreSessionRequest(appDomain, appMethods, appPrivateKey, blockchainId, deviceId);

  return sendCoreSessionRequest(coreHost, corePort, coreAuthRequest, apiPassword);
}