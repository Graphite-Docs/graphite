"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AbstructHeap = (function () {
  /**
   * Constructor of Priority Queue, with the given 'comparator'.
   * 'comparator' should be same as Array.prototype.sort's argument.
   * Like this: (a, b) => (a == b ? 0 : (a < b ? -1 : 1));
   * If not, default function will be passed by PriorityQueue entrypoint.
   * @param {Function}
   * @return {AbstractHeap<ElementType>}   
   */

  function AbstructHeap(comp) {
    _classCallCheck(this, AbstructHeap);

    this.comp = comp;
  }

  /**
   * Clear this priority queue.
   * @param {void}
   * @return {void}
   */

  _createClass(AbstructHeap, [{
    key: "clear",
    value: function clear() {
      throw "Not Implemented";
    }

    /**
     * Build priority queue from given array.
     * @param {Array}
     * @return {AbstractHeap<ElementType>}
     */
  }, {
    key: "from",
    value: function from(array) {
      this.clear();
      for (var i = 0, l = array.length; i < l; ++i) {
        this.push(array[i]);
      }return this;
    }

    /**
     * Write out the priority queue content as an Array.
     * @param {void}
     * @return {Array<ElementType>}
     */
  }, {
    key: "toArray",
    value: function toArray() {
      throw "Not Implemented";
    }

    /**
     * Returns size of the priority queue.
     * @param {void}
     * @return {Number}
     */
  }, {
    key: "size",
    value: function size() {
      throw "Not Implemented";
      return 0;
    }

    /**
     * Push the element to the priority queue and returns self.
     * @param {ElementType}
     * @return {AbstructHash<ElementType>}
     */
  }, {
    key: "push",
    value: function push(value) {
      throw "Not Implemented";
      return this;
    }

    /**
     * Enqueue the element to the priority queue and returns self. Alias of push().
     * @param {ElementType}
     * @return {AbstructHash<ElementType>}
     */
  }, {
    key: "enqueue",
    value: function enqueue(value) {
      return this.push(value);
    }

    /**
     * Get the top element of the priority queue. 
     * @return {ElementType}
     */
  }, {
    key: "top",
    value: function top() {
      throw "Not Implemented";
    }

    /**
     * Peek the top element of the priority queue. Alias of top().
     * @return {ElementType}
     */
  }, {
    key: "peek",
    value: function peek() {
      return this.top();
    }

    /**
     * Pop the top element of the priority queue.
     * @return {ElementType}
     */
  }, {
    key: "pop",
    value: function pop() {
      throw "Not Implemented";
    }

    /**
     * Dequeue the top element of the priority queue. Alias of pop().
     * @return {ElementType}
     */
  }, {
    key: "dequeue",
    value: function dequeue() {
      return this.pop();
    }

    /**
     * Returns the priority queue is empty or not.
     * @return {Boolean}
     */
  }, {
    key: "empty",
    value: function empty() {
      return this.size() === 0;
    }
  }]);

  return AbstructHeap;
})();

exports["default"] = AbstructHeap;
module.exports = exports["default"];