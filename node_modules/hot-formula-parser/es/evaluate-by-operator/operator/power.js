import { toNumber } from './../../helper/number';
import { ERROR_VALUE } from './../../error';

export var SYMBOL = '^';

export default function func(exp1, exp2) {
  var result = Math.pow(toNumber(exp1), toNumber(exp2));

  if (isNaN(result)) {
    throw Error(ERROR_VALUE);
  }

  return result;
}

func.SYMBOL = SYMBOL;