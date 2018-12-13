'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _BinaryHeapJs = require('./BinaryHeap.js');

var _BinaryHeapJs2 = _interopRequireDefault(_BinaryHeapJs);

var _SkewHeapJs = require('./SkewHeap.js');

var _SkewHeapJs2 = _interopRequireDefault(_SkewHeapJs);

var _PairingHeapJs = require('./PairingHeap.js');

var _PairingHeapJs2 = _interopRequireDefault(_PairingHeapJs);

function PriorityQueue() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  if (typeof options === "function") {
    options = {
      comparator: options
    };
  }
  options.strategy = options.strategy || PriorityQueue.BinaryHeapStrategy;
  options.comparator = options.comparator || function (a, b) {
    if ([a, b].every(function (x) {
      return typeof x === 'number';
    })) return a - b;else {
      a = a.toString();
      b = b.toString();
      return a === b ? 0 : a < b ? -1 : 1;
    }
  };

  switch (Number(options.strategy)) {
    case PriorityQueue.BinaryHeapStrategy:
      return new _BinaryHeapJs2['default'](options.comparator);
      break;
    case PriorityQueue.SkewHeapStrategy:
      return new _SkewHeapJs2['default'](options.comparator);
      break;
    case PriorityQueue.PairingHeapStrategy:
      return new _PairingHeapJs2['default'](options.comparator);
      break;
    default:
      return new _BinaryHeapJs2['default'](options.comparator);
  }
}

PriorityQueue.strategies = ['BinaryHeapStrategy', 'SkewHeapStrategy', 'PairingHeapStrategy'];

PriorityQueue.strategies.forEach(function (x, i) {
  PriorityQueue[x] = i;
});

exports['default'] = PriorityQueue;
module.exports = exports['default'];