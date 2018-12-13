Quill.register('modules/cursors', QuillCursors);

var quillOne = new Quill('#editor-one', {
  theme: 'snow',
  modules: {
    cursors: true
  }
});

var quillTwo = new Quill('#editor-two', {
  theme: 'snow',
  modules: {
    cursors: true
  }
});

var cursorsOne = quillOne.getModule('cursors');
var cursorsTwo = quillTwo.getModule('cursors');

function textChangeHandler(quill) {
  return function(delta, oldDelta, source) {
    if (source == 'user')
      quill.updateContents(delta);
  };
}

quillOne.on('text-change', textChangeHandler(quillTwo));
quillTwo.on('text-change', textChangeHandler(quillOne));

quillOne.on('selection-change', function(range, oldRange, source) {
  if (range)
    cursorsTwo.setCursor('1', range, 'User 1', 'red');
});

quillTwo.on('selection-change', function(range, oldRange, source) {
  if (range)
    cursorsOne.setCursor('2', range, 'User 2', 'blue');
});
