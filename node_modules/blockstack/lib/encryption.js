'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHexFromBN = getHexFromBN;
exports.encryptECIES = encryptECIES;
exports.decryptECIES = decryptECIES;
exports.signECDSA = signECDSA;
exports.verifyECDSA = verifyECDSA;
exports.encryptMnemonic = encryptMnemonic;
exports.decryptMnemonic = decryptMnemonic;

var _elliptic = require('elliptic');

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _bip = require('bip39');

var _bip2 = _interopRequireDefault(_bip);

var _triplesec = require('triplesec');

var _triplesec2 = _interopRequireDefault(_triplesec);

var _keys = require('./keys');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ecurve = new _elliptic.ec('secp256k1');

function aes256CbcEncrypt(iv, key, plaintext) {
  var cipher = _crypto2.default.createCipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([cipher.update(plaintext), cipher.final()]);
}

function aes256CbcDecrypt(iv, key, ciphertext) {
  var cipher = _crypto2.default.createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([cipher.update(ciphertext), cipher.final()]);
}

function hmacSha256(key, content) {
  return _crypto2.default.createHmac('sha256', key).update(content).digest();
}

function equalConstTime(b1, b2) {
  if (b1.length !== b2.length) {
    return false;
  }
  var res = 0;
  for (var i = 0; i < b1.length; i++) {
    res |= b1[i] ^ b2[i]; // jshint ignore:line
  }
  return res === 0;
}

function sharedSecretToKeys(sharedSecret) {
  // generate mac and encryption key from shared secret
  var hashedSecret = _crypto2.default.createHash('sha512').update(sharedSecret).digest();
  return {
    encryptionKey: hashedSecret.slice(0, 32),
    hmacKey: hashedSecret.slice(32)
  };
}

function getHexFromBN(bnInput) {
  var hexOut = bnInput.toString('hex');

  if (hexOut.length === 64) {
    return hexOut;
  } else if (hexOut.length < 64) {
    // pad with leading zeros
    // the padStart function would require node 9
    var padding = '0'.repeat(64 - hexOut.length);
    return '' + padding + hexOut;
  } else {
    throw new Error('Generated a > 32-byte BN for encryption. Failing.');
  }
}

/**
 * Encrypt content to elliptic curve publicKey using ECIES
 * @param {String} publicKey - secp256k1 public key hex string
 * @param {String | Buffer} content - content to encrypt
 * @return {Object} Object containing (hex encoded):
 *  iv (initialization vector), cipherText (cipher text),
 *  mac (message authentication code), ephemeral public key
 *  wasString (boolean indicating with or not to return a buffer or string on decrypt)
 *  @private
 */
function encryptECIES(publicKey, content) {
  var isString = typeof content === 'string';
  var plainText = Buffer.from(content); // always copy to buffer

  var ecPK = ecurve.keyFromPublic(publicKey, 'hex').getPublic();
  var ephemeralSK = ecurve.genKeyPair();
  var ephemeralPK = ephemeralSK.getPublic();
  var sharedSecret = ephemeralSK.derive(ecPK);

  var sharedSecretHex = getHexFromBN(sharedSecret);

  var sharedKeys = sharedSecretToKeys(new Buffer(sharedSecretHex, 'hex'));

  var initializationVector = _crypto2.default.randomBytes(16);

  var cipherText = aes256CbcEncrypt(initializationVector, sharedKeys.encryptionKey, plainText);

  var macData = Buffer.concat([initializationVector, new Buffer(ephemeralPK.encodeCompressed()), cipherText]);
  var mac = hmacSha256(sharedKeys.hmacKey, macData);

  return {
    iv: initializationVector.toString('hex'),
    ephemeralPK: ephemeralPK.encodeCompressed('hex'),
    cipherText: cipherText.toString('hex'),
    mac: mac.toString('hex'),
    wasString: isString
  };
}

