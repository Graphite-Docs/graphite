export default function jQueryWrapper(Handsontable) {
  var jQuery = typeof window === 'undefined' ? false : window.jQuery;

  if (!jQuery) {
    return;
  }

  jQuery.fn.handsontable = function (action) {
    var $this = this.first(); // Use only first element from list
    var instance = $this.data('handsontable');

    // Init case
    if (typeof action !== 'string') {
      var userSettings = action || {};

      if (instance) {
        instance.updateSettings(userSettings);
      } else {
        instance = new Handsontable.Core($this[0], userSettings);
        $this.data('handsontable', instance);
        instance.init();
      }

      return $this;
    }

    // Action case
    var args = [];
    var output = void 0;

    if (arguments.length > 1) {
      for (var i = 1, ilen = arguments.length; i < ilen; i++) {
        args.push(arguments[i]);
      }
    }

    if (instance) {
      if (typeof instance[action] !== 'undefined') {
        output = instance[action].apply(instance, args);

        if (action === 'destroy') {
          $this.removeData();
        }
      } else {
        throw new Error('Handsontable do not provide action: ' + action);
      }
    }

    return output;
  };
};