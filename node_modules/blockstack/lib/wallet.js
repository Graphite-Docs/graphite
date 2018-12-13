'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BlockstackWallet = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _bitcoinjsLib = require('bitcoinjs-lib');

var _bitcoinjsLib2 = _interopRequireDefault(_bitcoinjsLib);

var _bip = require('bip39');

var _bip2 = _interopRequireDefault(_bip);

var _bip3 = require('bip32');

var _bip4 = _interopRequireDefault(_bip3);

var _utils = require('./utils');

var _encryption = require('./encryption');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var APPS_NODE_INDEX = 0;
var IDENTITY_KEYCHAIN = 888;
var BLOCKSTACK_ON_BITCOIN = 0;

var BITCOIN_BIP_44_PURPOSE = 44;
var BITCOIN_COIN_TYPE = 0;
var BITCOIN_ACCOUNT_INDEX = 0;

var EXTERNAL_ADDRESS = 'EXTERNAL_ADDRESS';
var CHANGE_ADDRESS = 'CHANGE_ADDRESS';

function hashCode(string) {
  var hash = 0;
  if (string.length === 0) return hash;
  for (var i = 0; i < string.length; i++) {
    var character = string.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash &= hash;
  }
  return hash & 0x7fffffff;
}

function getNodePrivateKey(node) {
  return (0, _utils.ecPairToHexString)(_bitcoinjsLib.ECPair.fromPrivateKey(node.privateKey));
}

function getNodePublicKey(node) {
  return node.publicKey.toString('hex');
}

/**
 * The BlockstackWallet class manages the hierarchical derivation
 *  paths for a standard blockstack client wallet. This includes paths
 *  for bitcoin payment address, blockstack identity addresses, blockstack
 *  application specific addresses.
 *  @private
 */

