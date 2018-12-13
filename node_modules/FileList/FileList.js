//
// FileList
//
// http://www.w3.org/TR/FileAPI/#dfn-filelist
// https://developer.mozilla.org/en/DOM/FileList
(function () {
  "use strict";

  // create the constructor
  function FileList(args) {
    var i;

    if (!(args instanceof Array)) {
      args = Array.prototype.slice.call(arguments);
    }

    // forEach won't work because `this` loses its scope
    for (i = 0; i < args.length; i += 1) {
      this.push(args[i]);
    }

    // prevent user extension
    this.push = undefined;
    this.pop = undefined;
  };

  // inherit from Array
  FileList.prototype = new Array;

  // add some sugar
  FileList.prototype.item = function(index) {
    return this[index];
  };

  module.exports = FileList;
}());
