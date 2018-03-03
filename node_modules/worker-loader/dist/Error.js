'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LoaderError = function (_Error) {
  _inherits(LoaderError, _Error);

  function LoaderError(err) {
    _classCallCheck(this, LoaderError);

    var _this = _possibleConstructorReturn(this, (LoaderError.__proto__ || Object.getPrototypeOf(LoaderError)).call(this, err));

    _this.name = err.name || 'Loader Error';
    _this.message = `${err.name}\n\n${err.message}\n`;
    _this.stack = false;
    return _this;
  }

  return LoaderError;
}(Error);

exports.default = LoaderError;