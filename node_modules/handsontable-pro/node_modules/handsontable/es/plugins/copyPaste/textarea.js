var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class Textarea
 *
 * @plugin CopyPaste
 */
var Textarea = function () {
  _createClass(Textarea, null, [{
    key: 'getSingleton',
    value: function getSingleton() {
      globalSingleton.append();

      return globalSingleton;
    }
  }]);

  function Textarea() {
    _classCallCheck(this, Textarea);

    /**
     * Main textarea element.
     *
     * @type {HTMLElement}
     */
    this.element = void 0;
    /**
     * Store information about append to the document.body.
     *
     * @type {Boolean}
     */
    this.isAppended = false;
    /**
     * Reference counter.
     *
     * @type {Number}
     */
    this.refCounter = 0;
  }

  /**
   * Apends textarea element to the `body`
   */


  _createClass(Textarea, [{
    key: 'append',
    value: function append() {
      if (this.hasBeenDestroyed()) {
        this.create();
      }

      this.refCounter++;

      if (!this.isAppended && document.body) {
        if (document.body) {
          this.isAppended = true;
          document.body.appendChild(this.element);
        }
      }
    }

    /**
     * Prepares textarea element with proper attributes.
     */

  }, {
    key: 'create',
    value: function create() {
      this.element = document.createElement('textarea');
      this.element.id = 'HandsontableCopyPaste';
      this.element.className = 'copyPaste';
      this.element.tabIndex = -1;
      this.element.autocomplete = 'off';
      this.element.wrap = 'hard';
      this.element.value = ' ';
    }

    /**
     * Deselects textarea element if is active.
     */

  }, {
    key: 'deselect',
    value: function deselect() {
      if (this.element === document.activeElement) {
        document.activeElement.blur();
      }
    }

    /**
     * Destroy instance
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.refCounter--;
      this.refCounter = this.refCounter < 0 ? 0 : this.refCounter;

      if (this.hasBeenDestroyed() && this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
        this.element = null;
        this.isAppended = false;
      }
    }

    /**
     * Getter for the element.
     *
     * @returns {String}
     */

  }, {
    key: 'getValue',
    value: function getValue() {
      return this.element.value;
    }

    /**
     * Check if instance has been destroyed
     *
     * @returns {Boolean}
     */

  }, {
    key: 'hasBeenDestroyed',
    value: function hasBeenDestroyed() {
      return this.refCounter < 1;
    }

    /**
     * Check if the element is an active element in frame.
     *
     * @returns {Boolean}
     */

  }, {
    key: 'isActive',
    value: function isActive() {
      return this.element === document.activeElement;
    }

    /**
     * Sets focus on the element and select content.
     */

  }, {
    key: 'select',
    value: function select() {
      this.element.focus();
      this.element.select();
    }

    /**
     * Setter for the element.
     *
     * @param {String} data Value which should be insert into the element.
     */

  }, {
    key: 'setValue',
    value: function setValue(data) {
      this.element.value = data;
    }
  }]);

  return Textarea;
}();

var globalSingleton = new Textarea();

export default Textarea;