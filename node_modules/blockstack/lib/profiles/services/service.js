'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Service = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('cross-fetch/polyfill');

var _serviceUtils = require('./serviceUtils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Service = exports.Service = function () {
  function Service() {
    _classCallCheck(this, Service);
  }

  _createClass(Service, null, [{
    key: 'validateProof',
    value: function validateProof(proof, ownerAddress) {
      var _this = this;

      var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var proofUrl = void 0;
      return Promise.resolve().then(function () {
        proofUrl = _this.getProofUrl(proof);
        return fetch(proofUrl);
      }).then(function (res) {
        if (res.status !== 200) {
          throw new Error('Proof url ' + proofUrl + ' returned unexpected http status ' + res.status + '.\n              Unable to validate proof.');
        }
        return res.text();
      }).then(function (text) {
        // Validate identity in provided proof body/tags if required
        if (_this.shouldValidateIdentityInBody() && proof.identifier !== _this.getProofIdentity(text)) {
          return proof;
        }
        var proofText = _this.getProofStatement(text);
        proof.valid = (0, _serviceUtils.containsValidProofStatement)(proofText, name) || (0, _serviceUtils.containsValidAddressProofStatement)(proofText, ownerAddress);
        return proof;
      }).catch(function (error) {
        console.error(error);
        proof.valid = false;
        return proof;
      });
    }
  }, {
    key: 'getBaseUrls',
    value: function getBaseUrls() {
      return [];
    }
  }, {
    key: 'getProofIdentity',
    value: function getProofIdentity(searchText) {
      return searchText;
    }
  }, {
    key: 'getProofStatement',
    value: function getProofStatement(searchText) {
      return searchText;
    }
  }, {
    key: 'shouldValidateIdentityInBody',
    value: function shouldValidateIdentityInBody() {
      return false;
    }
  }, {
    key: 'prefixScheme',
    value: function prefixScheme(proofUrl) {
      if (!proofUrl.startsWith('https://') && !proofUrl.startsWith('http://')) {
        return 'https://' + proofUrl;
      } else if (proofUrl.startsWith('http://')) {
        return proofUrl.replace('http://', 'https://');
      } else {
        return proofUrl;
      }
    }
  }, {
    key: 'getProofUrl',
    value: function getProofUrl(proof) {
      var baseUrls = this.getBaseUrls();

      var proofUrl = proof.proof_url.toLowerCase();
      proofUrl = this.prefixScheme(proofUrl);

      for (var i = 0; i < baseUrls.length; i++) {
        var requiredPrefix = ('' + baseUrls[i] + proof.identifier).toLowerCase();
        if (proofUrl.startsWith(requiredPrefix)) {
          return proofUrl;
        }
      }
      throw new Error('Proof url ' + proof.proof_url + ' is not valid for service ' + proof.service);
    }
  }]);

  return Service;
}();