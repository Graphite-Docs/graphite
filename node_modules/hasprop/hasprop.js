(function(){

  function hasProp(obj, path) {
    if (arguments.length === 1 && (typeof obj === 'object' || obj instanceof Object)) {
      return function(path) {
        return hasProp(obj, path);
      };
    }

    if (!(typeof obj === 'object' || obj instanceof Object) || obj === null) {
      return false;
    }

    var props = [];

    if (Array.isArray(path)) {
      props = path;
    } else {
      if (!(typeof path === 'string' || path instanceof String)) {
        return false;
      }

      props = (path.match(/(\[(.*?)\]|[0-9a-zA-Z_$]+)/gi)||props).map(function(match) {
        return match.replace(/[\[\]]/gi,'');
      });
    }


    var size = props.length;
    var last = props[size - 1];
    var head = obj;

    for (var i = 0; i < size; i += 1) {
      if (typeof head[props[i]] === 'undefined' ||
          head[props[i]] === null) {
        return false;
      }
      head = head[props[i]];
      if (typeof head !== 'undefined') {
        if (props[i] === last && i === size - 1) {
          return true;
        }
      }
    }

    return false;
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = hasProp;
  } else if (typeof exports !== 'undefined') {
    exports.hasProp = hasProp;
  } else {
    window.hasProp = hasProp;
  }

})();
