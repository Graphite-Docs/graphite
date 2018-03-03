'use strict';

exports.__esModule = true;

var _element = require('./../helpers/dom/element');

var _string = require('./../helpers/string');

var _eventManager = require('./../eventManager');

var _eventManager2 = _interopRequireDefault(_eventManager);

var _unicode = require('./../helpers/unicode');

var _function = require('./../helpers/function');

var _event = require('./../helpers/dom/event');

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isListeningKeyDownEvent = new WeakMap();
var isCheckboxListenerAdded = new WeakMap();
var BAD_VALUE_CLASS = 'htBadValue';

/**
 * Checkbox renderer
 *
 * @private
 * @param {Object} instance Handsontable instance
 * @param {Element} TD Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param value Value to render (remember to escape unsafe HTML before inserting to DOM!)
 * @param {Object} cellProperties Cell properties (shared by cell renderer and editor)
 */
function checkboxRenderer(instance, TD, row, col, prop, value, cellProperties) {
  (0, _index.getRenderer)('base').apply(this, arguments);

  var eventManager = registerEvents(instance);
  var input = createInput();
  var labelOptions = cellProperties.label;
  var badValue = false;

  if (typeof cellProperties.checkedTemplate === 'undefined') {
    cellProperties.checkedTemplate = true;
  }
  if (typeof cellProperties.uncheckedTemplate === 'undefined') {
    cellProperties.uncheckedTemplate = false;
  }

  (0, _element.empty)(TD); // TODO identify under what circumstances this line can be removed

  if (value === cellProperties.checkedTemplate || (0, _string.equalsIgnoreCase)(value, cellProperties.checkedTemplate)) {
    input.checked = true;
  } else if (value === cellProperties.uncheckedTemplate || (0, _string.equalsIgnoreCase)(value, cellProperties.uncheckedTemplate)) {
    input.checked = false;
  } else if (value === null) {
    // default value
    (0, _element.addClass)(input, 'noValue');
  } else {
    input.style.display = 'none';
    (0, _element.addClass)(input, BAD_VALUE_CLASS);
    badValue = true;
  }

  input.setAttribute('data-row', row);
  input.setAttribute('data-col', col);

  if (!badValue && labelOptions) {
    var labelText = '';

    if (labelOptions.value) {
      labelText = typeof labelOptions.value === 'function' ? labelOptions.value.call(this, row, col, prop, value) : labelOptions.value;
    } else if (labelOptions.property) {
      labelText = instance.getDataAtRowProp(row, labelOptions.property);
    }
    var label = createLabel(labelText);

    if (labelOptions.position === 'before') {
      label.appendChild(input);
    } else {
      label.insertBefore(input, label.firstChild);
    }
    input = label;
  }

  TD.appendChild(input);

  if (badValue) {
    TD.appendChild(document.createTextNode('#bad-value#'));
  }

  if (!isListeningKeyDownEvent.has(instance)) {
    isListeningKeyDownEvent.set(instance, true);
    instance.addHook('beforeKeyDown', onBeforeKeyDown);
  }

  /**
   * On before key down DOM listener.
   *
   * @private
   * @param {Event} event
   */
  function onBeforeKeyDown(event) {
    var toggleKeys = 'SPACE|ENTER';
    var switchOffKeys = 'DELETE|BACKSPACE';
    var isKeyCode = (0, _function.partial)(_unicode.isKey, event.keyCode);

    if (isKeyCode(toggleKeys + '|' + switchOffKeys) && !(0, _event.isImmediatePropagationStopped)(event)) {
      eachSelectedCheckboxCell(function () {
        (0, _event.stopImmediatePropagation)(event);
        event.preventDefault();
      });
    }
    if (isKeyCode(toggleKeys)) {
      changeSelectedCheckboxesState();
    }
    if (isKeyCode(switchOffKeys)) {
      changeSelectedCheckboxesState(true);
    }
  }

  /**
   * Change checkbox checked property
   *
   * @private
   * @param {Boolean} [uncheckCheckbox=false]
   */
  function changeSelectedCheckboxesState() {
    var uncheckCheckbox = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var selRange = instance.getSelectedRange();

    if (!selRange) {
      return;
    }

    var topLeft = selRange.getTopLeftCorner();
    var bottomRight = selRange.getBottomRightCorner();
    var changes = [];

    for (var _row = topLeft.row; _row <= bottomRight.row; _row += 1) {
      for (var _col = topLeft.col; _col <= bottomRight.col; _col += 1) {
        var _cellProperties = instance.getCellMeta(_row, _col);

        if (_cellProperties.type !== 'checkbox') {
          return;
        }

        /* eslint-disable no-continue */
        if (_cellProperties.readOnly === true) {
          continue;
        }

        if (typeof _cellProperties.checkedTemplate === 'undefined') {
          _cellProperties.checkedTemplate = true;
        }
        if (typeof _cellProperties.uncheckedTemplate === 'undefined') {
          _cellProperties.uncheckedTemplate = false;
        }

        var dataAtCell = instance.getDataAtCell(_row, _col);

        if (uncheckCheckbox === false) {
          if (dataAtCell === _cellProperties.checkedTemplate) {
            changes.push([_row, _col, _cellProperties.uncheckedTemplate]);
          } else if ([_cellProperties.uncheckedTemplate, null, void 0].indexOf(dataAtCell) !== -1) {
            changes.push([_row, _col, _cellProperties.checkedTemplate]);
          }
        } else {
          changes.push([_row, _col, _cellProperties.uncheckedTemplate]);
        }
      }
    }

    if (changes.length > 0) {
      instance.setDataAtCell(changes);
    }
  }

  /**
   * Call callback for each found selected cell with checkbox type.
   *
   * @private
   * @param {Function} callback
   */
  function eachSelectedCheckboxCell(callback) {
    var selRange = instance.getSelectedRange();

    if (!selRange) {
      return;
    }
    var topLeft = selRange.getTopLeftCorner();
    var bottomRight = selRange.getBottomRightCorner();

    for (var _row2 = topLeft.row; _row2 <= bottomRight.row; _row2++) {
      for (var _col2 = topLeft.col; _col2 <= bottomRight.col; _col2++) {
        var _cellProperties2 = instance.getCellMeta(_row2, _col2);

        if (_cellProperties2.type !== 'checkbox') {
          return;
        }

        var cell = instance.getCell(_row2, _col2);

        if (cell == null) {

          callback(_row2, _col2, _cellProperties2);
        } else {
          var checkboxes = cell.querySelectorAll('input[type=checkbox]');

          if (checkboxes.length > 0 && !_cellProperties2.readOnly) {
            callback(checkboxes);
          }
        }
      }
    }
  }
}

