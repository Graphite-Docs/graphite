'use strict';

exports.__esModule = true;
exports['default'] = evaluateByOperator;
exports.registerOperation = registerOperation;

var _add = require('./operator/add');

var _add2 = _interopRequireDefault(_add);

var _ampersand = require('./operator/ampersand');

var _ampersand2 = _interopRequireDefault(_ampersand);

var _divide = require('./operator/divide');

var _divide2 = _interopRequireDefault(_divide);

var _equal = require('./operator/equal');

var _equal2 = _interopRequireDefault(_equal);

var _formulaFunction = require('./operator/formula-function');

var _formulaFunction2 = _interopRequireDefault(_formulaFunction);

var _greaterThan = require('./operator/greater-than');

var _greaterThan2 = _interopRequireDefault(_greaterThan);

var _greaterThanOrEqual = require('./operator/greater-than-or-equal');

var _greaterThanOrEqual2 = _interopRequireDefault(_greaterThanOrEqual);

var _lessThan = require('./operator/less-than');

var _lessThan2 = _interopRequireDefault(_lessThan);

var _lessThanOrEqual = require('./operator/less-than-or-equal');

var _lessThanOrEqual2 = _interopRequireDefault(_lessThanOrEqual);

var _minus = require('./operator/minus');

var _minus2 = _interopRequireDefault(_minus);

var _multiply = require('./operator/multiply');

var _multiply2 = _interopRequireDefault(_multiply);

var _notEqual = require('./operator/not-equal');

var _notEqual2 = _interopRequireDefault(_notEqual);

var _power = require('./operator/power');

var _power2 = _interopRequireDefault(_power);

var _error = require('./../error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-disable import/no-named-as-default-member */
var availableOperators = Object.create(null);

/**
 * Evaluate values by operator id.git
 *
 * @param {String} operator Operator id.
 * @param {Array} [params=[]] Arguments to evaluate.
 * @returns {*}
 */
function evaluateByOperator(operator) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  operator = operator.toUpperCase();

  if (!availableOperators[operator]) {
    throw Error(_error.ERROR_NAME);
  }

  return availableOperators[operator].apply(availableOperators, params);
}

/**
 * Register operator.
 *
 * @param {String|Array} symbol Symbol to register.
 * @param {Function} func Logic to register for this symbol.
 */
function registerOperation(symbol, func) {
  if (!Array.isArray(symbol)) {
    symbol = [symbol.toUpperCase()];
  }
  symbol.forEach(function (s) {
    if (func.isFactory) {
      availableOperators[s] = func(s);
    } else {
      availableOperators[s] = func;
    }
  });
}

registerOperation(_add2['default'].SYMBOL, _add2['default']);
registerOperation(_ampersand2['default'].SYMBOL, _ampersand2['default']);
registerOperation(_divide2['default'].SYMBOL, _divide2['default']);
registerOperation(_equal2['default'].SYMBOL, _equal2['default']);
registerOperation(_power2['default'].SYMBOL, _power2['default']);
registerOperation(_formulaFunction2['default'].SYMBOL, _formulaFunction2['default']);
registerOperation(_greaterThan2['default'].SYMBOL, _greaterThan2['default']);
registerOperation(_greaterThanOrEqual2['default'].SYMBOL, _greaterThanOrEqual2['default']);
registerOperation(_lessThan2['default'].SYMBOL, _lessThan2['default']);
registerOperation(_lessThanOrEqual2['default'].SYMBOL, _lessThanOrEqual2['default']);
registerOperation(_multiply2['default'].SYMBOL, _multiply2['default']);
registerOperation(_notEqual2['default'].SYMBOL, _notEqual2['default']);
registerOperation(_minus2['default'].SYMBOL, _minus2['default']);