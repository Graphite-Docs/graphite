import rangeFix from 'rangefix';
import tinycolor from 'tinycolor2';

var DEFAULTS = {
  template: [
    '<span class="ql-cursor-selections"></span>',
    '<span class="ql-cursor-caret-container">',
    '  <span class="ql-cursor-caret"></span>',
    '</span>',
    '<div class="ql-cursor-flag">',
    '  <small class="ql-cursor-name"></small>',
    '  <span class="ql-cursor-flag-flap"></span>',
    '</div>'
  ].join(''),
  autoRegisterListener: true,
  hideDelay: 3000,
  hideSpeed: 400
};

function QuillCursors(quill, options) {
  this.quill = quill;
  this._initOptions(options);
  this.cursors = {};
  this.container = this.quill.addContainer('ql-cursors');

  if (this.options.autoRegisterListener)
    this.registerTextChangeListener();

  window.addEventListener('resize', this.update.bind(this));
}

QuillCursors.prototype.registerTextChangeListener = function() {
  this.quill.on(this.quill.constructor.events.TEXT_CHANGE, this._applyDelta.bind(this));
};

QuillCursors.prototype.clearCursors = function() {
  Object.keys(this.cursors).forEach(this.removeCursor.bind(this));
};

QuillCursors.prototype.moveCursor = function(userId, range) {
  var cursor = this.cursors[userId];
  if (cursor) {
    cursor.range = range;
    cursor.el.classList.remove('hidden');
    this._updateCursor(cursor);
    // TODO Implement cursor hiding timeout like 0.20/benbro?
  }
};

QuillCursors.prototype.removeCursor = function(userId) {
  var cursor = this.cursors[userId];
  if (cursor)
    cursor.el.parentNode.removeChild(cursor.el);
  delete this.cursors[userId];
};

QuillCursors.prototype.setCursor = function(userId, range, name, color) {
  // Init cursor if it doesn't exist
  if (!this.cursors[userId]) {
    this.cursors[userId] = {
      userId: userId,
      color: color,
      range: range,
      el: null,
      selectionEl: null,
      caretEl: null,
      flagEl: null
    };

    // Build and init the remaining cursor elements
    this._buildCursor(userId, name);
  }

  // Move and update cursor
  window.setTimeout(function() {
    this.moveCursor(userId, range);
  }.bind(this));

  return this.cursors[userId];
};

QuillCursors.prototype.shiftCursors = function(index, length) {
  var cursor;

  Object.keys(this.cursors).forEach(function(userId) {
    if ((cursor = this.cursors[userId]) && cursor.range) {
      // If characters we're added or there is no selection
      // advance start/end if it's greater or equal than index
      if (length > 0 || cursor.range.length == 0)
        this._shiftCursor(userId, index - 1, length);
      // Else if characters were removed
      // move start/end back if it's only greater than index
      else
        this._shiftCursor(userId, index, length);
    }
  }, this);
};

QuillCursors.prototype.update = function() {
  Object.keys(this.cursors).map(function(key) {
    this._updateCursor(this.cursors[key])
  }.bind(this));
};

QuillCursors.prototype._initOptions = function(options) {
  this.options = DEFAULTS;
  this.options.template = options.template || this.options.template;
  this.options.autoRegisterListener = (options.autoRegisterListener == false) ? options.autoRegisterListener : this.options.autoRegisterListener;
  this.options.hideDelay = (options.hideDelay == undefined) ? this.options.hideDelay : options.hideDelay;
  this.options.hideSpeed = (options.hideSpeed == undefined) ? this.options.hideSpeed : options.hideSpeed;
};

QuillCursors.prototype._applyDelta = function(delta) {
  var index = 0;

  delta.ops.forEach(function(op) {
    var length = 0;

    if (op.insert) {
      length = op.insert.length || 1;
      this.shiftCursors(index, length);
    } else if (op.delete) {
      this.shiftCursors(index, -1 * op.delete);
    } else if (op.retain) {
      // Is this really needed?
      //this.shiftCursors(index, 0);
      length = op.retain
    }

    index += length;
  }, this);

  this.update();
};

