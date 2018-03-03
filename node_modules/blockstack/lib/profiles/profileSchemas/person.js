'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Person = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _schemaInspector = require('schema-inspector');

var _schemaInspector2 = _interopRequireDefault(_schemaInspector);

var _profile = require('../profile');

var _profileTokens = require('../profileTokens');

var _personLegacy = require('./personLegacy');

var _personUtils = require('./personUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var schemaDefinition = {
  type: 'object',
  strict: false,
  properties: {
    '@context': { type: 'string', optional: true },
    '@type': { type: 'string' },
    '@id': { type: 'string', optional: true },
    name: { type: 'string', optional: true },
    givenName: { type: 'string', optional: true },
    familyName: { type: 'string', optional: true },
    description: { type: 'string', optional: true },
    image: {
      type: 'array',
      optional: true,
      items: {
        type: 'object',
        properties: {
          '@type': { type: 'string' },
          name: { type: 'string', optional: true },
          contentUrl: { type: 'string', optional: true }
        }
      }
    },
    website: {
      type: 'array',
      optional: true,
      items: {
        type: 'object',
        properties: {
          '@type': { type: 'string' },
          url: { type: 'string', optional: true }
        }
      }
    },
    account: {
      type: 'array',
      optional: true,
      items: {
        type: 'object',
        properties: {
          '@type': { type: 'string' },
          service: { type: 'string', optional: true },
          identifier: { type: 'string', optional: true },
          proofType: { type: 'string', optional: true },
          proofUrl: { type: 'string', optional: true },
          proofMessage: { type: 'string', optional: true },
          proofSignature: { type: 'string', optional: true }
        }
      }
    },
    worksFor: {
      type: 'array',
      optional: true,
      items: {
        type: 'object',
        properties: {
          '@type': { type: 'string' },
          '@id': { type: 'string', optional: true }
        }
      }
    },
    knows: {
      type: 'array',
      optional: true,
      items: {
        type: 'object',
        properties: {
          '@type': { type: 'string' },
          '@id': { type: 'string', optional: true }
        }
      }
    },
    address: {
      type: 'object',
      optional: true,
      properties: {
        '@type': { type: 'string' },
        streetAddress: { type: 'string', optional: true },
        addressLocality: { type: 'string', optional: true },
        postalCode: { type: 'string', optional: true },
        addressCountry: { type: 'string', optional: true }
      }
    },
    birthDate: { type: 'string', optional: true },
    taxID: { type: 'string', optional: true }
  }
};

var Person = exports.Person = function (_Profile) {
  _inherits(Person, _Profile);

  function Person() {
    var profile = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Person);

    var _this = _possibleConstructorReturn(this, (Person.__proto__ || Object.getPrototypeOf(Person)).call(this, profile));

    _this._profile = Object.assign({}, {
      '@type': 'Person'
    }, _this._profile);
    return _this;
  }

  _createClass(Person, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        profile: this.profile(),
        name: this.name(),
        givenName: this.givenName(),
        familyName: this.familyName(),
        description: this.description(),
        avatarUrl: this.avatarUrl(),
        verifiedAccounts: this.verifiedAccounts(),
        address: this.address(),
        birthDate: this.birthDate(),
        connections: this.connections(),
        organizations: this.organizations()
      };
    }
  }, {
    key: 'profile',
    value: function profile() {
      return Object.assign({}, this._profile);
    }
  }, {
    key: 'name',
    value: function name() {
      return (0, _personUtils.getName)(this.profile());
    }
  }, {
    key: 'givenName',
    value: function givenName() {
      return (0, _personUtils.getGivenName)(this.profile());
    }
  }, {
    key: 'familyName',
    value: function familyName() {
      return (0, _personUtils.getFamilyName)(this.profile());
    }
  }, {
    key: 'description',
    value: function description() {
      return (0, _personUtils.getDescription)(this.profile());
    }
  }, {
    key: 'avatarUrl',
    value: function avatarUrl() {
      return (0, _personUtils.getAvatarUrl)(this.profile());
    }
  }, {
    key: 'verifiedAccounts',
    value: function verifiedAccounts(verifications) {
      return (0, _personUtils.getVerifiedAccounts)(this.profile(), verifications);
    }
  }, {
    key: 'address',
    value: function address() {
      return (0, _personUtils.getAddress)(this.profile());
    }
  }, {
    key: 'birthDate',
    value: function birthDate() {
      return (0, _personUtils.getBirthDate)(this.profile());
    }
  }, {
    key: 'connections',
    value: function connections() {
      return (0, _personUtils.getConnections)(this.profile());
    }
  }, {
    key: 'organizations',
    value: function organizations() {
      return (0, _personUtils.getOrganizations)(this.profile());
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
      return new Person(profile);
    }
  }, {
    key: 'fromLegacyFormat',
    value: function fromLegacyFormat(legacyProfile) {
      var profile = (0, _personLegacy.getPersonFromLegacyFormat)(legacyProfile);
      return new Person(profile);
    }
  }]);

  return Person;
}(_profile.Profile);