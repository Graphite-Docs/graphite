'use strict';

exports.__esModule = true;

var _tinyEmitter = require('tiny-emitter');

var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

var _evaluateByOperator = require('./evaluate-by-operator/evaluate-by-operator');

var _evaluateByOperator2 = _interopRequireDefault(_evaluateByOperator);

var _grammarParser = require('./grammar-parser/grammar-parser');

var _string = require('./helper/string');

var _number = require('./helper/number');

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

var _cell = require('./helper/cell');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class Parser
 */
var Parser = function (_Emitter) {
  _inherits(Parser, _Emitter);

  function Parser() {
    _classCallCheck(this, Parser);

    var _this = _possibleConstructorReturn(this, _Emitter.call(this));

    _this.parser = new _grammarParser.Parser();
    _this.parser.yy = {
      toNumber: _number.toNumber,
      trimEdges: _string.trimEdges,
      invertNumber: _number.invertNumber,
      throwError: function throwError(errorName) {
        return _this._throwError(errorName);
      },
      callVariable: function callVariable(variable) {
        return _this._callVariable(variable);
      },
      evaluateByOperator: _evaluateByOperator2['default'],
      callFunction: function callFunction(name, params) {
        return _this._callFunction(name, params);
      },
      cellValue: function cellValue(value) {
        return _this._callCellValue(value);
      },
      rangeValue: function rangeValue(start, end) {
        return _this._callRangeValue(start, end);
      }
    };
    _this.variables = Object.create(null);
    _this.functions = Object.create(null);

    _this.setVariable('TRUE', true).setVariable('FALSE', false).setVariable('NULL', null);
    return _this;
  }

  /**
   * Parse formula expression.
   *
   * @param {String} expression to parse.
   * @return {*} Returns an object with tow properties `error` and `result`.
   */


  Parser.prototype.parse = function parse(expression) {
    var result = null;
    var error = null;

    try {
      if (expression === '') {
        result = '';
      } else {
        result = this.parser.parse(expression);
      }
    } catch (ex) {
      var message = (0, _error2['default'])(ex.message);

      if (message) {
        error = message;
      } else {
        error = (0, _error2['default'])(_error.ERROR);
      }
    }

    if (result instanceof Error) {
      error = (0, _error2['default'])(result.message) || (0, _error2['default'])(_error.ERROR);
      result = null;
    }

    return {
      error: error,
      result: result
    };
  };

  /**
   * Set predefined variable name which can be visible while parsing formula expression.
   *
   * @param {String} name Variable name.
   * @param {*} value Variable value.
   * @returns {Parser}
   */


  Parser.prototype.setVariable = function setVariable(name, value) {
    this.variables[name] = value;

    return this;
  };

  /**
   * Get variable name.
   *
   * @param {String} name Variable name.
   * @returns {*}
   */


  Parser.prototype.getVariable = function getVariable(name) {
    return this.variables[name];
  };

  /**
   * Retrieve variable value by its name.
   *
   * @param name Variable name.
   * @returns {*}
   * @private
   */


  Parser.prototype._callVariable = function _callVariable(name) {
    var value = this.getVariable(name);

    this.emit('callVariable', name, function (newValue) {
      if (newValue !== void 0) {
        value = newValue;
      }
    });

    if (value === void 0) {
      throw Error(_error.ERROR_NAME);
    }

    return value;
  };

  /**
   * Set custom function which can be visible while parsing formula expression.
   *
   * @param {String} name Custom function name.
   * @param {Function} fn Custom function.
   * @returns {Parser}
   */


  Parser.prototype.setFunction = function setFunction(name, fn) {
    this.functions[name] = fn;

    return this;
  };

  /**
   * Get custom function.
   *
   * @param {String} name Custom function name.
   * @returns {*}
   */


  Parser.prototype.getFunction = function getFunction(name) {
    return this.functions[name];
  };

  /**
   * Call function with provided params.
   *
   * @param name Function name.
   * @param params Function params.
   * @returns {*}
   * @private
   */


  Parser.prototype._callFunction = function _callFunction(name) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var fn = this.getFunction(name);
    var value = void 0;

    if (fn) {
      value = fn(params);
    }

    this.emit('callFunction', name, params, function (newValue) {
      if (newValue !== void 0) {
        value = newValue;
      }
    });

    return value === void 0 ? (0, _evaluateByOperator2['default'])(name, params) : value;
  };

  /**
   * Retrieve value by its label (`B3`, `B$3`, `B$3`, `$B$3`).
   *
   * @param {String} label Coordinates.
   * @returns {*}
   * @private
   */


  Parser.prototype._callCellValue = function _callCellValue(label) {
    label = label.toUpperCase();

    var _extractLabel = (0, _cell.extractLabel)(label),
        row = _extractLabel[0],
        column = _extractLabel[1];

    var value = void 0;

    this.emit('callCellValue', { label: label, row: row, column: column }, function (_value) {
      value = _value;
    });

    return value;
  };

  /**
   * Retrieve value by its label (`B3:A1`, `B$3:A1`, `B$3:$A1`, `$B$3:A$1`).
   *
   * @param {String} startLabel Coordinates of the first cell.
   * @param {String} endLabel Coordinates of the last cell.
   * @returns {Array} Returns an array of mixed values.
   * @private
   */


  Parser.prototype._callRangeValue = function _callRangeValue(startLabel, endLabel) {
    startLabel = startLabel.toUpperCase();
    endLabel = endLabel.toUpperCase();

    var _extractLabel2 = (0, _cell.extractLabel)(startLabel),
        startRow = _extractLabel2[0],
        startColumn = _extractLabel2[1];

    var _extractLabel3 = (0, _cell.extractLabel)(endLabel),
        endRow = _extractLabel3[0],
        endColumn = _extractLabel3[1];

    var startCell = {};
    var endCell = {};

    if (startRow.index <= endRow.index) {
      startCell.row = startRow;
      endCell.row = endRow;
    } else {
      startCell.row = endRow;
      endCell.row = startRow;
    }

    if (startColumn.index <= endColumn.index) {
      startCell.column = startColumn;
      endCell.column = endColumn;
    } else {
      startCell.column = endColumn;
      endCell.column = startColumn;
    }

    startCell.label = (0, _cell.toLabel)(startCell.row, startCell.column);
    endCell.label = (0, _cell.toLabel)(endCell.row, endCell.column);

    var value = [];

    this.emit('callRangeValue', startCell, endCell, function () {
      var _value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      value = _value;
    });

    return value;
  };

  /**
   * Try to throw error by its name.
   *
   * @param {String} errorName Error name.
   * @returns {String}
   * @private
   */


  Parser.prototype._throwError = function _throwError(errorName) {
    if ((0, _error.isValidStrict)(errorName)) {
      throw Error(errorName);
    }

    throw Error(_error.ERROR);
  };

  return Parser;
}(_tinyEmitter2['default']);

exports['default'] = Parser;