var BlockstackWallet = exports.BlockstackWallet = function () {
  function BlockstackWallet(rootNode) {
    _classCallCheck(this, BlockstackWallet);

    this.rootNode = rootNode;
  }

  _createClass(BlockstackWallet, [{
    key: 'toBase58',
    value: function toBase58() {
      return this.rootNode.toBase58();
    }

    /**
     * Initialize a blockstack wallet from a seed buffer
     * @param {Buffer} seed - the input seed for initializing the root node
     *  of the hierarchical wallet
     * @return {BlockstackWallet} the constructed wallet
     */

  }, {
    key: 'getIdentityPrivateKeychain',
    value: function getIdentityPrivateKeychain() {
      return this.rootNode.deriveHardened(IDENTITY_KEYCHAIN).deriveHardened(BLOCKSTACK_ON_BITCOIN);
    }
  }, {
    key: 'getBitcoinPrivateKeychain',
    value: function getBitcoinPrivateKeychain() {
      return this.rootNode.deriveHardened(BITCOIN_BIP_44_PURPOSE).deriveHardened(BITCOIN_COIN_TYPE).deriveHardened(BITCOIN_ACCOUNT_INDEX);
    }
  }, {
    key: 'getBitcoinNode',
    value: function getBitcoinNode(addressIndex) {
      var chainType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EXTERNAL_ADDRESS;

      return BlockstackWallet.getNodeFromBitcoinKeychain(this.getBitcoinPrivateKeychain().toBase58(), addressIndex, chainType);
    }
  }, {
    key: 'getIdentityAddressNode',
    value: function getIdentityAddressNode(identityIndex) {
      var identityPrivateKeychain = this.getIdentityPrivateKeychain();
      return identityPrivateKeychain.deriveHardened(identityIndex);
    }
  }, {
    key: 'getIdentitySalt',


    /**
     * Get a salt for use with creating application specific addresses
     * @return {String} the salt
     */
    value: function getIdentitySalt() {
      var identityPrivateKeychain = this.getIdentityPrivateKeychain();
      var publicKeyHex = getNodePublicKey(identityPrivateKeychain);
      return _crypto2.default.createHash('sha256').update(publicKeyHex).digest('hex');
    }

    /**
     * Get a bitcoin receive address at a given index
     * @param {number} addressIndex - the index of the address
     * @return {String} address
     */

  }, {
    key: 'getBitcoinAddress',
    value: function getBitcoinAddress(addressIndex) {
      return BlockstackWallet.getAddressFromBIP32Node(this.getBitcoinNode(addressIndex));
    }

    /**
     * Get the private key hex-string for a given bitcoin receive address
     * @param {number} addressIndex - the index of the address
     * @return {String} the hex-string. this will be either 64
     * characters long to denote an uncompressed bitcoin address, or 66
     * characters long for a compressed bitcoin address.
     */

  }, {
    key: 'getBitcoinPrivateKey',
    value: function getBitcoinPrivateKey(addressIndex) {
      return getNodePrivateKey(this.getBitcoinNode(addressIndex));
    }

    /**
     * Get the root node for the bitcoin public keychain
     * @return {String} base58-encoding of the public node
     */

  }, {
    key: 'getBitcoinPublicKeychain',
    value: function getBitcoinPublicKeychain() {
      return this.getBitcoinPrivateKeychain().neutered();
    }

    /**
     * Get the root node for the identity public keychain
     * @return {String} base58-encoding of the public node
     */

  }, {
    key: 'getIdentityPublicKeychain',
    value: function getIdentityPublicKeychain() {
      return this.getIdentityPrivateKeychain().neutered();
    }
  }, {
    key: 'getIdentityKeyPair',


    /**
     * Get the keypair information for a given identity index. This
     * information is used to obtain the private key for an identity address
     * and derive application specific keys for that address.
     * @param {number} addressIndex - the identity index
     * @param {boolean} alwaysUncompressed - if true, always return a
     *   private-key hex string corresponding to the uncompressed address
     * @return {Object} an IdentityKeyPair type object with keys:
     *   .key {String} - the private key hex-string
     *   .keyID {String} - the public key hex-string
     *   .address {String} - the identity address
     *   .appsNodeKey {String} - the base-58 encoding of the applications node
     *   .salt {String} - the salt used for creating app-specific addresses
     */
    value: function getIdentityKeyPair(addressIndex) {
      var alwaysUncompressed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var identityNode = this.getIdentityAddressNode(addressIndex);

      var address = BlockstackWallet.getAddressFromBIP32Node(identityNode);
      var identityKey = getNodePrivateKey(identityNode);
      if (alwaysUncompressed && identityKey.length === 66) {
        identityKey = identityKey.slice(0, 64);
      }

      var identityKeyID = getNodePublicKey(identityNode);
      var appsNodeKey = BlockstackWallet.getAppsNode(identityNode).toBase58();
      var salt = this.getIdentitySalt();
      var keyPair = {
        key: identityKey,
        keyID: identityKeyID,
        address: address,
        appsNodeKey: appsNodeKey,
        salt: salt
      };
      return keyPair;
    }
  }], [{
    key: 'fromSeedBuffer',
    value: function fromSeedBuffer(seed) {
      return new BlockstackWallet(_bip4.default.fromSeed(seed));
    }

    /**
     * Initialize a blockstack wallet from a base58 string
     * @param {string} keychain - the Base58 string used to initialize
     *  the root node of the hierarchical wallet
     * @return {BlockstackWallet} the constructed wallet
     */

  }, {
    key: 'fromBase58',
    value: function fromBase58(keychain) {
      return new BlockstackWallet(_bip4.default.fromBase58(keychain));
    }

    /**
     * Initialize a blockstack wallet from an encrypted phrase & password. Throws
     * if the password is incorrect. Supports all formats of Blockstack phrases.
     * @param {string} data - The encrypted phrase as a hex-encoded string
     * @param {string} password - The plain password
     * @return {Promise<BlockstackWallet>} the constructed wallet
     */

  }, {
    key: 'fromEncryptedMnemonic',
    value: function fromEncryptedMnemonic(data, password) {
      return (0, _encryption.decryptMnemonic)(data, password).then(function (mnemonic) {
        var seed = _bip2.default.mnemonicToSeed(mnemonic);
        return new BlockstackWallet(_bip4.default.fromSeed(seed));
      }).catch(function (err) {
        if (err.message && err.message.startsWith('bad header;')) {
          throw new Error('Incorrect password');
        } else {
          throw err;
        }
      });
    }

    /**
     * Generate a BIP-39 12 word mnemonic
     * @return {Promise<string>} space-separated 12 word phrase
     */

  }, {
    key: 'generateMnemonic',
    value: function generateMnemonic() {
      return _bip2.default.generateMnemonic(128, _crypto.randomBytes);
    }

    /**
     * Encrypt a mnemonic phrase with a password
     * @param {string} mnemonic - Raw mnemonic phrase
     * @param {string} password - Password to encrypt mnemonic with
     * @return {Promise<string>} Hex-encoded encrypted mnemonic
     */

  }, {
    key: 'encryptMnemonic',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(mnemonic, password) {
        var encryptedBuffer;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _encryption.encryptMnemonic)(mnemonic, password);

              case 2:
                encryptedBuffer = _context.sent;
                return _context.abrupt('return', encryptedBuffer.toString('hex'));

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function encryptMnemonic(_x3, _x4) {
        return _ref.apply(this, arguments);
      }

      return encryptMnemonic;
    }()
  }, {
    key: 'getAppsNode',
    value: function getAppsNode(identityNode) {
      return identityNode.deriveHardened(APPS_NODE_INDEX);
    }
  }, {
    key: 'getNodeFromBitcoinKeychain',
    value: function getNodeFromBitcoinKeychain(keychainBase58, addressIndex) {
      var chainType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EXTERNAL_ADDRESS;

      var chain = void 0;
      if (chainType === EXTERNAL_ADDRESS) {
        chain = 0;
      } else if (chainType === CHANGE_ADDRESS) {
        chain = 1;
      } else {
        throw new Error('Invalid chain type');
      }
      var keychain = _bip4.default.fromBase58(keychainBase58);

      return keychain.derive(chain).derive(addressIndex);
    }

    /**
     * Get a bitcoin address given a base-58 encoded bitcoin node
     * (usually called the account node)
     * @param {String} keychainBase58 - base58-encoding of the node
     * @param {number} addressIndex - index of the address to get
     * @param {String} chainType - either 'EXTERNAL_ADDRESS' (for a
     * "receive" address) or 'CHANGE_ADDRESS'
     * @return {String} the address
     */

  }, {
    key: 'getAddressFromBitcoinKeychain',
    value: function getAddressFromBitcoinKeychain(keychainBase58, addressIndex) {
      var chainType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EXTERNAL_ADDRESS;

      return BlockstackWallet.getAddressFromBIP32Node(BlockstackWallet.getNodeFromBitcoinKeychain(keychainBase58, addressIndex, chainType));
    }

    /**
     * Get a ECDSA private key hex-string for an application-specific
     *  address.
     * @param {String} appsNodeKey - the base58-encoded private key for
     * applications node (the `appsNodeKey` return in getIdentityKeyPair())
     * @param {String} salt - a string, used to salt the
     * application-specific addresses
     * @param {String} appDomain - the appDomain to generate a key for
     * @return {String} the private key hex-string. this will be a 64
     * character string
     */

  }, {
    key: 'getLegacyAppPrivateKey',
    value: function getLegacyAppPrivateKey(appsNodeKey, salt, appDomain) {
      var hash = _crypto2.default.createHash('sha256').update('' + appDomain + salt).digest('hex');
      var appIndex = hashCode(hash);
      var appNode = _bip4.default.fromBase58(appsNodeKey).deriveHardened(appIndex);
      return getNodePrivateKey(appNode).slice(0, 64);
    }
  }, {
    key: 'getAddressFromBIP32Node',
    value: function getAddressFromBIP32Node(node) {
      return _bitcoinjsLib2.default.payments.p2pkh({ pubkey: node.publicKey }).address;
    }

    /**
     * Get a ECDSA private key hex-string for an application-specific
     *  address.
     * @param {String} appsNodeKey - the base58-encoded private key for
     * applications node (the `appsNodeKey` return in getIdentityKeyPair())
     * @param {String} salt - a string, used to salt the
     * application-specific addresses
     * @param {String} appDomain - the appDomain to generate a key for
     * @return {String} the private key hex-string. this will be a 64
     * character string
     */

  }, {
    key: 'getAppPrivateKey',
    value: function getAppPrivateKey(appsNodeKey, salt, appDomain) {
      var hash = _crypto2.default.createHash('sha256').update('' + appDomain + salt).digest('hex');
      var appIndexHexes = [];
      // note: there's hardcoded numbers here, precisely because I want this
      //   code to be very specific to the derivation paths we expect.
      if (hash.length !== 64) {
        throw new Error('Unexpected app-domain hash length of ' + hash.length);
      }
      for (var i = 0; i < 11; i++) {
        // split the hash into 3-byte chunks
        // because child nodes can only be up to 2^31,
        // and we shouldn't deal in partial bytes.
        appIndexHexes.push(hash.slice(i * 6, i * 6 + 6));
      }
      var appNode = _bip4.default.fromBase58(appsNodeKey);
      appIndexHexes.forEach(function (hex) {
        if (hex.length > 6) {
          throw new Error('Invalid hex string length');
        }
        appNode = appNode.deriveHardened(parseInt(hex, 16));
      });
      return getNodePrivateKey(appNode).slice(0, 64);
    }
  }]);

  return BlockstackWallet;
}();