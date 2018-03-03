'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HackerNews = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _service = require('./service');

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HackerNews = function (_Service) {
  _inherits(HackerNews, _Service);

  function HackerNews() {
    _classCallCheck(this, HackerNews);

    return _possibleConstructorReturn(this, (HackerNews.__proto__ || Object.getPrototypeOf(HackerNews)).apply(this, arguments));
  }

  _createClass(HackerNews, null, [{
    key: 'getBaseUrls',
    value: function getBaseUrls() {
      var baseUrls = ['https://news.ycombinator.com/user?id=', 'http://news.ycombinator.com/user?id=', 'news.ycombinator.com/user?id='];
      return baseUrls;
    }
  }, {
    key: 'getProofUrl',
    value: function getProofUrl(proof) {
      var baseUrls = this.getBaseUrls();

      var proofUrl = proof.proof_url.toLowerCase();
      proofUrl = _get(HackerNews.__proto__ || Object.getPrototypeOf(HackerNews), 'prefixScheme', this).call(this, proofUrl);

      for (var i = 0; i < baseUrls.length; i++) {
        if (proofUrl === '' + baseUrls[i] + proof.identifier) {
          return proofUrl;
        }
      }
      throw new Error('Proof url ' + proof.proof_url + ' is not valid for service ' + proof.service);
    }
  }, {
    key: 'getProofStatement',
    value: function getProofStatement(searchText) {
      var $ = _cheerio2.default.load(searchText);
      var tables = $('#hnmain').children().find('table');
      var statement = '';

      if (tables.length > 0) {
        tables.each(function (tableIndex, table) {
          var rows = $(table).find('tr');

          if (rows.length > 0) {
            rows.each(function (idx, row) {
              var heading = $(row).find('td').first().text().trim();

              if (heading === 'about:') {
                statement = $(row).find('td').last().text().trim();
              }
            });
          }
        });
      }

      return statement;
    }
  }]);

  return HackerNews;
}(_service.Service);

exports.HackerNews = HackerNews;