/**
 * Decrypt content encrypted using ECIES
 * @param {String} privateKey - secp256k1 private key hex string
 * @param {Object} cipherObject - object to decrypt, should contain:
 *  iv (initialization vector), cipherText (cipher text),
 *  mac (message authentication code), ephemeralPublicKey
 *  wasString (boolean indicating with or not to return a buffer or string on decrypt)
 * @return {Buffer} plaintext
 * @throws {Error} if unable to decrypt
 * @private
 */
function decryptECIES(privateKey, cipherObject) {
  var ecSK = ecurve.keyFromPrivate(privateKey, 'hex');
  var ephemeralPK = ecurve.keyFromPublic(cipherObject.ephemeralPK, 'hex').getPublic();
  var sharedSecret = ecSK.derive(ephemeralPK);
  var sharedSecretBuffer = new Buffer(getHexFromBN(sharedSecret), 'hex');

  var sharedKeys = sharedSecretToKeys(sharedSecretBuffer);

  var ivBuffer = new Buffer(cipherObject.iv, 'hex');
  var cipherTextBuffer = new Buffer(cipherObject.cipherText, 'hex');

  var macData = Buffer.concat([ivBuffer, new Buffer(ephemeralPK.encodeCompressed()), cipherTextBuffer]);
  var actualMac = hmacSha256(sharedKeys.hmacKey, macData);
  var expectedMac = new Buffer(cipherObject.mac, 'hex');
  if (!equalConstTime(expectedMac, actualMac)) {
    throw new Error('Decryption failed: failure in MAC check');
  }
  var plainText = aes256CbcDecrypt(ivBuffer, sharedKeys.encryptionKey, cipherTextBuffer);

  if (cipherObject.wasString) {
    return plainText.toString();
  } else {
    return plainText;
  }
}

/**
 * Sign content using ECDSA
 * @private
 * @param {String} privateKey - secp256k1 private key hex string
 * @param {Object} content - content to sign
 * @return {Object} contains:
 * signature - Hex encoded DER signature
 * public key - Hex encoded private string taken from privateKey
 * @private
 */
function signECDSA(privateKey, content) {
  var contentBuffer = Buffer.from(content);
  var ecPrivate = ecurve.keyFromPrivate(privateKey, 'hex');
  var publicKey = (0, _keys.getPublicKeyFromPrivate)(privateKey);
  var contentHash = _crypto2.default.createHash('sha256').update(contentBuffer).digest();
  var signature = ecPrivate.sign(contentHash);
  var signatureString = signature.toDER('hex');

  return {
    signature: signatureString,
    publicKey: publicKey
  };
}

/**
 * Verify content using ECDSA
 * @param {String | Buffer} content - Content to verify was signed
 * @param {String} publicKey - secp256k1 private key hex string
 * @param {String} signature - Hex encoded DER signature
 * @return {Boolean} returns true when signature matches publickey + content, false if not
 * @private
 */
function verifyECDSA(content, publicKey, signature) {
  var contentBuffer = Buffer.from(content);
  var ecPublic = ecurve.keyFromPublic(publicKey, 'hex');
  var contentHash = _crypto2.default.createHash('sha256').update(contentBuffer).digest();

  return ecPublic.verify(contentHash, signature);
}

/**
 * Encrypt a raw mnemonic phrase to be password protected
 * @param {string} phrase - Raw mnemonic phrase
 * @param {string} password - Password to encrypt mnemonic with
 * @return {Promise<Buffer>} The encrypted phrase
 * @private
 */
