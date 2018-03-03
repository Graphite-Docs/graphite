'use strict';

exports.__esModule = true;

var _unicode = require('./../helpers/unicode');

var _mixed = require('./../helpers/mixed');

var _string = require('./../helpers/string');

var _array = require('./../helpers/array');

var _element = require('./../helpers/dom/element');

var _handsontableEditor = require('./handsontableEditor');

var _handsontableEditor2 = _interopRequireDefault(_handsontableEditor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AutocompleteEditor = _handsontableEditor2.default.prototype.extend();

/**
 * @private
 * @editor AutocompleteEditor
 * @class AutocompleteEditor
 * @dependencies HandsontableEditor
 */
AutocompleteEditor.prototype.init = function () {
  _handsontableEditor2.default.prototype.init.apply(this, arguments);
  this.query = null;
  this.strippedChoices = [];
  this.rawChoices = [];
};

AutocompleteEditor.prototype.getValue = function () {
  var _this2 = this;

  var selectedValue = this.rawChoices.find(function (value) {
    var strippedValue = _this2.stripValueIfNeeded(value);

    return strippedValue === _this2.TEXTAREA.value;
  });

  if ((0, _mixed.isDefined)(selectedValue)) {
    return selectedValue;
  }

  return this.TEXTAREA.value;
};

AutocompleteEditor.prototype.createElements = function () {
  _handsontableEditor2.default.prototype.createElements.apply(this, arguments);

  (0, _element.addClass)(this.htContainer, 'autocompleteEditor');
  (0, _element.addClass)(this.htContainer, window.navigator.platform.indexOf('Mac') === -1 ? '' : 'htMacScroll');
};

var skipOne = false;
function onBeforeKeyDown(event) {
  skipOne = false;
  var editor = this.getActiveEditor();

  if ((0, _unicode.isPrintableChar)(event.keyCode) || event.keyCode === _unicode.KEY_CODES.BACKSPACE || event.keyCode === _unicode.KEY_CODES.DELETE || event.keyCode === _unicode.KEY_CODES.INSERT) {
    var timeOffset = 0;

    // on ctl+c / cmd+c don't update suggestion list
    if (event.keyCode === _unicode.KEY_CODES.C && (event.ctrlKey || event.metaKey)) {
      return;
    }
    if (!editor.isOpened()) {
      timeOffset += 10;
    }

    if (editor.htEditor) {
      editor.instance._registerTimeout(setTimeout(function () {
        editor.queryChoices(editor.TEXTAREA.value);
        skipOne = true;
      }, timeOffset));
    }
  }
}

AutocompleteEditor.prototype.prepare = function () {
  this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
  _handsontableEditor2.default.prototype.prepare.apply(this, arguments);
};

AutocompleteEditor.prototype.open = function () {
  // Ugly fix for handsontable which grab window object for autocomplete scroll listener instead table element.
  this.TEXTAREA_PARENT.style.overflow = 'auto';
  _handsontableEditor2.default.prototype.open.apply(this, arguments);
  this.TEXTAREA_PARENT.style.overflow = '';

  var choicesListHot = this.htEditor.getInstance();
  var _this = this;
  var trimDropdown = this.cellProperties.trimDropdown === void 0 ? true : this.cellProperties.trimDropdown;

  this.TEXTAREA.style.visibility = 'visible';
  this.focus();

  choicesListHot.updateSettings({
    colWidths: trimDropdown ? [(0, _element.outerWidth)(this.TEXTAREA) - 2] : void 0,
    width: trimDropdown ? (0, _element.outerWidth)(this.TEXTAREA) + (0, _element.getScrollbarWidth)() + 2 : void 0,
    afterRenderer: function afterRenderer(TD, row, col, prop, value, cellProperties) {
      var _this$cellProperties = _this.cellProperties,
          filteringCaseSensitive = _this$cellProperties.filteringCaseSensitive,
          allowHtml = _this$cellProperties.allowHtml;

      var indexOfMatch = void 0;
      var match = void 0;

      value = (0, _mixed.stringify)(value);

      if (value && !allowHtml) {
        indexOfMatch = filteringCaseSensitive === true ? value.indexOf(this.query) : value.toLowerCase().indexOf(_this.query.toLowerCase());

        if (indexOfMatch !== -1) {
          match = value.substr(indexOfMatch, _this.query.length);
          value = value.replace(match, '<strong>' + match + '</strong>');
        }
      }
      TD.innerHTML = value;
    },

    autoColumnSize: true,
    modifyColWidth: function modifyColWidth(width, col) {
      // workaround for <strong> text overlapping the dropdown, not really accurate
      var autoWidths = this.getPlugin('autoColumnSize').widths;

      if (autoWidths[col]) {
        width = autoWidths[col];
      }

      return trimDropdown ? width : width + 15;
    }
  });

  // Add additional space for autocomplete holder
  this.htEditor.view.wt.wtTable.holder.parentNode.style['padding-right'] = (0, _element.getScrollbarWidth)() + 2 + 'px';

  if (skipOne) {
    skipOne = false;
  }

  _this.instance._registerTimeout(setTimeout(function () {
    _this.queryChoices(_this.TEXTAREA.value);
  }, 0));
};

AutocompleteEditor.prototype.close = function () {
  _handsontableEditor2.default.prototype.close.apply(this, arguments);
};
AutocompleteEditor.prototype.queryChoices = function (query) {
  var _this3 = this;

  this.query = query;
  var source = this.cellProperties.source;

  if (typeof source == 'function') {
    source.call(this.cellProperties, query, function (choices) {
      _this3.rawChoices = choices;
      _this3.updateChoicesList(_this3.stripValuesIfNeeded(choices));
    });
  } else if (Array.isArray(source)) {
    this.rawChoices = source;
    this.updateChoicesList(this.stripValuesIfNeeded(source));
  } else {
    this.updateChoicesList([]);
  }
};

AutocompleteEditor.prototype.updateChoicesList = function (choices) {
  var pos = (0, _element.getCaretPosition)(this.TEXTAREA);
  var endPos = (0, _element.getSelectionEndPosition)(this.TEXTAREA);
  var sortByRelevanceSetting = this.cellProperties.sortByRelevance;
  var filterSetting = this.cellProperties.filter;
  var orderByRelevance = null;
  var highlightIndex = null;

  if (sortByRelevanceSetting) {
    orderByRelevance = AutocompleteEditor.sortByRelevance(this.stripValueIfNeeded(this.getValue()), choices, this.cellProperties.filteringCaseSensitive);
  }
  var orderByRelevanceLength = Array.isArray(orderByRelevance) ? orderByRelevance.length : 0;

  if (filterSetting === false) {
    if (orderByRelevanceLength) {
      highlightIndex = orderByRelevance[0];
    }
  } else {
    var sorted = [];

    for (var i = 0, choicesCount = choices.length; i < choicesCount; i++) {
      if (sortByRelevanceSetting && orderByRelevanceLength <= i) {
        break;
      }
      if (orderByRelevanceLength) {
        sorted.push(choices[orderByRelevance[i]]);
      } else {
        sorted.push(choices[i]);
      }
    }

    highlightIndex = 0;
    choices = sorted;
  }

  this.strippedChoices = choices;
  this.htEditor.loadData((0, _array.pivot)([choices]));

  this.updateDropdownHeight();

  this.flipDropdownIfNeeded();

  if (this.cellProperties.strict === true) {
    this.highlightBestMatchingChoice(highlightIndex);
  }

  this.instance.listen(false);

  (0, _element.setCaretPosition)(this.TEXTAREA, pos, pos === endPos ? void 0 : endPos);
};

AutocompleteEditor.prototype.flipDropdownIfNeeded = function () {
  var textareaOffset = (0, _element.offset)(this.TEXTAREA);
  var textareaHeight = (0, _element.outerHeight)(this.TEXTAREA);
  var dropdownHeight = this.getDropdownHeight();
  var trimmingContainer = (0, _element.getTrimmingContainer)(this.instance.view.wt.wtTable.TABLE);
  var trimmingContainerScrollTop = trimmingContainer.scrollTop;
  var headersHeight = (0, _element.outerHeight)(this.instance.view.wt.wtTable.THEAD);
  var containerOffset = {
    row: 0,
    col: 0
  };

  if (trimmingContainer !== window) {
    containerOffset = (0, _element.offset)(trimmingContainer);
  }

  var spaceAbove = textareaOffset.top - containerOffset.top - headersHeight + trimmingContainerScrollTop;
  var spaceBelow = trimmingContainer.scrollHeight - spaceAbove - headersHeight - textareaHeight;
  var flipNeeded = dropdownHeight > spaceBelow && spaceAbove > spaceBelow;

  if (flipNeeded) {
    this.flipDropdown(dropdownHeight);
  } else {
    this.unflipDropdown();
  }

  this.limitDropdownIfNeeded(flipNeeded ? spaceAbove : spaceBelow, dropdownHeight);

  return flipNeeded;
};

AutocompleteEditor.prototype.limitDropdownIfNeeded = function (spaceAvailable, dropdownHeight) {
  if (dropdownHeight > spaceAvailable) {
    var tempHeight = 0;
    var i = 0;
    var lastRowHeight = 0;
    var height = null;

    do {
      lastRowHeight = this.htEditor.getRowHeight(i) || this.htEditor.view.wt.wtSettings.settings.defaultRowHeight;
      tempHeight += lastRowHeight;
      i++;
    } while (tempHeight < spaceAvailable);

    height = tempHeight - lastRowHeight;

    if (this.htEditor.flipped) {
      this.htEditor.rootElement.style.top = parseInt(this.htEditor.rootElement.style.top, 10) + dropdownHeight - height + 'px';
    }

    this.setDropdownHeight(tempHeight - lastRowHeight);
  }
};

AutocompleteEditor.prototype.flipDropdown = function (dropdownHeight) {
  var dropdownStyle = this.htEditor.rootElement.style;

  dropdownStyle.position = 'absolute';
  dropdownStyle.top = -dropdownHeight + 'px';

  this.htEditor.flipped = true;
};

AutocompleteEditor.prototype.unflipDropdown = function () {
  var dropdownStyle = this.htEditor.rootElement.style;

  if (dropdownStyle.position === 'absolute') {
    dropdownStyle.position = '';
    dropdownStyle.top = '';
  }

  this.htEditor.flipped = void 0;
};

AutocompleteEditor.prototype.updateDropdownHeight = function () {
  var currentDropdownWidth = this.htEditor.getColWidth(0) + (0, _element.getScrollbarWidth)() + 2;
  var trimDropdown = this.cellProperties.trimDropdown;

  this.htEditor.updateSettings({
    height: this.getDropdownHeight(),
    width: trimDropdown ? void 0 : currentDropdownWidth
  });

  this.htEditor.view.wt.wtTable.alignOverlaysWithTrimmingContainer();
};

AutocompleteEditor.prototype.setDropdownHeight = function (height) {
  this.htEditor.updateSettings({
    height: height
  });
};

AutocompleteEditor.prototype.finishEditing = function (restoreOriginalValue) {
  if (!restoreOriginalValue) {
    this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
  }
  _handsontableEditor2.default.prototype.finishEditing.apply(this, arguments);
};

AutocompleteEditor.prototype.highlightBestMatchingChoice = function (index) {
  if (typeof index === 'number') {
    this.htEditor.selectCell(index, 0, void 0, void 0, void 0, false);
  } else {
    this.htEditor.deselectCell();
  }
};

/**
 * Filters and sorts by relevance
 * @param value
 * @param choices
 * @param caseSensitive
 * @returns {Array} array of indexes in original choices array
 */
AutocompleteEditor.sortByRelevance = function (value, choices, caseSensitive) {
  var choicesRelevance = [];
  var currentItem = void 0;
  var valueLength = value.length;
  var valueIndex = void 0;
  var charsLeft = void 0;
  var result = [];
  var i = void 0;
  var choicesCount = choices.length;

  if (valueLength === 0) {
    for (i = 0; i < choicesCount; i++) {
      result.push(i);
    }
    return result;
  }

  for (i = 0; i < choicesCount; i++) {
    currentItem = (0, _string.stripTags)((0, _mixed.stringify)(choices[i]));

    if (caseSensitive) {
      valueIndex = currentItem.indexOf(value);
    } else {
      valueIndex = currentItem.toLowerCase().indexOf(value.toLowerCase());
    }

    if (valueIndex !== -1) {
      charsLeft = currentItem.length - valueIndex - valueLength;

      choicesRelevance.push({
        baseIndex: i,
        index: valueIndex,
        charsLeft: charsLeft,
        value: currentItem
      });
    }
  }

  choicesRelevance.sort(function (a, b) {

    if (b.index === -1) {
      return -1;
    }
    if (a.index === -1) {
      return 1;
    }

    if (a.index < b.index) {
      return -1;
    } else if (b.index < a.index) {
      return 1;
    } else if (a.index === b.index) {
      if (a.charsLeft < b.charsLeft) {
        return -1;
      } else if (a.charsLeft > b.charsLeft) {
        return 1;
      }
    }

    return 0;
  });

  for (i = 0, choicesCount = choicesRelevance.length; i < choicesCount; i++) {
    result.push(choicesRelevance[i].baseIndex);
  }

  return result;
};

AutocompleteEditor.prototype.getDropdownHeight = function () {
  var firstRowHeight = this.htEditor.getInstance().getRowHeight(0) || 23;
  var visibleRows = this.cellProperties.visibleRows;

  return this.strippedChoices.length >= visibleRows ? visibleRows * firstRowHeight : this.strippedChoices.length * firstRowHeight + 8;
};

AutocompleteEditor.prototype.stripValueIfNeeded = function (value) {
  return this.stripValuesIfNeeded([value])[0];
};

AutocompleteEditor.prototype.stripValuesIfNeeded = function (values) {
  var allowHtml = this.cellProperties.allowHtml;


  var stringifiedValues = (0, _array.arrayMap)(values, function (value) {
    return (0, _mixed.stringify)(value);
  });
  var strippedValues = (0, _array.arrayMap)(stringifiedValues, function (value) {
    return allowHtml ? value : (0, _string.stripTags)(value);
  });

  return strippedValues;
};

AutocompleteEditor.prototype.allowKeyEventPropagation = function (keyCode) {
  var selected = { row: this.htEditor.getSelectedRange() ? this.htEditor.getSelectedRange().from.row : -1 };
  var allowed = false;

  if (keyCode === _unicode.KEY_CODES.ARROW_DOWN && selected.row > 0 && selected.row < this.htEditor.countRows() - 1) {
    allowed = true;
  }
  if (keyCode === _unicode.KEY_CODES.ARROW_UP && selected.row > -1) {
    allowed = true;
  }

  return allowed;
};

AutocompleteEditor.prototype.discardEditor = function (result) {
  _handsontableEditor2.default.prototype.discardEditor.apply(this, arguments);

  this.instance.view.render();
};

exports.default = AutocompleteEditor;