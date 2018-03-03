'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signProfileToken = signProfileToken;
exports.wrapProfileToken = wrapProfileToken;
exports.verifyProfileToken = verifyProfileToken;
exports.extractProfile = extractProfile;

var _ecurve = require('ecurve');

var _ecurve2 = _interopRequireDefault(_ecurve);

var _bitcoinjsLib = require('bitcoinjs-lib');

var _jsontokens = require('jsontokens');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var secp256k1 = _ecurve2.default.getCurveByName('secp256k1');

/**
  * Signs a profile token
  * @param {Object} profile - the JSON of the profile to be signed
  * @param {String} privateKey - the signing private key
  * @param {Object} subject - the entity that the information is about
  * @param {Object} issuer - the entity that is issuing the token
  * @param {String} signingAlgorithm - the signing algorithm to use
  * @param {Date} issuedAt - the time of issuance of the token
  * @param {Date} expiresAt - the time of expiration of the token
  * @returns {Object} - the signed profile token
  */
function signProfileToken(profile, privateKey) {
  var subject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var issuer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var signingAlgorithm = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'ES256K';
  var issuedAt = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new Date();
  var expiresAt = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : (0, _utils.nextYear)();

  if (signingAlgorithm !== 'ES256K') {
    throw new Error('Signing algorithm not supported');
  }

  var publicKey = _jsontokens.SECP256K1Client.derivePublicKey(privateKey);

  if (subject === null) {
    subject = { publicKey: publicKey };
  }

  if (issuer === null) {
    issuer = { publicKey: publicKey };
  }

  var tokenSigner = new _jsontokens.TokenSigner(signingAlgorithm, privateKey);

  var payload = {
    jti: (0, _utils.makeUUID4)(),
    iat: issuedAt.toISOString(),
    exp: expiresAt.toISOString(),
    subject: subject,
    issuer: issuer,
    claim: profile
  };

  return tokenSigner.sign(payload);
}

/**
  * Wraps a token for a profile token file
  * @param {String} token - the token to be wrapped
  * @returns {Object} - including `token` and `decodedToken` 
  */
function wrapProfileToken(token) {
  return {
    token: token,
    decodedToken: (0, _jsontokens.decodeToken)(token)
  };
}

/**
  * Verifies a profile token
  * @param {String} token - the token to be verified
  * @param {String} publicKeyOrAddress - the public key or address of the
  *   keypair that is thought to have signed the token
  * @returns {Object} - the verified, decoded profile token
  * @throws {Error} - throws an error if token verification fails
  */
function verifyProfileToken(token, publicKeyOrAddress) {
  var decodedToken = (0, _jsontokens.decodeToken)(token);
  var payload = decodedToken.payload;

  // Inspect and verify the subject
  if (payload.hasOwnProperty('subject')) {
    if (!payload.subject.hasOwnProperty('publicKey')) {
      throw new Error('Token doesn\'t have a subject public key');
    }
  } else {
    throw new Error('Token doesn\'t have a subject');
  }

  // Inspect and verify the issuer
  if (payload.hasOwnProperty('issuer')) {
    if (!payload.issuer.hasOwnProperty('publicKey')) {
      throw new Error('Token doesn\'t have an issuer public key');
    }
  } else {
    throw new Error('Token doesn\'t have an issuer');
  }

  // Inspect and verify the claim
  if (!payload.hasOwnProperty('claim')) {
    throw new Error('Token doesn\'t have a claim');
  }

  var issuerPublicKey = payload.issuer.publicKey;
  var publicKeyBuffer = new Buffer(issuerPublicKey, 'hex');

  var Q = _ecurve2.default.Point.decodeFrom(secp256k1, publicKeyBuffer);
  var compressedKeyPair = new _bitcoinjsLib.ECPair(null, Q, { compressed: true });
  var compressedAddress = compressedKeyPair.getAddress();
  var uncompressedKeyPair = new _bitcoinjsLib.ECPair(null, Q, { compressed: false });
  var uncompressedAddress = uncompressedKeyPair.getAddress();

  if (publicKeyOrAddress === issuerPublicKey) {
    // pass
  } else if (publicKeyOrAddress === compressedAddress) {
    // pass
  } else if (publicKeyOrAddress === uncompressedAddress) {
    // pass
  } else {
    throw new Error('Token issuer public key does not match the verifying value');
  }

  var tokenVerifier = new _jsontokens.TokenVerifier(decodedToken.header.alg, issuerPublicKey);
  if (!tokenVerifier) {
    throw new Error('Invalid token verifier');
  }

  var tokenVerified = tokenVerifier.verify(token);
  if (!tokenVerified) {
    throw new Error('Token verification failed');
  }

  return decodedToken;
}

/**
  * Extracts a profile from an encoded token and optionally verifies it,
  * if `publicKeyOrAddress` is provided.
  * @param {String} token - the token to be extracted
  * @param {String} publicKeyOrAddress - the public key or address of the
  *   keypair that is thought to have signed the token
  * @returns {Object} - the profile extracted from the encoded token
  * @throws {Error} - if the token isn't signed by the provided `publicKeyOrAddress`
  */
function extractProfile(token) {
  var publicKeyOrAddress = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var decodedToken = void 0;
  if (publicKeyOrAddress) {
    decodedToken = verifyProfileToken(token, publicKeyOrAddress);
  } else {
    decodedToken = (0, _jsontokens.decodeToken)(token);
  }

  var profile = {};
  if (decodedToken.hasOwnProperty('payload')) {
    var payload = decodedToken.payload;
    if (payload.hasOwnProperty('claim')) {
      profile = decodedToken.payload.claim;
    }
  }

  return profile;
}