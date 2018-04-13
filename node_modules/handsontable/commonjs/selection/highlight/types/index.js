'use strict';

exports.__esModule = true;
exports.createHighlight = undefined;

var _staticRegister2 = require('./../../../utils/staticRegister');

var _staticRegister3 = _interopRequireDefault(_staticRegister2);

var _area = require('./area');

var _area2 = _interopRequireDefault(_area);

var _cell = require('./cell');

var _cell2 = _interopRequireDefault(_cell);

var _fill = require('./fill');

var _fill2 = _interopRequireDefault(_fill);

var _header = require('./header');

var _header2 = _interopRequireDefault(_header);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _staticRegister = (0, _staticRegister3.default)('highlight/types'),
    register = _staticRegister.register,
    getItem = _staticRegister.getItem,
    hasItem = _staticRegister.hasItem,
    getNames = _staticRegister.getNames,
    getValues = _staticRegister.getValues; /* eslint-disable import/prefer-default-export */


register('area', _area2.default);
register('cell', _cell2.default);
register('fill', _fill2.default);
register('header', _header2.default);

function createHighlight(highlightType, options) {
  return getItem(highlightType)(options);
}

exports.createHighlight = createHighlight;