// @flow
const getObjectType = (value: any): string =>
  Object.prototype.toString.call(value).slice(8, -1);

const isObject = (value: any) => typeof value === 'object';

export default {
  null(value: any): boolean {
    return value === null;
  },
  undefined(value: any): boolean {
    return typeof value === 'undefined';
  },
  nullOrUndefined(value: any): boolean {
    return this.null(value) || this.undefined(value);
  },
  string(value: any): boolean {
    return typeof value === 'string';
  },
  number(value: any): boolean {
    return typeof value === 'number';
  },
  function(value: any): boolean {
    return typeof value === 'function';
  },
  boolean(value: any): boolean {
    return value === true || value === false;
  },
  array: Array.isArray,
  object(value: any): boolean {
    return (
      !this.nullOrUndefined(value) && (this.function(value) || isObject(value))
    );
  },
  plainObject(value: any): boolean {
    let prototype;

    return (
      getObjectType(value) === 'Object' &&
      ((prototype = Object.getPrototypeOf(value)),
      prototype === null || prototype === Object.getPrototypeOf({}))
    ); //eslint-disable-line no-return-assign
  },
  date(value: any): boolean {
    return getObjectType(value) === 'Date';
  },
  promise(value: any): boolean {
    return getObjectType(value) === 'Promise';
  },
  iterable(value: any): boolean {
    return (
      !this.nullOrUndefined(value) && this.function(value[Symbol.iterator])
    );
  },
  generator(value: any): boolean {
    return (
      this.iterable(value) &&
      this.function(value.next) &&
      this.function(value.throw)
    );
  },
  regexp(value: any): boolean {
    return getObjectType(value) === 'RegExp';
  },
  symbol(value: any): boolean {
    return getObjectType(value) === 'Symbol';
  },
  domElement(value: any): boolean {
    const DOM_PROPERTIES_TO_CHECK = [
      'innerHTML',
      'ownerDocument',
      'style',
      'attributes',
      'nodeValue',
    ];

    return (
      this.object(value) &&
      !this.plainObject(value) &&
      value.nodeType === 1 &&
      this.string(value.nodeName) &&
      DOM_PROPERTIES_TO_CHECK.every(property => property in value)
    );
  },
};