function encryptMnemonic(phrase, password) {
  return Promise.resolve().then(function () {
    // must be bip39 mnemonic
    if (!_bip2.default.validateMnemonic(phrase)) {
      throw new Error('Not a valid bip39 nmemonic');
    }

    // normalize plaintext to fixed length byte string
    var plaintextNormalized = Buffer.from(_bip2.default.mnemonicToEntropy(phrase).toString('hex'), 'hex');

    // AES-128-CBC with SHA256 HMAC
    var salt = _crypto2.default.randomBytes(16);
    var keysAndIV = _crypto2.default.pbkdf2Sync(password, salt, 100000, 48, 'sha512');
    var encKey = keysAndIV.slice(0, 16);
    var macKey = keysAndIV.slice(16, 32);
    var iv = keysAndIV.slice(32, 48);

    var cipher = _crypto2.default.createCipheriv('aes-128-cbc', encKey, iv);
    var cipherText = cipher.update(plaintextNormalized).toString('hex');
    cipherText += cipher.final().toString('hex');

    var hmacPayload = Buffer.concat([salt, Buffer.from(cipherText, 'hex')]);

    var hmac = _crypto2.default.createHmac('sha256', macKey);
    hmac.write(hmacPayload);
    var hmacDigest = hmac.digest();

    var payload = Buffer.concat([salt, hmacDigest, Buffer.from(cipherText, 'hex')]);
    return payload;
  });
}

// Used to distinguish bad password during decrypt vs invalid format

var PasswordError = function (_Error) {
  _inherits(PasswordError, _Error);

  function PasswordError() {
    _classCallCheck(this, PasswordError);

    return _possibleConstructorReturn(this, (PasswordError.__proto__ || Object.getPrototypeOf(PasswordError)).apply(this, arguments));
  }

  return PasswordError;
}(Error);

function decryptMnemonicBuffer(dataBuffer, password) {
  return Promise.resolve().then(function () {
    var salt = dataBuffer.slice(0, 16);
    var hmacSig = dataBuffer.slice(16, 48); // 32 bytes
    var cipherText = dataBuffer.slice(48);
    var hmacPayload = Buffer.concat([salt, cipherText]);

    var keysAndIV = _crypto2.default.pbkdf2Sync(password, salt, 100000, 48, 'sha512');
    var encKey = keysAndIV.slice(0, 16);
    var macKey = keysAndIV.slice(16, 32);
    var iv = keysAndIV.slice(32, 48);

    var decipher = _crypto2.default.createDecipheriv('aes-128-cbc', encKey, iv);
    var plaintext = decipher.update(cipherText).toString('hex');
    plaintext += decipher.final().toString('hex');

    var hmac = _crypto2.default.createHmac('sha256', macKey);
    hmac.write(hmacPayload);
    var hmacDigest = hmac.digest();

    // hash both hmacSig and hmacDigest so string comparison time
    // is uncorrelated to the ciphertext
    var hmacSigHash = _crypto2.default.createHash('sha256').update(hmacSig).digest().toString('hex');

    var hmacDigestHash = _crypto2.default.createHash('sha256').update(hmacDigest).digest().toString('hex');

    if (hmacSigHash !== hmacDigestHash) {
      // not authentic
      throw new PasswordError('Wrong password (HMAC mismatch)');
    }

    var mnemonic = _bip2.default.entropyToMnemonic(plaintext);
    if (!_bip2.default.validateMnemonic(mnemonic)) {
      throw new PasswordError('Wrong password (invalid plaintext)');
    }

    return mnemonic;
  });
}

/**
 * Decrypt legacy triplesec keys
 * @param {Buffer} dataBuffer - The encrypted key
 * @param {String} password - Password for data
 * @return {Promise<Buffer>} Decrypted seed
 * @private
 */
function decryptLegacy(dataBuffer, password) {
  return new Promise(function (resolve, reject) {
    _triplesec2.default.decrypt({
      key: Buffer.from(password),
      data: dataBuffer
    }, function (err, plaintextBuffer) {
      if (!err) {
        resolve(plaintextBuffer);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Encrypt a raw mnemonic phrase with a password
 * @param {string | Buffer} data - Buffer or hex-encoded string of the encrypted mnemonic
 * @param {string} password - Password for data
 * @return {Promise<Buffer>} the raw mnemonic phrase
 * @private
 */
function decryptMnemonic(data, password) {
  var dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'hex');
  return decryptMnemonicBuffer(dataBuffer, password).catch(function (err) {
    // If it was a password error, don't even bother with legacy
    if (err instanceof PasswordError) {
      throw err;
    }
    return decryptLegacy(dataBuffer, password);
  });
}