'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreativeWork = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _profileTokens = require('../profileTokens');

var _schemaInspector = require('schema-inspector');

var _schemaInspector2 = _interopRequireDefault(_schemaInspector);

var _profile = require('../profile');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var schemaDefinition = {
  type: 'object',
  properties: {
    '@context': { type: 'string', optional: true },
    '@type': { type: 'string' },
    '@id': { type: 'string', optional: true }
  }
};

var CreativeWork = exports.CreativeWork = function (_Profile) {
  _inherits(CreativeWork, _Profile);

  function CreativeWork() {
    var profile = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, CreativeWork);

    var _this = _possibleConstructorReturn(this, (CreativeWork.__proto__ || Object.getPrototypeOf(CreativeWork)).call(this, profile));

    _this._profile = Object.assign({}, {
      '@type': 'CreativeWork'
    }, _this._profile);
    return _this;
  }

  _createClass(CreativeWork, null, [{
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

      var profile = (0, _profileTokens.extractToken)(token, publicKeyOrAddress);
      return new CreativeWork(profile);
    }
  }]);

  return CreativeWork;
}(_profile.Profile);