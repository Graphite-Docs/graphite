var win = typeof window !== 'undefined' ? window : {};
var doc = typeof document !== 'undefined' ? document : { documentElement: {} };
// IE < 9 & Node
var scrollElem = typeof win.pageYOffset === 'undefined' ?
  doc.documentElement :
  null;

function detectScrollElem() {
  var startScrollTop = window.pageYOffset;
  document.documentElement.scrollTop = startScrollTop + 1;
  if (window.pageYOffset > startScrollTop) {
    document.documentElement.scrollTop = startScrollTop;
    // IE > 9 & FF (standard)
    return document.documentElement;
  }
  // Chrome (non-standard)
  return document.scrollingElement || document.body;
}

module.exports = function scrollDoc() {
  return scrollElem || (scrollElem = detectScrollElem());
}
