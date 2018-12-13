/** PROMISIFY CALLBACK-STYLE FUNCTIONS TO ES6 PROMISES
*
* EXAMPLE:
* const fn = promisify( (callback) => callback(null, "Hello world!") );
* fn((err, str) => console.log(str));
* fn().then((str) => console.log(str));
* //Both functions, will log 'Hello world!'
*
* Note: The function you pass, may have any arguments you want, but the latest
* have to be the callback, which you will call with: next(err, value)
*
* @param method: Function/Array/Map = The function(s) to promisify
* @param options: Map =
*  "context" (default is function): The context which to apply the called function
*  "replace" (default is falsy): When passed an array/map, if to replace the original object
*
* @return: A promise if passed a function, otherwise the object with the promises
*
* @license: MIT
* @version: 1.0.3
* @author: Manuel Di Iorio
**/

var createCallback = function (method, context) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        var lastIndex = args.length - 1;
        var lastArg = args && args.length > 0 ? args[lastIndex] : null;
        var cb = typeof lastArg === 'function' ? lastArg : null;

        if (cb) {
            return method.apply(context, args);
        }

        return new Promise(function (resolve, reject) {
            args.push(function (err, val) {
                if (err) return reject(err);
                resolve(val);
            });

            method.apply(context, args);
        });
    };
};

if (typeof module === "undefined") module = {}; // Browserify this module

module.exports = function (methods, options) {
    options = options || {};
    var type = Object.prototype.toString.call(methods);

    if (type === "[object Object]" || type === "[object Array]") {
        var obj = options.replace ? methods : {};

        for (var key in methods) {
            if (methods.hasOwnProperty(key)) obj[key] = createCallback(methods[key]);
        }return obj;
    }

    return createCallback(methods, options.context || methods);
};

// Browserify this module
if (typeof exports === "undefined") {
    this["promisify"] = module.exports;
}
