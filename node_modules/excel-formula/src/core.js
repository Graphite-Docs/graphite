/*
 * excelFormulaUtilitiesJS
 * https://github.com/joshatjben/excelFormulaUtilitiesJS/
 *
 * Copyright 2011, Josh Bennett
 * licensed under the MIT license.
 * https://github.com/joshatjben/excelFormulaUtilitiesJS/blob/master/LICENSE.txt
 *
 * Some functionality based off of the jquery core lib
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Based on Ewbi's Go Calc Prototype Excel Formula Parser. [http://ewbi.blogs.com/develops/2004/12/excel_formula_p.html]
 */
 
(function () {

    if (typeof window === 'undefined') {
      window = root;
    }
    var excelFormulaUtilities = window.excelFormulaUtilities = window.excelFormulaUtilities || {};
    var core = window.excelFormulaUtilities.core = {};
	window.excelFormulaUtilities.string = window.excelFormulaUtilities.string || {};
	
	/**
	* Simple/quick string formater. This will take an input string and apply n number of arguments to it.
	*
	* <b>example:</b><br />
	* <code>
	* <pre>
	*	var foo = excelFormulaUtilities.core.formatStr("{0}", "foo"); // foo will be set to "foo"
	*	var fooBar = excelFormulaUtilities.core.formatStr("{0} {1}", "foo", "bar"); // fooBar will be set to "fooBar"
	*	var error = excelFormulaUtilities.core.formatStr("{1}", "error"); // will throw an index out of range error since only 1 extra argument was passed, which would be index 0.
	* </pre>
	* </code>
	*
    * @memberOf window.excelFormulaUtilities.core
	* @function
    * @param {String} inStr 
    **/
	var formatStr = window.excelFormulaUtilities.string.formatStr = function(inStr) {
			var formattedStr = inStr;
			var argIndex = 1;
			for (; argIndex < arguments.length; argIndex++) {
				var replaceIndex = (argIndex - 1);
				var replaceRegex = new RegExp("\\{{1}" + replaceIndex.toString() + "{1}\\}{1}", "g");
				formattedStr = formattedStr.replace(replaceRegex, arguments[argIndex]);
			}
			return formattedStr;
		};
    
    var trim = window.excelFormulaUtilities.string.trim = function(inStr){
			return inStr.replace(/^\s|\s$/, "");
		};
	
	var trimHTML = window.excelFormulaUtilities.string.trim = function(inStr){
			return inStr.replace(/^(?:\s|&nbsp;|<\s*br\s*\/*\s*>)*|(?:\s|&nbsp;|<\s*br\s*\/*\s*>)*$/, "");
		};

	//Quick and dirty type checks
	/**
	* @param {object} obj
	* @returns {boolean}
	* @memberOf window.excelFormulaUtilities.core
	*/
	var isFunction = core.isFunction = function (obj) {
		return (typeof obj) === "function";
	};

	/**
	* @param {object} obj
	* @returns {boolean}
	* @memberOf window.excelFormulaUtilities.core
	*/
	var isArray = core.isArray = function (obj) {
		return (typeof obj) === "object" && obj.length;
	};

	/**
	* @param {object} obj
	* @returns {boolean}
	* @memberOf window.excelFormulaUtilities.core
	*/
	var isWindow = core.isWindow = function () {
		return obj && typeof obj === "object" && "setInterval" in obj;
	}; /*----The functionality below has based off of the jQuery core library----*/

	/**
	* Check if the object is a plain object or not. This has been pulled from the jQuery core and modified slightly.
	* @param {object} obj
	* @returns {boolean} returns weather the object is a plain object or not.
	* @memberOf window.excelFormulaUtilities.core
	*/
	var isPlainObject = core.isPlainObject = function (obj) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if (!obj || typeof obj !== "object" || obj.nodeType || isWindow(obj)) {
			return false;
		}
		// Not own constructor property must be Object
		if (obj.constructor && !hasOwnProperty.call(obj, "constructor") && !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
			return false;
		}
		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		var lastKey;
		for (key in obj) { lastKey = key; }
		return lastKey === undefined || hasOwnProperty.call(obj, lastKey);
	};

	/**
	* This has been pulled from the jQuery core and modified slightly. see http://api.jquery.com/jQuery.extend/
	* @param {object} target
	* @param {object} object add one or more object to extend the target.
	* @returns {object} returns the extended object.
	* @memberOf window.excelFormulaUtilities.core
	*/
	var extend = core.extend = function () {
		var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;
		// Handle a deep copy situation
		if (typeof target === "boolean") {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}
		// Handle case when target is a string or something (possible in deep copy)
		if (typeof target !== "object" && !isFunction(target)) {
			target = {};
		}
		// extend jQuery itself if only one argument is passed
		if (length === i) {
			target = this;
			--i;
		}
		for (; i < length; i++) {
			// Only deal with non-null/undefined values
			if ((options = arguments[i]) != null) {
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];
					// Prevent never-ending loop
					if (target === copy) {
						continue;
					}
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}
						// Never move original objects, clone them
						target[name] = core.extend(deep, clone, copy);
						// Don't bring in undefined values
					} else if (copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}
		// Return the modified object
		return target;
	}; /*----end of jquery functionality----*/

	
}());
