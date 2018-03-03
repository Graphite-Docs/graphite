'use strict';

exports.__esModule = true;

var _element = require('./../helpers/dom/element');

var _autoResize = require('./../../lib/autoResize/autoResize');

var _autoResize2 = _interopRequireDefault(_autoResize);

var _baseEditor = require('./_baseEditor');

var _baseEditor2 = _interopRequireDefault(_baseEditor);

var _eventManager = require('./../eventManager');

var _eventManager2 = _interopRequireDefault(_eventManager);

var _unicode = require('./../helpers/unicode');

var _event = require('./../helpers/dom/event');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TextEditor = _baseEditor2.default.prototype.extend();

/**
 * @private
 * @editor TextEditor
 * @class TextEditor
 * @dependencies autoResize
 */
TextEditor.prototype.init = function () {
  var that = this;
  this.createElements();
  this.eventManager = new _eventManager2.default(this);
  this.bindEvents();
  this.autoResize = (0, _autoResize2.default)();

  this.instance.addHook('afterDestroy', function () {
    that.destroy();
  });
};

TextEditor.prototype.getValue = function () {
  return this.TEXTAREA.value;
};

TextEditor.prototype.setValue = function (newValue) {
  this.TEXTAREA.value = newValue;
};

var onBeforeKeyDown = function onBeforeKeyDown(event) {
  var instance = this,
      that = instance.getActiveEditor(),
      ctrlDown;

  // catch CTRL but not right ALT (which in some systems triggers ALT+CTRL)
  ctrlDown = (event.ctrlKey || event.metaKey) && !event.altKey;

  // Process only events that have been fired in the editor
  if (event.target !== that.TEXTAREA || (0, _event.isImmediatePropagationStopped)(event)) {
    return;
  }

  if (event.keyCode === 17 || event.keyCode === 224 || event.keyCode === 91 || event.keyCode === 93) {
    // when CTRL or its equivalent is pressed and cell is edited, don't prepare selectable text in textarea
    (0, _event.stopImmediatePropagation)(event);
    return;
  }

  switch (event.keyCode) {
    case _unicode.KEY_CODES.ARROW_RIGHT:
      if (that.isInFullEditMode()) {
        if (!that.isWaiting() && !that.allowKeyEventPropagation || !that.isWaiting() && that.allowKeyEventPropagation && !that.allowKeyEventPropagation(event.keyCode)) {
          (0, _event.stopImmediatePropagation)(event);
        }
      }
      break;
    case _unicode.KEY_CODES.ARROW_LEFT:
      if (that.isInFullEditMode()) {
        if (!that.isWaiting() && !that.allowKeyEventPropagation || !that.isWaiting() && that.allowKeyEventPropagation && !that.allowKeyEventPropagation(event.keyCode)) {
          (0, _event.stopImmediatePropagation)(event);
        }
      }
      break;
    case _unicode.KEY_CODES.ARROW_UP:
    case _unicode.KEY_CODES.ARROW_DOWN:
      if (that.isInFullEditMode()) {
        if (!that.isWaiting() && !that.allowKeyEventPropagation || !that.isWaiting() && that.allowKeyEventPropagation && !that.allowKeyEventPropagation(event.keyCode)) {
          (0, _event.stopImmediatePropagation)(event);
        }
      }
      break;

    case _unicode.KEY_CODES.ENTER:
      var selected = that.instance.getSelected();
      var isMultipleSelection = !(selected[0] === selected[2] && selected[1] === selected[3]);
      if (ctrlDown && !isMultipleSelection || event.altKey) {
        // if ctrl+enter or alt+enter, add new line
        if (that.isOpened()) {
          var caretPosition = (0, _element.getCaretPosition)(that.TEXTAREA),
              value = that.getValue();

          var newValue = value.slice(0, caretPosition) + '\n' + value.slice(caretPosition);

          that.setValue(newValue);

          (0, _element.setCaretPosition)(that.TEXTAREA, caretPosition + 1);
        } else {
          that.beginEditing(that.originalValue + '\n');
        }
        (0, _event.stopImmediatePropagation)(event);
      }
      event.preventDefault(); // don't add newline to field
      break;

    case _unicode.KEY_CODES.A:
    case _unicode.KEY_CODES.X:
    case _unicode.KEY_CODES.C:
    case _unicode.KEY_CODES.V:
      if (ctrlDown) {
        (0, _event.stopImmediatePropagation)(event); // CTRL+A, CTRL+C, CTRL+V, CTRL+X should only work locally when cell is edited (not in table context)
      }
      break;

    case _unicode.KEY_CODES.BACKSPACE:
    case _unicode.KEY_CODES.DELETE:
    case _unicode.KEY_CODES.HOME:
    case _unicode.KEY_CODES.END:
      (0, _event.stopImmediatePropagation)(event); // backspace, delete, home, end should only work locally when cell is edited (not in table context)
      break;
    default:
      break;
  }

  if ([_unicode.KEY_CODES.ARROW_UP, _unicode.KEY_CODES.ARROW_RIGHT, _unicode.KEY_CODES.ARROW_DOWN, _unicode.KEY_CODES.ARROW_LEFT].indexOf(event.keyCode) === -1) {
    that.autoResize.resize(String.fromCharCode(event.keyCode));
  }
};

