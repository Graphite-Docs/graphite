"use strict";
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _AbstructHeapJs = require('./AbstructHeap.js');

var _AbstructHeapJs2 = _interopRequireDefault(_AbstructHeapJs);

var SkewHeapNode = function SkewHeapNode(val) {
  _classCallCheck(this, SkewHeapNode);

  this.left = null;
  this.right = null;
  this.value = val;
};

function traverse(node) {
  if (!node) return [];
  return [].concat(_toConsumableArray(traverse(node.left)), [node.value], _toConsumableArray(traverse(node.right)));
}

function count(node) {
  if (!node) return 0;
  return 1 + count(node.left) + count(node.right);
}

function _meld(a, b, comp) {
  if (!(a && b)) return a || b;
  if (comp(a.value, b.value) < 0) {
    ;
    var _ref = [b, a];
    a = _ref[0];
    b = _ref[1];
  }a.right = _meld(a.right, b, comp);
  var _ref2 = [a.right, a.left];
  a.left = _ref2[0];
  a.right = _ref2[1];

  return a;
}

var SkewHeap = (function (_AbstructHeap) {
  _inherits(SkewHeap, _AbstructHeap);

  function SkewHeap(comp) {
    _classCallCheck(this, SkewHeap);

    _get(Object.getPrototypeOf(SkewHeap.prototype), "constructor", this).call(this, comp);
    this.root = null;
    this._length = 0;
  }

  _createClass(SkewHeap, [{
    key: "clear",
    value: function clear() {
      this._length = 0;
      this.root = null;
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return traverse(this.root).sort(this.comp).reverse();
    }
  }, {
    key: "size",
    value: function size() {
      return this._length;
    }
  }, {
    key: "push",
    value: function push(val) {
      this.root = _meld(this.root, new SkewHeapNode(val), this.comp);
      ++this._length;
      return this;
    }
  }, {
    key: "top",
    value: function top() {
      return this.root.value;
    }
  }, {
    key: "pop",
    value: function pop() {
      var ret = this.root;
      this.root = _meld(this.root.right, this.root.left, this.comp);
      --this._length;
      return ret.value;
    }
  }, {
    key: "meld",
    value: function meld(other) {
      this.root = _meld(this.root, other.root, this.comp);
      this._length += other.length;
      return this;
    }
  }, {
    key: "merge",
    value: function merge(other) {
      return this.meld(other);
    }
  }, {
    key: "empty",
    value: function empty() {
      return !!this.root;
    }
  }, {
    key: "length",
    get: function get() {
      return this._length;
    }
  }]);

  return SkewHeap;
})(_AbstructHeapJs2["default"]);

exports["default"] = SkewHeap;
module.exports = exports["default"];