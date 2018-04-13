import * as formulajs from '@handsontable/formulajs';
import SUPPORTED_FORMULAS from './../../supported-formulas';
import { ERROR_NAME } from './../../error';

export var SYMBOL = SUPPORTED_FORMULAS;

export default function func(symbol) {
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
      throw Error(ERROR_NAME);
    }

    return result;
  };
}

func.isFactory = true;
func.SYMBOL = SYMBOL;