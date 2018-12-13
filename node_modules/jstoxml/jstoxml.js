const ARRAY = 'array';
const BOOLEAN = 'boolean';
const DATE = 'date';
const NULL = 'null';
const NUMBER = 'number';
const OBJECT = 'object';
const SPECIAL_OBJECT = 'special-object';
const STRING = 'string';

const PRIVATE_VARS = ['_selfCloseTag', '_attrs'];
const PRIVATE_VARS_REGEXP = new RegExp(PRIVATE_VARS.join('|'), 'g');

/**
 * Determines the indent string based on current tree depth.
 */
const getIndentStr = (indent = '', depth = 0) => indent.repeat(depth);

/**
 * Sugar function supplementing JS's quirky typeof operator, plus some extra help to detect
 * "special objects" expected by jstoxml.
 * Example:
 * getType(new Date());
 * -> 'date'
 */
const getType = val =>
  Array.isArray(val) && ARRAY ||
      (typeof val === OBJECT && val !== null && val._name && SPECIAL_OBJECT) ||
      (val instanceof Date && DATE) ||
      val === null && NULL ||
      typeof val;

/**
 * Replaces matching values in a string with a new value.
 * Example:
 * filterStr('foo&bar', { '&': '&amp;' });
 * -> 'foo&amp;bar'
 */
const filterStr = (inputStr = '', filter = {}) => {
  const regexp = new RegExp(`(${ Object.keys(filter).join('|') })`, 'g');

  return String(inputStr).replace(regexp, (str, entity) => filter[entity] || '');
};

/**
 * Maps an object or array of arribute keyval pairs to a string.
 * Examples:
 * { foo: 'bar', baz: 'g' } -> 'foo="bar" baz="g"'
 * [ { ⚡: true }, { foo: 'bar' } ] -> '⚡ foo="bar"'
 */
const getAttributeKeyVals = (attributes = {}, filter) => {
  const isArray = Array.isArray(attributes);

  let keyVals = [];
  if (isArray) {
    // Array containing complex objects and potentially duplicate attributes.
    keyVals = attributes.map(attr => {
      const key = Object.keys(attr)[0];
      const val = attr[key];

      const filteredVal = (filter) ? filterStr(val, filter) : val;
      const valStr = (filteredVal === true) ? '' : `="${filteredVal}"`;
      return `${key}${valStr}`;
    });
  } else {
    const keys = Object.keys(attributes);
    keyVals = keys.map(key => {
      // Simple object - keyval pairs.

      // For boolean true, simply output the key.
      const filteredVal = (filter) ? filterStr(attributes[key], filter) : attributes[key];
      const valStr = (attributes[key] === true) ? '' : `="${filteredVal}"`;

      return `${key}${valStr}`;
    });
  }

  return keyVals;
};

/**
 * Converts an attributes object/array to a string of keyval pairs.
 * Example:
 * formatAttributes({ a: 1, b: 2 })
 * -> 'a="1" b="2"'
 */
const formatAttributes = (attributes = {}, filter) => {
  const keyVals = getAttributeKeyVals(attributes, filter);
  if (keyVals.length === 0) return '';

  const keysValsJoined = keyVals.join(' ');
  return ` ${keysValsJoined}`;
};

/**
 * Converts an object to a jstoxml array.
 * Example:
 * objToArray({ foo: 'bar', baz: 2 });
 * ->
 * [
 *   {
 *     _name: 'foo',
 *     _content: 'bar'
 *   },
 *   {
 *     _name: 'baz',
 *     _content: 2
 *   }
 * ]
 */
const objToArray = (obj = {}) => (Object.keys(obj).map(key => {
  return {
    _name: key,
    _content: obj[key]
  };
}));

/**
 * Determines if a value is a primitive JavaScript value (not including Symbol).
 * Example:
 * isPrimitive(4);
 * -> true
 */
const PRIMITIVE_TYPES = [STRING, NUMBER, BOOLEAN];
const isPrimitive = val => PRIMITIVE_TYPES.includes(getType(val));

/**
 * Determines if a value is a simple primitive type that can fit onto one line.  Needed for
 * determining any needed indenting and line breaks.
 * Example:
 * isSimpleType(new Date());
 * -> true
 */
const SIMPLE_TYPES = [...PRIMITIVE_TYPES, DATE, SPECIAL_OBJECT];
const isSimpleType = val => SIMPLE_TYPES.includes(getType(val));
/**
 * Determines if an XML string is a simple primitive, or contains nested data.
 * Example:
 * isSimpleXML('<foo />');
 * -> false
 */
const isSimpleXML = xmlStr => !xmlStr.match('<');

/**
 * Assembles an XML header as defined by the config.
 */
const DEFAULT_XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const getHeaderString = ({ header, indent, depth, isOutputStart }) => {
  const shouldOutputHeader = header && isOutputStart;

  if (!shouldOutputHeader) return '';

  const shouldUseDefaultHeader = typeof header === BOOLEAN;
  return `${ (shouldUseDefaultHeader) ? DEFAULT_XML_HEADER : header }${ indent ? '\n' : '' }`;
};

