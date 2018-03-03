import { empty, addClass, hasClass } from './../helpers/dom/element';
import { equalsIgnoreCase } from './../helpers/string';
import EventManager from './../eventManager';
import { isKey } from './../helpers/unicode';
import { partial } from './../helpers/function';
import { stopImmediatePropagation, isImmediatePropagationStopped } from './../helpers/dom/event';
import { getRenderer } from './index';

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
  getRenderer('base').apply(this, arguments);

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

  empty(TD); // TODO identify under what circumstances this line can be removed

  if (value === cellProperties.checkedTemplate || equalsIgnoreCase(value, cellProperties.checkedTemplate)) {
    input.checked = true;
  } else if (value === cellProperties.uncheckedTemplate || equalsIgnoreCase(value, cellProperties.uncheckedTemplate)) {
    input.checked = false;
  } else if (value === null) {
    // default value
    addClass(input, 'noValue');
  } else {
    input.style.display = 'none';
    addClass(input, BAD_VALUE_CLASS);
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
    var isKeyCode = partial(isKey, event.keyCode);

    if (isKeyCode(toggleKeys + '|' + switchOffKeys) && !isImmediatePropagationStopped(event)) {
      eachSelectedCheckboxCell(function () {
        stopImmediatePropagation(event);
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

    var _selRange$getTopLeftC = selRange.getTopLeftCorner(),
        startRow = _selRange$getTopLeftC.row,
        startColumn = _selRange$getTopLeftC.col;

    var _selRange$getBottomRi = selRange.getBottomRightCorner(),
        endRow = _selRange$getBottomRi.row,
        endColumn = _selRange$getBottomRi.col;

    var changes = [];

    for (var _row = startRow; _row <= endRow; _row += 1) {
      for (var _col = startColumn; _col <= endColumn; _col += 1) {
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
          if ([_cellProperties.checkedTemplate, _cellProperties.checkedTemplate.toString()].includes(dataAtCell)) {
            changes.push([_row, _col, _cellProperties.uncheckedTemplate]);
          } else if ([_cellProperties.uncheckedTemplate, _cellProperties.uncheckedTemplate.toString(), null, void 0].includes(dataAtCell)) {
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
    eventManager = new EventManager(instance);
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

export default checkboxRenderer;