QuillCursors.prototype._buildCursor = function(userId, name) {
  var cursor = this.cursors[userId];
  var el = document.createElement('span');
  var selectionEl;
  var caretEl;
  var flagEl;

  el.classList.add('ql-cursor');
  el.innerHTML = this.options.template;
  selectionEl = el.querySelector('.ql-cursor-selections');
  caretEl = el.querySelector('.ql-cursor-caret-container');
  flagEl = el.querySelector('.ql-cursor-flag');

  // Set color
  flagEl.style.backgroundColor = cursor.color;
  caretEl.querySelector('.ql-cursor-caret').style.backgroundColor = cursor.color;

  el.querySelector('.ql-cursor-name').innerText = name;

  // Set flag delay, speed
  flagEl.style.transitionDelay = this.options.hideDelay + 'ms';
  flagEl.style.transitionDuration = this.options.hideSpeed + 'ms';

  this.container.appendChild(el);

  // Set cursor elements
  cursor.el = el;
  cursor.selectionEl = selectionEl;
  cursor.caretEl = caretEl;
  cursor.flagEl = flagEl;
};

QuillCursors.prototype._shiftCursor = function(userId, index, length) {
  var cursor = this.cursors[userId];
  if (cursor.range.index > index)
    cursor.range.index += length;
};

QuillCursors.prototype._hideCursor = function(userId) {
  var cursor = this.cursors[userId];
  if (cursor)
    cursor.el.classList.add('hidden');
};

QuillCursors.prototype._updateCursor = function(cursor) {
  if (!cursor || !cursor.range) return;

  var startRange = cursor.range.index;
  var endRange = cursor.range.index + cursor.range.length;

  // Check ranges
  if(endRange > this.quill.getLength() - 1)
    endRange = this.quill.getLength() - 1;

  var containerRect = this.quill.container.getBoundingClientRect();
  var startLeaf = this.quill.getLeaf(startRange);
  var endLeaf = this.quill.getLeaf(endRange);
  var range = document.createRange();
  var rects;

  // Sanity check
  if (!startLeaf || !endLeaf ||
    !startLeaf[0] || !endLeaf[0] ||
    startLeaf[1] < 0 || endLeaf[1] < 0 ||
    !startLeaf[0].domNode || !endLeaf[0].domNode) {

    console.warn('[quill-cursors] A cursor couldn\'t be updated (ID ' + cursor.userId +'), hiding.');

    this._hideCursor(cursor.userId);

    return;
  }

  range.setStart(startLeaf[0].domNode, startLeaf[1]);
  range.setEnd(endLeaf[0].domNode, endLeaf[1]);
  rects = rangeFix.getClientRects(range);

  this._updateCaret(cursor, endLeaf);
  this._updateSelection(cursor, rects, containerRect);
};

QuillCursors.prototype._updateCaret = function(cursor, leaf) {
  var rect, index = cursor.range.index + cursor.range.length;

  // The only time a valid offset of 0 can occur is when the cursor is positioned
  // before the first character in a line, and it will be the case that the start
  // and end points of the range will be exactly the same... if they are not then
  // a block selection is taking place and we need to offset the character position
  // by -1;
  if (index > 0 && leaf[1] === 0 && cursor.range.index !== (cursor.range.index + cursor.range.length)) {
    index--;
  }

  rect = this.quill.getBounds(index);

  cursor.caretEl.style.top = (rect.top) + 'px';
  cursor.caretEl.style.left = (rect.left) + 'px';
  cursor.caretEl.style.height = rect.height + 'px';

  cursor.flagEl.style.top = (rect.top) + 'px';
  cursor.flagEl.style.left = (rect.left) + 'px';
};

QuillCursors.prototype._updateSelection = function(cursor, rects, containerRect) {
  function createSelectionBlock(rect) {
    var selectionBlockEl = document.createElement('span');

    selectionBlockEl.classList.add('ql-cursor-selection-block');
    selectionBlockEl.style.top = (rect.top - containerRect.top) + 'px';
    selectionBlockEl.style.left = (rect.left - containerRect.left) + 'px';
    selectionBlockEl.style.width = rect.width + 'px';
    selectionBlockEl.style.height = rect.height + 'px';
    selectionBlockEl.style.backgroundColor = tinycolor(cursor.color).setAlpha(0.3).toString();

    return selectionBlockEl;
  }

  // Wipe the slate clean
  cursor.selectionEl.innerHTML = null;

  var index = [];
  var rectIndex;

  [].forEach.call(rects, function(rect) {
    rectIndex = ('' + rect.top + rect.left + rect.width + rect.height);

    // Note: Safari throws a rect with length 1 when caret with no selection.
    // A check was addedfor to avoid drawing those carets - they show up on blinking.
    if (!~index.indexOf(rectIndex) && rect.width > 1) {
      index.push(rectIndex);
      cursor.selectionEl.appendChild(createSelectionBlock(rect));
    }
  }, this);
};

export default QuillCursors;
