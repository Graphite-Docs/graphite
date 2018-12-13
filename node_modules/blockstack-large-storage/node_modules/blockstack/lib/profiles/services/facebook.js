'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Facebook = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _service = require('./service');

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Facebook = function (_Service) {
  _inherits(Facebook, _Service);

  function Facebook() {
    _classCallCheck(this, Facebook);

    return _possibleConstructorReturn(this, (Facebook.__proto__ || Object.getPrototypeOf(Facebook)).apply(this, arguments));
  }

  _createClass(Facebook, null, [{
    key: 'getProofUrl',
    value: function getProofUrl(proof) {
      return this.normalizeFacebookUrl(proof);
    }
  }, {
    key: 'normalizeFacebookUrl',
    value: function normalizeFacebookUrl(proof) {
      var proofUrl = proof.proof_url.toLowerCase();
      var urlRegex = /(?:http[s]*:\/\/){0,1}(?:[a-zA-Z0-9\-]+\.)+facebook\.com/;

      proofUrl = _get(Facebook.__proto__ || Object.getPrototypeOf(Facebook), 'prefixScheme', this).call(this, proofUrl);

      if (proofUrl.startsWith('https://facebook.com')) {
        var tokens = proofUrl.split('https://facebook.com');
        proofUrl = 'https://www.facebook.com' + tokens[1];
        tokens = proofUrl.split('https://www.facebook.com/')[1].split('/posts/');
        var postId = tokens[1];
        proofUrl = 'https://www.facebook.com/' + proof.identifier + '/posts/' + postId;
      } else if (proofUrl.match(urlRegex)) {
        var _tokens = proofUrl.split('facebook.com/')[1].split('/posts/');
        var _postId = _tokens[1];
        proofUrl = 'https://www.facebook.com/' + proof.identifier + '/posts/' + _postId;
      } else {
        throw new Error('Proof url ' + proof.proof_url + ' is not valid for service ' + proof.service);
      }

      return proofUrl;
    }
  }, {
    key: 'getProofStatement',
    value: function getProofStatement(searchText) {
      var $ = _cheerio2.default.load(searchText);
      var statement = $('meta[name="description"]').attr('content');
      return statement !== undefined ? statement.trim() : '';
    }
  }]);

  return Facebook;
}(_service.Service);

exports.Facebook = Facebook;