TextEditor.prototype.open = function () {
  this.refreshDimensions(); // need it instantly, to prevent https://github.com/handsontable/handsontable/issues/348

  this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
};

TextEditor.prototype.close = function (tdOutside) {
  this.textareaParentStyle.display = 'none';

  this.autoResize.unObserve();

  if (document.activeElement === this.TEXTAREA) {
    this.instance.listen(); // don't refocus the table if user focused some cell outside of HT on purpose
  }
  this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
};

TextEditor.prototype.focus = function () {
  this.TEXTAREA.focus();
  (0, _element.setCaretPosition)(this.TEXTAREA, this.TEXTAREA.value.length);
};

TextEditor.prototype.createElements = function () {
  //    this.$body = $(document.body);

  this.TEXTAREA = document.createElement('TEXTAREA');

  (0, _element.addClass)(this.TEXTAREA, 'handsontableInput');

  this.textareaStyle = this.TEXTAREA.style;
  this.textareaStyle.width = 0;
  this.textareaStyle.height = 0;

  this.TEXTAREA_PARENT = document.createElement('DIV');
  (0, _element.addClass)(this.TEXTAREA_PARENT, 'handsontableInputHolder');

  this.textareaParentStyle = this.TEXTAREA_PARENT.style;
  this.textareaParentStyle.top = 0;
  this.textareaParentStyle.left = 0;
  this.textareaParentStyle.display = 'none';

  this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);

  this.instance.rootElement.appendChild(this.TEXTAREA_PARENT);

  var that = this;
  this.instance._registerTimeout(setTimeout(function () {
    that.refreshDimensions();
  }, 0));
};

TextEditor.prototype.getEditedCell = function () {
  var editorSection = this.checkEditorSection(),
      editedCell;

  switch (editorSection) {
    case 'top':
      editedCell = this.instance.view.wt.wtOverlays.topOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.textareaParentStyle.zIndex = 101;
      break;
    case 'top-left-corner':
      editedCell = this.instance.view.wt.wtOverlays.topLeftCornerOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.textareaParentStyle.zIndex = 103;
      break;
    case 'bottom-left-corner':
      editedCell = this.instance.view.wt.wtOverlays.bottomLeftCornerOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.textareaParentStyle.zIndex = 103;
      break;
    case 'left':
      editedCell = this.instance.view.wt.wtOverlays.leftOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.textareaParentStyle.zIndex = 102;
      break;
    case 'bottom':
      editedCell = this.instance.view.wt.wtOverlays.bottomOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.textareaParentStyle.zIndex = 102;
      break;
    default:
      editedCell = this.instance.getCell(this.row, this.col);
      this.textareaParentStyle.zIndex = '';
      break;
  }

  return editedCell != -1 && editedCell != -2 ? editedCell : void 0;
};

TextEditor.prototype.refreshValue = function () {
  var sourceData = this.instance.getSourceDataAtCell(this.row, this.prop);
  this.originalValue = sourceData;

  this.setValue(sourceData);
  this.refreshDimensions();
};

