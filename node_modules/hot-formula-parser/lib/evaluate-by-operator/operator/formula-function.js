'use strict';

exports.__esModule = true;
exports.SYMBOL = undefined;
exports['default'] = func;

var _formulajs = require('@handsontable/formulajs');

var formulajs = _interopRequireWildcard(_formulajs);

var _supportedFormulas = require('./../../supported-formulas');

var _supportedFormulas2 = _interopRequireDefault(_supportedFormulas);

var _error = require('./../../error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var SYMBOL = exports.SYMBOL = _supportedFormulas2['default'];

function func(symbol) {
  return function __formulaFunction() {
    symbol = symbol.toUpperCase();

    var symbolParts = symbol.split('.');
    var foundFormula = false;
    var result = void 0;

    if (symbolParts.length === 1) {
      if (formulajs[symbolParts[0]]) {
        foundFormula = true;
        result = formulajs[symbolParts[0]].apply(formulajs, arguments);
      }
    } else {
      var length = symbolParts.length;
      var index = 0;
      var nestedFormula = formulajs;

      while (index < length) {
        nestedFormula = nestedFormula[symbolParts[index]];
        index++;

        if (!nestedFormula) {
          nestedFormula = null;
          break;
        }
      }
      if (nestedFormula) {
        foundFormula = true;
        result = nestedFormula.apply(undefined, arguments);
      }
    }

    if (!foundFormula) {
      throw Error(_error.ERROR_NAME);
    }

    return result;
  };
}

func.isFactory = true;
func.SYMBOL = SYMBOL;