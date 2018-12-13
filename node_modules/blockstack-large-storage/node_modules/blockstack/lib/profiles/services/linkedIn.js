'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinkedIn = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _service = require('./service');

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LinkedIn = function (_Service) {
  _inherits(LinkedIn, _Service);

  function LinkedIn() {
    _classCallCheck(this, LinkedIn);

    return _possibleConstructorReturn(this, (LinkedIn.__proto__ || Object.getPrototypeOf(LinkedIn)).apply(this, arguments));
  }

  _createClass(LinkedIn, null, [{
    key: 'getBaseUrls',
    value: function getBaseUrls() {
      var baseUrls = ['https://www.linkedin.com/feed/update/', 'http://www.linkedin.com/feed/update/', 'www.linkedin.com/feed/update/'];
      return baseUrls;
    }
  }, {
    key: 'getProofUrl',
    value: function getProofUrl(proof) {
      var baseUrls = this.getBaseUrls();

      var proofUrl = proof.proof_url.toLowerCase();
      proofUrl = _get(LinkedIn.__proto__ || Object.getPrototypeOf(LinkedIn), 'prefixScheme', this).call(this, proofUrl);

      for (var i = 0; i < baseUrls.length; i++) {
        if (proofUrl.startsWith('' + baseUrls[i])) {
          return proofUrl;
        }
      }
      throw new Error('Proof url ' + proof.proof_url + ' is not valid for service ' + proof.service);
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
      var profileLink = $('article').find('.post-meta__profile-link');

      if (profileLink !== undefined) {
        if (profileLink.attr('href') === undefined) {
          return '';
        }
        return profileLink.attr('href').split('/').pop();
      } else {
        return '';
      }
    }
  }, {
    key: 'getProofStatement',
    value: function getProofStatement(searchText) {
      var $ = _cheerio2.default.load(searchText);
      var postContent = $('article').find('.commentary');
      var statement = '';

      if (postContent !== undefined) {
        statement = postContent.text();
      }

      return statement;
    }
  }]);

  return LinkedIn;
}(_service.Service);

exports.LinkedIn = LinkedIn;