"use strict";
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _AbstructHeapJs = require('./AbstructHeap.js');

var _AbstructHeapJs2 = _interopRequireDefault(_AbstructHeapJs);

function _parent(i) {
  return i >> 1;
}
function _right(i) {
  return (i << 1) + 1;
}
function _left(i) {
  return i << 1;
}

function heapify(_x4, _x5, _x6) {
  var _again2 = true;

  _function2: while (_again2) {
    var arr = _x4,
        i = _x5,
        comp = _x6;
    l = r = largest = t = undefined;
    _again2 = false;

    var l = _left(i);
    var r = _right(i);
    var largest = undefined;

    if (l < arr.length && comp(arr[i], arr[l]) < 0) largest = l;else largest = i;
    if (r < arr.length && comp(arr[largest], arr[r]) < 0) largest = r;

    if (largest !== i) {
      var t = arr[i];
      arr[i] = arr[largest];
      arr[largest] = t;
      _x4 = arr;
      _x5 = largest;
      _x6 = comp;
      _again2 = true;
      continue _function2;
    }
  }
}

var BinaryHeap = (function (_AbstructHeap) {
  _inherits(BinaryHeap, _AbstructHeap);

  function BinaryHeap(comp) {
    _classCallCheck(this, BinaryHeap);

    _get(Object.getPrototypeOf(BinaryHeap.prototype), "constructor", this).call(this, comp);
    this.collection = [];
  }

  _createClass(BinaryHeap, [{
    key: "clear",
    value: function clear() {
      this.collection = [];
    }
  }, {
    key: "from",
    value: function from(array) {
      this.collection = array.slice(0);
      for (var i = ~ ~(array.length / 2); i >= 0; --i) {
        heapify(this.collection, i, this.comp);
      }return this;
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return this.collection.sort(this.comp);
    }
  }, {
    key: "size",
    value: function size() {
      return this.collection.length;
    }
  }, {
    key: "push",
    value: function push(value) {
      this.collection.push(value);
      var arr = this.collection;
      for (var i = arr.length - 1; i > 0 && this.comp(arr[_parent(i)], arr[i]) < 0; i = _parent(i)) {
        var t = arr[i];
        arr[i] = arr[_parent(i)];
        arr[_parent(i)] = t;
      }
      return this;
    }
  }, {
    key: "top",
    value: function top() {
      return this.collection[0];
    }
  }, {
    key: "pop",
    value: function pop() {
      var ret = this.collection[0];
      if (1 < this.collection.length) {
        this.collection[0] = this.collection.pop();
        heapify(this.collection, 0, this.comp);
      } else {
        this.collection.pop();
      }

      return ret;
    }
  }, {
    key: "length",
    get: function get() {
      return this.collection.length;
    }
  }]);

  return BinaryHeap;
})(_AbstructHeapJs2["default"]);

exports["default"] = BinaryHeap;
module.exports = exports["default"];