/**
 * Register checkbox listeners.
 *
 * @param {Handsontable} instance Handsontable instance.
 * @returns {EventManager}
 */
function registerEvents(instance) {
  var eventManager = isCheckboxListenerAdded.get(instance);

  if (!eventManager) {
    eventManager = new _eventManager2.default(instance);
    eventManager.addEventListener(instance.rootElement, 'click', function (event) {
      return onClick(event, instance);
    });
    eventManager.addEventListener(instance.rootElement, 'mouseup', function (event) {
      return onMouseUp(event, instance);
    });
    eventManager.addEventListener(instance.rootElement, 'change', function (event) {
      return onChange(event, instance);
    });

    isCheckboxListenerAdded.set(instance, eventManager);
  }

  return eventManager;
}

/**
 * Create input element.
 *
 * @returns {Node}
 */
function createInput() {
  var input = document.createElement('input');

  input.className = 'htCheckboxRendererInput';
  input.type = 'checkbox';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('tabindex', '-1');

  return input.cloneNode(false);
}

/**
 * Create label element.
 *
 * @returns {Node}
 */
function createLabel(text) {
  var label = document.createElement('label');

  label.className = 'htCheckboxRendererLabel';
  label.appendChild(document.createTextNode(text));

  return label.cloneNode(true);
}

/**
 * `mouseup` callback.
 *
 * @private
 * @param {Event} event `mouseup` event.
 * @param {Object} instance Handsontable instance.
 */
function onMouseUp(event, instance) {
  if (!isCheckboxInput(event.target)) {
    return;
  }
  setTimeout(instance.listen, 10);
}

/**
 * `click` callback.
 *
 * @private
 * @param {Event} event `click` event.
 * @param {Object} instance Handsontable instance.
 */
function onClick(event, instance) {
  if (!isCheckboxInput(event.target)) {
    return false;
  }

  var row = parseInt(event.target.getAttribute('data-row'), 10);
  var col = parseInt(event.target.getAttribute('data-col'), 10);
  var cellProperties = instance.getCellMeta(row, col);

  if (cellProperties.readOnly) {
    event.preventDefault();
  }
}

/**
 * `change` callback.
 *
 * @param {Event} event `change` event.
 * @param {Object} instance Handsontable instance.
 * @param {Object} cellProperties Reference to cell properties.
 * @returns {Boolean}
 */
function onChange(event, instance) {
  if (!isCheckboxInput(event.target)) {
    return false;
  }

  var row = parseInt(event.target.getAttribute('data-row'), 10);
  var col = parseInt(event.target.getAttribute('data-col'), 10);
  var cellProperties = instance.getCellMeta(row, col);

  if (!cellProperties.readOnly) {
    var newCheckboxValue = null;

    if (event.target.checked) {
      newCheckboxValue = cellProperties.uncheckedTemplate === void 0 ? true : cellProperties.checkedTemplate;
    } else {
      newCheckboxValue = cellProperties.uncheckedTemplate === void 0 ? false : cellProperties.uncheckedTemplate;
    }

    instance.setDataAtCell(row, col, newCheckboxValue);
  }
}

/**
 * Check if the provided element is the checkbox input.
 *
 * @private
 * @param {HTMLElement} element The element in question.
 * @returns {Boolean}
 */
function isCheckboxInput(element) {
  return element.tagName === 'INPUT' && element.getAttribute('type') === 'checkbox';
}

exports.default = checkboxRenderer;