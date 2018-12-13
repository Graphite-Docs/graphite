'use strict';

exports.__esModule = true;
exports.isIE8 = isIE8;
exports.isIE9 = isIE9;
exports.isSafari = isSafari;
exports.isChrome = isChrome;
exports.isMobileBrowser = isMobileBrowser;

var _isIE8 = !document.createTextNode('test').textContent;

function isIE8() {
  return _isIE8;
}

var _isIE9 = !!document.documentMode;

function isIE9() {
  return _isIE9;
}

var _isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

function isSafari() {
  return _isSafari;
}

var _isChrome = /Chrome/.test(navigator.userAgent) && /Google/.test(navigator.vendor);

function isChrome() {
  return _isChrome;
}

function isMobileBrowser(userAgent) {
  if (!userAgent) {
    userAgent = navigator.userAgent;
  }

  return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  );
}