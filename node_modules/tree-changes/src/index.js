// @flow
import deep from 'deep-diff';
import nested from 'nested-property';

type TypeInput = string | boolean | number | Array<string | boolean | number>;

function isPlainObj(...args: any): boolean {
  return args.every(d => {
    if (!d) return false;
    const prototype = Object.getPrototypeOf(d);

    return Object.prototype.toString.call(d)
      .slice(8, -1) === 'Object' && (prototype === null || prototype === Object.getPrototypeOf({}));
  });
}

function isArray(...args: any): boolean {
  return args.every(d => Array.isArray(d));
}

function isNumber(...args: any): boolean {
  return args.every(d => typeof d === 'number');
}

export default function treeChanges(data: Object, nextData: Object): Object {
  return {
    changed(key: string): boolean {
      const left = nested.get(data, key);
      const right = nested.get(nextData, key);

      if ((isArray(left, right)) || (isPlainObj(left, right))) {
        const diff = deep.diff(left, right);

        return !!diff;
      }

      return left !== right;
    },
    changedFrom(key: string, previous: TypeInput, actual: TypeInput): boolean {
      const useActual = typeof previous !== 'undefined' && typeof actual !== 'undefined';
      const left = nested.get(data, key);
      const right = nested.get(nextData, key);
      const leftComparator = Array.isArray(previous) ? previous.includes(left) : left === previous;
      const rightComparator = Array.isArray(actual) ? actual.includes(right) : right === actual;

      return leftComparator && (useActual ? rightComparator : !useActual);
    },
    changedTo(key: string, actual: TypeInput): boolean {
      const left = nested.get(data, key);
      const right = nested.get(nextData, key);
      const leftComparator = Array.isArray(actual) ? !actual.includes(left) : left !== actual;
      const rightComparator = Array.isArray(actual) ? actual.includes(right) : right === actual;

      return leftComparator && rightComparator;
    },
    increased(key: string): boolean {
      return isNumber(nested.get(data, key), nested.get(nextData, key)) && nested.get(data, key) < nested.get(nextData, key);
    },
    decreased(key: string): boolean {
      return isNumber(nested.get(data, key), nested.get(nextData, key)) && nested.get(data, key) > nested.get(nextData, key);
    },
  };
}