TextEditor.prototype.refreshDimensions = function () {
  if (this.state !== _baseEditor.EditorState.EDITING) {
    return;
  }
  this.TD = this.getEditedCell();

  // TD is outside of the viewport.
  if (!this.TD) {
    this.close(true);

    return;
  }
  var currentOffset = (0, _element.offset)(this.TD),
      containerOffset = (0, _element.offset)(this.instance.rootElement),
      scrollableContainer = (0, _element.getScrollableElement)(this.TD),
      totalRowsCount = this.instance.countRows(),


  // If colHeaders is disabled, cells in the first row have border-top
  editTopModifier = currentOffset.top === containerOffset.top ? 0 : 1,
      editTop = currentOffset.top - containerOffset.top - editTopModifier - (scrollableContainer.scrollTop || 0),
      editLeft = currentOffset.left - containerOffset.left - 1 - (scrollableContainer.scrollLeft || 0),
      settings = this.instance.getSettings(),
      rowHeadersCount = this.instance.hasRowHeaders(),
      colHeadersCount = this.instance.hasColHeaders(),
      editorSection = this.checkEditorSection(),
      backgroundColor = this.TD.style.backgroundColor,
      cssTransformOffset;

  // TODO: Refactor this to the new instance.getCell method (from #ply-59), after 0.12.1 is released
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

  if (colHeadersCount && this.instance.getSelected()[0] === 0 || settings.fixedRowsBottom && this.instance.getSelected()[0] === totalRowsCount - settings.fixedRowsBottom) {
    editTop += 1;
  }

  if (this.instance.getSelected()[1] === 0) {
    editLeft += 1;
  }

  if (cssTransformOffset && cssTransformOffset != -1) {
    this.textareaParentStyle[cssTransformOffset[0]] = cssTransformOffset[1];
  } else {
    (0, _element.resetCssTransform)(this.TEXTAREA_PARENT);
  }

  this.textareaParentStyle.top = editTop + 'px';
  this.textareaParentStyle.left = editLeft + 'px';

  var firstRowOffset = this.instance.view.wt.wtViewport.rowsRenderCalculator.startPosition;
  var firstColumnOffset = this.instance.view.wt.wtViewport.columnsRenderCalculator.startPosition;
  var horizontalScrollPosition = this.instance.view.wt.wtOverlays.leftOverlay.getScrollPosition();
  var verticalScrollPosition = this.instance.view.wt.wtOverlays.topOverlay.getScrollPosition();
  var scrollbarWidth = (0, _element.getScrollbarWidth)();

  var cellTopOffset = this.TD.offsetTop + firstRowOffset - verticalScrollPosition;
  var cellLeftOffset = this.TD.offsetLeft + firstColumnOffset - horizontalScrollPosition;

  var width = (0, _element.innerWidth)(this.TD) - 8;
  var actualVerticalScrollbarWidth = (0, _element.hasVerticalScrollbar)(scrollableContainer) ? scrollbarWidth : 0;
  var actualHorizontalScrollbarWidth = (0, _element.hasHorizontalScrollbar)(scrollableContainer) ? scrollbarWidth : 0;
  var maxWidth = this.instance.view.maximumVisibleElementWidth(cellLeftOffset) - 9 - actualVerticalScrollbarWidth;
  var height = this.TD.scrollHeight + 1;
  var maxHeight = Math.max(this.instance.view.maximumVisibleElementHeight(cellTopOffset) - actualHorizontalScrollbarWidth, 23);

  var cellComputedStyle = (0, _element.getComputedStyle)(this.TD);

  this.TEXTAREA.style.fontSize = cellComputedStyle.fontSize;
  this.TEXTAREA.style.fontFamily = cellComputedStyle.fontFamily;
  this.TEXTAREA.style.backgroundColor = ''; // RESET STYLE
  this.TEXTAREA.style.backgroundColor = backgroundColor ? backgroundColor : (0, _element.getComputedStyle)(this.TEXTAREA).backgroundColor;

  this.autoResize.init(this.TEXTAREA, {
    minHeight: Math.min(height, maxHeight),
    maxHeight: maxHeight, // TEXTAREA should never be wider than visible part of the viewport (should not cover the scrollbar)
    minWidth: Math.min(width, maxWidth),
    maxWidth: maxWidth // TEXTAREA should never be wider than visible part of the viewport (should not cover the scrollbar)
  }, true);

  this.textareaParentStyle.display = 'block';
};

TextEditor.prototype.bindEvents = function () {
  var editor = this;

  this.eventManager.addEventListener(this.TEXTAREA, 'cut', function (event) {
    (0, _event.stopPropagation)(event);
  });

  this.eventManager.addEventListener(this.TEXTAREA, 'paste', function (event) {
    (0, _event.stopPropagation)(event);
  });

  this.instance.addHook('afterScrollHorizontally', function () {
    editor.refreshDimensions();
  });

  this.instance.addHook('afterScrollVertically', function () {
    editor.refreshDimensions();
  });

  this.instance.addHook('afterColumnResize', function () {
    editor.refreshDimensions();
    editor.focus();
  });

  this.instance.addHook('afterRowResize', function () {
    editor.refreshDimensions();
    editor.focus();
  });

  this.instance.addHook('afterDestroy', function () {
    editor.eventManager.destroy();
  });
};

TextEditor.prototype.destroy = function () {
  this.eventManager.destroy();
};

exports.default = TextEditor;