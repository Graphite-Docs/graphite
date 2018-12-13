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

var PairingHeapNode = function PairingHeapNode(val) {
  _classCallCheck(this, PairingHeapNode);

  this.value = val;
  this.head = null;
  this.next = null;
};

function traverse(node) {
  if (!node) return [];
  return [node.value].concat(_toConsumableArray(traverse(node.next)), _toConsumableArray(traverse(node.head)));
}

function count(node) {
  if (!node) return 0;
  return 1 + count(node.head) + count(node.next);
}

function merge(a, b, comp) {
  if (!(a && b)) return a || b;
  if (comp(a.value, b.value) < 0) {
    ;
    var _ref = [b, a];
    a = _ref[0];
    b = _ref[1];
  }b.next = a.head;
  a.head = b;
  return a;
}

function mergeList(s, comp) {
  var n = new PairingHeapNode(null);
  while (s) {
    var a = s,
        b = null;
    s = s.next;
    a.next = null;
    if (s) {
      b = s;
      s = s.next;
      b.next = null;
    }
    a = merge(a, b, comp);
    a.next = n.next;
    n.next = a;
  }
  while (n.next) {
    var j = n.next;
    n.next = n.next.next;
    s = merge(j, s, comp);
  }
  return s;
}

var PairingHeap = (function (_AbstructHeap) {
  _inherits(PairingHeap, _AbstructHeap);

  function PairingHeap(comp) {
    _classCallCheck(this, PairingHeap);

    _get(Object.getPrototypeOf(PairingHeap.prototype), "constructor", this).call(this, comp);
    this.root = null;
    this._length = 0;
  }

  _createClass(PairingHeap, [{
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
      this.root = merge(this.root, new PairingHeapNode(val), this.comp);
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
      var ret = this.root.value;
      this.root = mergeList(this.root.head, this.comp);
      --this._length;
      return ret;
    }
  }, {
    key: "meld",
    value: function meld(other) {
      this.root = merge(this.root, other.root, this.comp);
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

  return PairingHeap;
})(_AbstructHeapJs2["default"]);

exports["default"] = PairingHeap;
module.exports = exports["default"];