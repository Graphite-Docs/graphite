'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PubkeyHashSigner = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bitcoinjsLib = require('bitcoinjs-lib');

var _bitcoinjsLib2 = _interopRequireDefault(_bitcoinjsLib);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Class representing a transaction signer for pubkeyhash addresses
 * (a.k.a. single-sig addresses)
 * @private
 */
var PubkeyHashSigner = exports.PubkeyHashSigner = function () {
  function PubkeyHashSigner(ecPair) {
    _classCallCheck(this, PubkeyHashSigner);

    this.ecPair = ecPair;
  }

  _createClass(PubkeyHashSigner, [{
    key: 'signerVersion',
    value: function signerVersion() {
      return 1;
    }
  }, {
    key: 'getAddress',
    value: function getAddress() {
      var _this = this;

      return Promise.resolve().then(function () {
        return (0, _utils.ecPairToAddress)(_this.ecPair);
      });
    }
  }, {
    key: 'signTransaction',
    value: function signTransaction(transaction, inputIndex) {
      var _this2 = this;

      return Promise.resolve().then(function () {
        transaction.sign(inputIndex, _this2.ecPair);
      });
    }
  }], [{
    key: 'fromHexString',
    value: function fromHexString(keyHex) {
      return new PubkeyHashSigner((0, _utils.hexStringToECPair)(keyHex));
    }
  }]);

  return PubkeyHashSigner;
}();