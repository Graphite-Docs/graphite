'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _element = require('./../helpers/dom/element');

var _event = require('./../helpers/dom/event');

var _unicode = require('./../helpers/unicode');

var _baseEditor = require('./_baseEditor');

var _baseEditor2 = _interopRequireDefault(_baseEditor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SelectEditor = _baseEditor2.default.prototype.extend();

/**
 * @private
 * @editor SelectEditor
 * @class SelectEditor
 */
SelectEditor.prototype.init = function () {
  this.select = document.createElement('SELECT');
  (0, _element.addClass)(this.select, 'htSelectEditor');
  this.select.style.display = 'none';
  this.instance.rootElement.appendChild(this.select);
  this.registerHooks();
};

SelectEditor.prototype.registerHooks = function () {
  var _this = this;

  this.instance.addHook('afterScrollHorizontally', function () {
    return _this.refreshDimensions();
  });
  this.instance.addHook('afterScrollVertically', function () {
    return _this.refreshDimensions();
  });
  this.instance.addHook('afterColumnResize', function () {
    return _this.refreshDimensions();
  });
  this.instance.addHook('afterRowResize', function () {
    return _this.refreshDimensions();
  });
};

SelectEditor.prototype.prepare = function () {
  _baseEditor2.default.prototype.prepare.apply(this, arguments);

  var selectOptions = this.cellProperties.selectOptions;
  var options;

  if (typeof selectOptions == 'function') {
    options = this.prepareOptions(selectOptions(this.row, this.col, this.prop));
  } else {
    options = this.prepareOptions(selectOptions);
  }

  (0, _element.empty)(this.select);

  for (var option in options) {
    if (Object.prototype.hasOwnProperty.call(options, option)) {
      var optionElement = document.createElement('OPTION');
      optionElement.value = option;
      (0, _element.fastInnerHTML)(optionElement, options[option]);
      this.select.appendChild(optionElement);
    }
  }
};

SelectEditor.prototype.prepareOptions = function (optionsToPrepare) {
  var preparedOptions = {};

  if (Array.isArray(optionsToPrepare)) {
    for (var i = 0, len = optionsToPrepare.length; i < len; i++) {
      preparedOptions[optionsToPrepare[i]] = optionsToPrepare[i];
    }
  } else if ((typeof optionsToPrepare === 'undefined' ? 'undefined' : _typeof(optionsToPrepare)) == 'object') {
    preparedOptions = optionsToPrepare;
  }

  return preparedOptions;
};

SelectEditor.prototype.getValue = function () {
  return this.select.value;
};

SelectEditor.prototype.setValue = function (value) {
  this.select.value = value;
};

var onBeforeKeyDown = function onBeforeKeyDown(event) {
  var instance = this;
  var editor = instance.getActiveEditor();

  switch (event.keyCode) {
    case _unicode.KEY_CODES.ARROW_UP:
      var previousOptionIndex = editor.select.selectedIndex - 1;
      if (previousOptionIndex >= 0) {
        editor.select[previousOptionIndex].selected = true;
      }

      (0, _event.stopImmediatePropagation)(event);
      event.preventDefault();
      break;

    case _unicode.KEY_CODES.ARROW_DOWN:
      var nextOptionIndex = editor.select.selectedIndex + 1;
      if (nextOptionIndex <= editor.select.length - 1) {
        editor.select[nextOptionIndex].selected = true;
      }

      (0, _event.stopImmediatePropagation)(event);
      event.preventDefault();
      break;
    default:
      break;
  }
};

SelectEditor.prototype.open = function () {
  this._opened = true;
  this.refreshDimensions();
  this.select.style.display = '';
  this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
};

SelectEditor.prototype.close = function () {
  this._opened = false;
  this.select.style.display = 'none';
  this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
};

SelectEditor.prototype.focus = function () {
  this.select.focus();
};

SelectEditor.prototype.refreshValue = function () {
  var sourceData = this.instance.getSourceDataAtCell(this.row, this.prop);
  this.originalValue = sourceData;

  this.setValue(sourceData);
  this.refreshDimensions();
};

SelectEditor.prototype.refreshDimensions = function () {
  if (this.state !== _baseEditor.EditorState.EDITING) {
    return;
  }
  this.TD = this.getEditedCell();

  // TD is outside of the viewport.
  if (!this.TD) {
    this.close();

    return;
  }
  var width = (0, _element.outerWidth)(this.TD) + 1,
      height = (0, _element.outerHeight)(this.TD) + 1,
      currentOffset = (0, _element.offset)(this.TD),
      containerOffset = (0, _element.offset)(this.instance.rootElement),
      scrollableContainer = (0, _element.getScrollableElement)(this.TD),
      editTop = currentOffset.top - containerOffset.top - 1 - (scrollableContainer.scrollTop || 0),
      editLeft = currentOffset.left - containerOffset.left - 1 - (scrollableContainer.scrollLeft || 0),
      editorSection = this.checkEditorSection(),
      cssTransformOffset;

  var settings = this.instance.getSettings();
  var rowHeadersCount = settings.rowHeaders ? 1 : 0;
  var colHeadersCount = settings.colHeaders ? 1 : 0;

  switch (editorSection) {
    case 'top':
      cssTransformOffset = (0, _element.getCssTransform)(this.instance.view.wt.wtOverlays.topOverlay.clone.wtTable.holder.parentNode);
      break;
    case 'left':
      cssTransformOffset = (0, _element.getCssTransform)(this.instance.view.wt.wtOverlays.leftOverlay.clone.wtTable.holder.parentNode);
      break;
    case 'top-left-corner':
      cssTransformOffset = (0, _element.getCssTransform)(this.instance.view.wt.wtOverlays.topLeftCornerOverlay.clone.wtTable.holder.parentNode);
      break;
    case 'bottom-left-corner':
      cssTransformOffset = (0, _element.getCssTransform)(this.instance.view.wt.wtOverlays.bottomLeftCornerOverlay.clone.wtTable.holder.parentNode);
      break;
    case 'bottom':
      cssTransformOffset = (0, _element.getCssTransform)(this.instance.view.wt.wtOverlays.bottomOverlay.clone.wtTable.holder.parentNode);
      break;
    default:
      break;
  }
  if (this.instance.getSelected()[0] === 0) {
    editTop += 1;
  }

  if (this.instance.getSelected()[1] === 0) {
    editLeft += 1;
  }

  var selectStyle = this.select.style;

  if (cssTransformOffset && cssTransformOffset != -1) {
    selectStyle[cssTransformOffset[0]] = cssTransformOffset[1];
  } else {
    (0, _element.resetCssTransform)(this.select);
  }
  var cellComputedStyle = (0, _element.getComputedStyle)(this.TD);

  if (parseInt(cellComputedStyle.borderTopWidth, 10) > 0) {
    height -= 1;
  }
  if (parseInt(cellComputedStyle.borderLeftWidth, 10) > 0) {
    width -= 1;
  }

  selectStyle.height = height + 'px';
  selectStyle.minWidth = width + 'px';
  selectStyle.top = editTop + 'px';
  selectStyle.left = editLeft + 'px';
  selectStyle.margin = '0px';
};

SelectEditor.prototype.getEditedCell = function () {
  var editorSection = this.checkEditorSection(),
      editedCell;

  switch (editorSection) {
    case 'top':
      editedCell = this.instance.view.wt.wtOverlays.topOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.select.style.zIndex = 101;
      break;
    case 'corner':
      editedCell = this.instance.view.wt.wtOverlays.topLeftCornerOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.select.style.zIndex = 103;
      break;
    case 'left':
      editedCell = this.instance.view.wt.wtOverlays.leftOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.select.style.zIndex = 102;
      break;
    default:
      editedCell = this.instance.getCell(this.row, this.col);
      this.select.style.zIndex = '';
      break;
  }

  return editedCell != -1 && editedCell != -2 ? editedCell : void 0;
};

exports.default = SelectEditor;