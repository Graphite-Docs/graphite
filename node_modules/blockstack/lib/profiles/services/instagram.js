'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instagram = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _service = require('./service');

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Instagram = function (_Service) {
  _inherits(Instagram, _Service);

  function Instagram() {
    _classCallCheck(this, Instagram);

    return _possibleConstructorReturn(this, (Instagram.__proto__ || Object.getPrototypeOf(Instagram)).apply(this, arguments));
  }

  _createClass(Instagram, null, [{
    key: 'getBaseUrls',
    value: function getBaseUrls() {
      var baseUrls = ['https://www.instagram.com/', 'https://instagram.com/'];
      return baseUrls;
    }
  }, {
    key: 'getProofUrl',
    value: function getProofUrl(proof) {
      var baseUrls = this.getBaseUrls();
      var normalizedProofUrl = this.normalizeInstagramUrl(proof);

      for (var i = 0; i < baseUrls.length; i++) {
        if (normalizedProofUrl.startsWith('' + baseUrls[i])) {
          return normalizedProofUrl;
        }
      }
      throw new Error('Proof url ' + proof.proof_url + ' is not valid for service ' + proof.service);
    }
  }, {
    key: 'normalizeInstagramUrl',
    value: function normalizeInstagramUrl(proof) {
      var proofUrl = proof.proof_url;
      proofUrl = _get(Instagram.__proto__ || Object.getPrototypeOf(Instagram), 'prefixScheme', this).call(this, proofUrl);

      if (proofUrl.startsWith('https://instagram.com')) {
        var tokens = proofUrl.split('https://instagram.com');
        proofUrl = 'https://www.instagram.com' + tokens[1];
      }
      return proofUrl;
    }
  }, {
    key: 'shouldValidateIdentityInBody',
    value: function shouldValidateIdentityInBody() {
      return true;
    }
  }, {
    key: 'getProofIdentity',
    value: function getProofIdentity(searchText) {
      var $ = _cheerio2.default.load(searchText);
      var username = $('meta[property="og:description"]').attr('content');
      if (username !== undefined && username.split(':').length > 1) {
        return username.split(':')[0].match(/\(([^)]+)\)/)[1].substr(1);
      } else {
        return '';
      }
    }
  }, {
    key: 'getProofStatement',
    value: function getProofStatement(searchText) {
      var $ = _cheerio2.default.load(searchText);
      var statement = $('meta[property="og:description"]').attr('content');

      if (statement !== undefined && statement.split(':').length > 1) {
        return statement.split(':')[1].trim().replace('“', '').replace('”', '');
      } else {
        return '';
      }
    }
  }]);

  return Instagram;
}(_service.Service);

exports.Instagram = Instagram;