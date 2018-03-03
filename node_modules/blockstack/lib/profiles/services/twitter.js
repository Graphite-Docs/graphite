'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Twitter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _service = require('./service');

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Twitter = function (_Service) {
  _inherits(Twitter, _Service);

  function Twitter() {
    _classCallCheck(this, Twitter);

    return _possibleConstructorReturn(this, (Twitter.__proto__ || Object.getPrototypeOf(Twitter)).apply(this, arguments));
  }

  _createClass(Twitter, null, [{
    key: 'getBaseUrls',
    value: function getBaseUrls() {
      var baseUrls = ['https://twitter.com/', 'http://twitter.com/', 'twitter.com/'];
      return baseUrls;
    }
  }, {
    key: 'getProofStatement',
    value: function getProofStatement(searchText) {
      var $ = _cheerio2.default.load(searchText);
      var statement = $('meta[property="og:description"]').attr('content');
      if (statement !== undefined) {
        return statement.trim().replace('“', '').replace('”', '');
      } else {
        return '';
      }
    }
  }]);

  return Twitter;
}(_service.Service);

exports.Twitter = Twitter;