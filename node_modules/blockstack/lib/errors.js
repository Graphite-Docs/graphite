'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ERROR_CODES = exports.ERROR_CODES = {
  MISSING_PARAMETER: 'missing_parameter',
  REMOTE_SERVICE_ERROR: 'remote_service_error',
  UNKNOWN: 'unknown'
};

Object.freeze(ERROR_CODES);

var BlockstackError = exports.BlockstackError = function (_Error) {
  _inherits(BlockstackError, _Error);

  function BlockstackError(error) {
    _classCallCheck(this, BlockstackError);

    var _this = _possibleConstructorReturn(this, (BlockstackError.__proto__ || Object.getPrototypeOf(BlockstackError)).call(this, error.message));

    _this.code = error.code;
    _this.parameter = error.parameter ? error.parameter : null;
    return _this;
  }

  _createClass(BlockstackError, [{
    key: 'toString',
    value: function toString() {
      return _get(BlockstackError.prototype.__proto__ || Object.getPrototypeOf(BlockstackError.prototype), 'toString', this).call(this) + '\n    code: ' + this.code + ' param: ' + (this.parameter ? this.parameter : 'n/a');
    }
  }]);

  return BlockstackError;
}(Error);

var InvalidParameterError = exports.InvalidParameterError = function (_BlockstackError) {
  _inherits(InvalidParameterError, _BlockstackError);

  function InvalidParameterError(parameter) {
    var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    _classCallCheck(this, InvalidParameterError);

    var _this2 = _possibleConstructorReturn(this, (InvalidParameterError.__proto__ || Object.getPrototypeOf(InvalidParameterError)).call(this, { code: 'missing_parameter', message: message, parameter: '' }));

    _this2.name = 'MissingParametersError';
    return _this2;
  }

  return InvalidParameterError;
}(BlockstackError);

var MissingParameterError = exports.MissingParameterError = function (_BlockstackError2) {
  _inherits(MissingParameterError, _BlockstackError2);

  function MissingParameterError(parameter) {
    var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    _classCallCheck(this, MissingParameterError);

    var _this3 = _possibleConstructorReturn(this, (MissingParameterError.__proto__ || Object.getPrototypeOf(MissingParameterError)).call(this, { code: ERROR_CODES.MISSING_PARAMETER, message: message, parameter: parameter }));

    _this3.name = 'MissingParametersError';
    return _this3;
  }

  return MissingParameterError;
}(BlockstackError);

var RemoteServiceError = exports.RemoteServiceError = function (_BlockstackError3) {
  _inherits(RemoteServiceError, _BlockstackError3);

  function RemoteServiceError(response) {
    var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    _classCallCheck(this, RemoteServiceError);

    var _this4 = _possibleConstructorReturn(this, (RemoteServiceError.__proto__ || Object.getPrototypeOf(RemoteServiceError)).call(this, { code: ERROR_CODES.REMOTE_SERVICE_ERROR, message: message }));

    _this4.response = response;
    return _this4;
  }

  return RemoteServiceError;
}(BlockstackError);

var InvalidDIDError = exports.InvalidDIDError = function (_BlockstackError4) {
  _inherits(InvalidDIDError, _BlockstackError4);

  function InvalidDIDError() {
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    _classCallCheck(this, InvalidDIDError);

    var _this5 = _possibleConstructorReturn(this, (InvalidDIDError.__proto__ || Object.getPrototypeOf(InvalidDIDError)).call(this, { code: 'invalid_did_error', message: message }));

    _this5.name = 'InvalidDIDError';
    return _this5;
  }

  return InvalidDIDError;
}(BlockstackError);

var NotEnoughFundsError = exports.NotEnoughFundsError = function (_BlockstackError5) {
  _inherits(NotEnoughFundsError, _BlockstackError5);

  function NotEnoughFundsError(leftToFund) {
    _classCallCheck(this, NotEnoughFundsError);

    var message = 'Not enough UTXOs to fund. Left to fund: ' + leftToFund;

    var _this6 = _possibleConstructorReturn(this, (NotEnoughFundsError.__proto__ || Object.getPrototypeOf(NotEnoughFundsError)).call(this, { code: 'not_enough_error', message: message }));

    _this6.leftToFund = leftToFund;
    _this6.name = 'NotEnoughFundsError';
    _this6.message = message;
    return _this6;
  }

  return NotEnoughFundsError;
}(BlockstackError);

var InvalidAmountError = exports.InvalidAmountError = function (_BlockstackError6) {
  _inherits(InvalidAmountError, _BlockstackError6);

  function InvalidAmountError(fees, specifiedAmount) {
    _classCallCheck(this, InvalidAmountError);

    var message = 'Not enough coin to fund fees transaction fees. Fees would be ' + fees + ',' + (' specified spend is  ' + specifiedAmount);

    var _this7 = _possibleConstructorReturn(this, (InvalidAmountError.__proto__ || Object.getPrototypeOf(InvalidAmountError)).call(this, { code: 'invalid_amount_error', message: message }));

    _this7.specifiedAmount = specifiedAmount;
    _this7.fees = fees;
    _this7.name = 'InvalidAmountError';
    _this7.message = message;
    return _this7;
  }

  return InvalidAmountError;
}(BlockstackError);

var LoginFailedError = exports.LoginFailedError = function (_BlockstackError7) {
  _inherits(LoginFailedError, _BlockstackError7);

  function LoginFailedError(reason) {
    _classCallCheck(this, LoginFailedError);

    var message = 'Failed to login: ' + reason;

    var _this8 = _possibleConstructorReturn(this, (LoginFailedError.__proto__ || Object.getPrototypeOf(LoginFailedError)).call(this, { code: 'login_failed', message: message }));

    _this8.message = message;
    _this8.name = 'LoginFailedError';
    return _this8;
  }

  return LoginFailedError;
}(BlockstackError);

var SignatureVerificationError = exports.SignatureVerificationError = function (_BlockstackError8) {
  _inherits(SignatureVerificationError, _BlockstackError8);

  function SignatureVerificationError(reason) {
    _classCallCheck(this, SignatureVerificationError);

    var message = 'Failed to verify signature: ' + reason;

    var _this9 = _possibleConstructorReturn(this, (SignatureVerificationError.__proto__ || Object.getPrototypeOf(SignatureVerificationError)).call(this, { code: 'signature_verification_failure', message: message }));

    _this9.message = message;
    _this9.name = 'SignatureVerificationError';
    return _this9;
  }

  return SignatureVerificationError;
}(BlockstackError);