'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Profile = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _schemaInspector = require('schema-inspector');

var _schemaInspector2 = _interopRequireDefault(_schemaInspector);

var _profileTokens = require('./profileTokens');

var _profileProofs = require('./profileProofs');

var _profileZoneFiles = require('./profileZoneFiles');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var schemaDefinition = {
  type: 'object',
  properties: {
    '@context': { type: 'string', optional: true },
    '@type': { type: 'string' }
  }
};

var Profile = exports.Profile = function () {
  function Profile() {
    var profile = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Profile);

    this._profile = Object.assign({}, {
      '@context': 'http://schema.org/'
    }, profile);
  }

  _createClass(Profile, [{
    key: 'toJSON',
    value: function toJSON() {
      return Object.assign({}, this._profile);
    }
  }, {
    key: 'toToken',
    value: function toToken(privateKey) {
      return (0, _profileTokens.signProfileToken)(this.toJSON(), privateKey);
    }
  }], [{
    key: 'validateSchema',
    value: function validateSchema(profile) {
      var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      schemaDefinition.strict = strict;
      return _schemaInspector2.default.validate(schemaDefinition, profile);
    }
  }, {
    key: 'fromToken',
    value: function fromToken(token) {
      var publicKeyOrAddress = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var profile = (0, _profileTokens.extractProfile)(token, publicKeyOrAddress);
      return new Profile(profile);
    }
  }, {
    key: 'makeZoneFile',
    value: function makeZoneFile(domainName, tokenFileURL) {
      return (0, _profileZoneFiles.makeProfileZoneFile)(domainName, tokenFileURL);
    }
  }, {
    key: 'validateProofs',
    value: function validateProofs(domainName) {
      return (0, _profileProofs.validateProofs)(this.toJSON(), domainName);
    }
  }]);

  return Profile;
}();