/**
 * Recursively traverses an object tree and converts the output to an XML string.
 * Example:
 * toXML({ foo: 'bar' });
 * -> <foo>bar</foo>
 */
export const toXML = (
  obj = {},
  config = {}
) => {
  const {
    // Tree depth
    depth = 0,
    indent,
    _isFirstItem,
    _isLastItem,
    attributesFilter,
    header,
    filter
  } = config;

  // Determine indent string based on depth.
  const indentStr = getIndentStr(indent, depth);

  // For branching based on value type.
  const valType = getType(obj);
  const isSimple = isSimpleType(obj);

  // Determine if this is the start of the output.  Needed for header and indenting.
  const isOutputStart = depth === 0 && (isSimple || (!isSimple && _isFirstItem));

  let outputStr = '';
  switch (valType) {
  case 'special-object': {
    // Processes a specially-formatted object used by jstoxml.

    const { _name, _content } = obj;

    // Output text content without a tag wrapper.
    if (_content === null) {
      outputStr = _name;
      break;
    }

    // Handles arrays of primitive values. (#33)
    if (Array.isArray(_content) && _content.every(isPrimitive)) {
      return _content.map(a => {
        return toXML({
          _name,
          _content: a
        },
        {
          ...config,
          depth
        });
      }).join('');
    }

    // Don't output private vars (such as _attrs).
    if (_name.match(PRIVATE_VARS_REGEXP)) break;

    // Process the nested new value and create new config.
    const newVal = toXML(_content, { ...config, depth: depth + 1 });
    const newValType = getType(newVal);
    const isNewValSimple = isSimpleXML(newVal);

    // Pre-tag output (indent and line breaks).
    const preIndentStr = (indent && !isOutputStart) ? '\n' : '';
    const preTag = `${preIndentStr}${indentStr}`;

    // Tag output.
    const valIsEmpty = newValType === 'undefined' || newVal === '';
    const shouldSelfClose = (typeof obj._selfCloseTag === BOOLEAN) ?
      (valIsEmpty && obj._selfCloseTag) :
      valIsEmpty;
    const selfCloseStr = (shouldSelfClose) ? '/' : '';
    const attributesString = formatAttributes(obj._attrs, attributesFilter);
    const tag = `<${_name}${attributesString}${selfCloseStr}>`;

    // Post-tag output (closing tag, indent, line breaks).
    const preTagCloseStr = (indent && !isNewValSimple) ? `\n${indentStr}` : '';
    const postTag = (!shouldSelfClose) ? `${newVal}${preTagCloseStr}</${_name}>` : '';

    outputStr = `${preTag}${tag}${postTag}`;
    break;
  }

  case 'object': {
    // Iterates over keyval pairs in an object, converting each item to a special-object.

    const keys = Object.keys(obj);
    const outputArr = keys.map((key, index) => {
      const newConfig = {
        ...config,
        _isFirstItem: index === 0,
        _isLastItem: ((index + 1) === keys.length)
      };

      const outputObj = { _name: key };

      if (getType(obj[key]) === 'object') {
        // Sub-object contains an object.

        // Move private vars up as needed.  Needed to support certain types of objects
        // E.g. { foo: { _attrs: { a: 1 } } } -> <foo a="1"/>
        PRIVATE_VARS.forEach(privateVar => {
          const val = obj[key][privateVar];
          if (typeof val !== 'undefined') {
            outputObj[privateVar] = val;
            delete obj[key][privateVar];
          }
        });

        const hasContent = typeof obj[key]._content !== 'undefined';
        if (hasContent) {
          // _content has sibling keys, so pass as an array (edge case).
          // E.g. { foo: 'bar', _content: { baz: 2 } } -> <foo>bar</foo><baz>2</baz>
          if (Object.keys(obj[key]).length > 1) {
            const newContentObj = Object.assign({}, obj[key]);
            delete newContentObj._content;

            outputObj._content = [
              ...objToArray(newContentObj),
              obj[key]._content
            ];
          }
        }
      }

      // Fallthrough: just pass the key as the content for the new special-object.
      if (typeof outputObj._content === 'undefined') outputObj._content = obj[key];

      const xml = toXML(outputObj, newConfig, key);

      return xml;
    }, config);

    outputStr = outputArr.join('');
    break;
  }

  case 'function': {
    // Executes a user-defined function and return output.

    const fnResult = obj(config);

    outputStr = toXML(fnResult, config);
    break;
  }

  case 'array': {
    // Iterates and converts each value in an array.

    const outputArr = obj.map((singleVal, index) => {
      const newConfig = {
        ...config,
        _isFirstItem: index === 0,
        _isLastItem: ((index + 1) === obj.length)
      };
      return toXML(singleVal, newConfig);
    });

    outputStr = outputArr.join('');

    break;
  }

  // number, string, boolean, date, null, etc
  default: {
    outputStr = filterStr(obj, filter);
    break;
  }
  }

  const headerStr = getHeaderString({ header, indent, depth, isOutputStart });

  return `${headerStr}${outputStr}`;
};

export default {
  toXML
};

