(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["WPAPI"] = factory();
	else
		root["WPAPI"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * A WP REST API client for Node.js
	 *
	 * @example
	 *     var wp = new WPAPI({ endpoint: 'http://src.wordpress-develop.dev/wp-json' });
	 *     wp.posts().then(function( posts ) {
	 *         console.log( posts );
	 *     }).catch(function( err ) {
	 *         console.error( err );
	 *     });
	 *
	 * @license MIT
	 })
	 */
	'use strict';
	
	var extend = __webpack_require__( 1 );
	var objectReduce = __webpack_require__( 4 );
	
	// This JSON file provides enough data to create handler methods for all valid
	// API routes in WordPress 4.7
	var defaultRoutes = __webpack_require__( 5 );
	var buildRouteTree = __webpack_require__( 6 ).build;
	var generateEndpointFactories = __webpack_require__( 10 ).generate;
	
	// The default endpoint factories will be lazy-loaded by parsing the default
	// route tree data if a default-mode WPAPI instance is created (i.e. one that
	// is to be bootstrapped with the handlers for all of the built-in routes)
	var defaultEndpointFactories;
	
	// Constant used to detect first-party WordPress REST API routes
	var apiDefaultNamespace = 'wp/v2';
	
	// Pull in autodiscovery methods
	var autodiscovery = __webpack_require__( 33 );
	
	// Pull in base module constructors
	var WPRequest = __webpack_require__( 18 );
	
	// Pull in default HTTP transport
	var httpTransport = __webpack_require__( 43 );
	
	/**
	 * Construct a REST API client instance object to create
	 *
	 * @constructor WPAPI
	 * @param {Object} options             An options hash to configure the instance
	 * @param {String} options.endpoint    The URI for a WP-API endpoint
	 * @param {String} [options.username]  A WP-API Basic Auth username
	 * @param {String} [options.password]  A WP-API Basic Auth password
	 * @param {String} [options.nonce]     A WP nonce for use with cookie authentication
	 * @param {Object} [options.routes]    A dictionary of API routes with which to
	 *                                     bootstrap the WPAPI instance: the instance will
	 *                                     be initialized with default routes only
	 *                                     if this property is omitted
	 * @param {String} [options.transport] An optional dictionary of HTTP transport
	 *                                     methods (.get, .post, .put, .delete, .head)
	 *                                     to use instead of the defaults, e.g. to use
	 *                                     a different HTTP library than superagent
	 */
	function WPAPI( options ) {
	
		// Enforce `new`
		if ( this instanceof WPAPI === false ) {
			return new WPAPI( options );
		}
	
		if ( typeof options.endpoint !== 'string' ) {
			throw new Error( 'options hash must contain an API endpoint URL string' );
		}
	
		// Dictionary to be filled by handlers for default namespaces
		this._ns = {};
	
		this._options = {
			// Ensure trailing slash on endpoint URI
			endpoint: options.endpoint.replace(  /\/?$/, '/' )
		};
	
		// If any authentication credentials were provided, assign them now
		if ( options && ( options.username || options.password || options.nonce ) ) {
			this.auth( options );
		}
	
		return this
			// Configure custom HTTP transport methods, if provided
			.transport( options.transport )
			// Bootstrap with a specific routes object, if provided
			.bootstrap( options && options.routes );
	}
	
	/**
	 * Set custom transport methods to use when making HTTP requests against the API
	 *
	 * Pass an object with a function for one or many of "get", "post", "put",
	 * "delete" and "head" and that function will be called when making that type
	 * of request. The provided transport functions should take a WPRequest handler
	 * instance (_e.g._ the result of a `wp.posts()...` chain or any other chaining
	 * request handler) as their first argument; a `data` object as their second
	 * argument (for POST, PUT and DELETE requests); and an optional callback as
	 * their final argument. Transport methods should invoke the callback with the
	 * response data (or error, as appropriate), and should also return a Promise.
	 *
	 * @example <caption>showing how a cache hit (keyed by URI) could short-circuit a get request</caption>
	 *
	 *     var site = new WPAPI({
	 *       endpoint: 'http://my-site.com/wp-json'
	 *     });
	 *
	 *     // Overwrite the GET behavior to inject a caching layer
	 *     site.transport({
	 *       get: function( wpreq, cb ) {
	 *         var result = cache[ wpreq ];
	 *         // If a cache hit is found, return it via the same callback/promise
	 *         // signature as the default transport method
	 *         if ( result ) {
	 *           if ( cb && typeof cb === 'function' ) {
	 *             cb( null, result );
	 *           }
	 *           return Promise.resolve( result );
	 *         }
	 *
	 *         // Delegate to default transport if no cached data was found
	 *         return WPAPI.transport.get( wpreq, cb ).then(function( result ) {
	 *           cache[ wpreq ] = result;
	 *           return result;
	 *         });
	 *       }
	 *     });
	 *
	 * This is advanced behavior; you will only need to utilize this functionality
	 * if your application has very specific HTTP handling or caching requirements.
	 * Refer to the "http-transport" module within this application for the code
	 * implementing the built-in transport methods.
	 *
	 * @memberof! WPAPI
	 * @method transport
	 * @chainable
	 * @param {Object}   transport          A dictionary of HTTP transport methods
	 * @param {Function} [transport.get]    The function to use for GET requests
	 * @param {Function} [transport.post]   The function to use for POST requests
	 * @param {Function} [transport.put]    The function to use for PUT requests
	 * @param {Function} [transport.delete] The function to use for DELETE requests
	 * @param {Function} [transport.head]   The function to use for HEAD requests
	 * @returns {WPAPI} The WPAPI instance, for chaining
	 */
	WPAPI.prototype.transport = function( transport ) {
		// Local reference to avoid need to reference via `this` inside forEach
		var _options = this._options;
	
		// Create the default transport if it does not exist
		if ( ! _options.transport ) {
			_options.transport = Object.create( WPAPI.transport );
		}
	
		// Whitelist the methods that may be applied
		[ 'get', 'head', 'post', 'put', 'delete' ].forEach(function( key ) {
			if ( transport && transport[ key ] ) {
				_options.transport[ key ] = transport[ key ];
			}
		});
	
		return this;
	};
	
	/**
	 * Default HTTP transport methods object for all WPAPI instances
	 *
	 * These methods may be extended or replaced on an instance-by-instance basis
	 *
	 * @memberof! WPAPI
	 * @static
	 * @property transport
	 * @type {Object}
	 */
	WPAPI.transport = Object.create( httpTransport );
	Object.freeze( WPAPI.transport );
	
	/**
	 * Convenience method for making a new WPAPI instance
	 *
	 * @example
	 * These are equivalent:
	 *
	 *     var wp = new WPAPI({ endpoint: 'http://my.blog.url/wp-json' });
	 *     var wp = WPAPI.site( 'http://my.blog.url/wp-json' );
	 *
	 * `WPAPI.site` can take an optional API root response JSON object to use when
	 * bootstrapping the client's endpoint handler methods: if no second parameter
	 * is provided, the client instance is assumed to be using the default API
	 * with no additional plugins and is initialized with handlers for only those
	 * default API routes.
	 *
	 * @example
	 * These are equivalent:
	 *
	 *     // {...} means the JSON output of http://my.blog.url/wp-json
	 *     var wp = new WPAPI({
	 *       endpoint: 'http://my.blog.url/wp-json',
	 *       json: {...}
	 *     });
	 *     var wp = WPAPI.site( 'http://my.blog.url/wp-json', {...} );
	 *
	 * @memberof! WPAPI
	 * @static
	 * @param {String} endpoint The URI for a WP-API endpoint
	 * @param {Object} routes   The "routes" object from the JSON object returned
	 *                          from the root API endpoint of a WP site, which should
	 *                          be a dictionary of route definition objects keyed by
	 *                          the route's regex pattern
	 * @returns {WPAPI} A new WPAPI instance, bound to the provided endpoint
	 */
	WPAPI.site = function( endpoint, routes ) {
		return new WPAPI({
			endpoint: endpoint,
			routes: routes
		});
	};
	
	/**
	 * Generate a request against a completely arbitrary endpoint, with no assumptions about
	 * or mutation of path, filtering, or query parameters. This request is not restricted to
	 * the endpoint specified during WPAPI object instantiation.
	 *
	 * @example
	 * Generate a request to the explicit URL "http://your.website.com/wp-json/some/custom/path"
	 *
	 *     wp.url( 'http://your.website.com/wp-json/some/custom/path' ).get()...
	 *
	 * @memberof! WPAPI
	 * @param {String} url The URL to request
	 * @returns {WPRequest} A WPRequest object bound to the provided URL
	 */
	WPAPI.prototype.url = function( url ) {
		var options = extend( {}, this._options, {
			endpoint: url
		});
		return new WPRequest( options );
	};
	
	/**
	 * Generate a query against an arbitrary path on the current endpoint. This is useful for
	 * requesting resources at custom WP-API endpoints, such as WooCommerce's `/products`.
	 *
	 * @memberof! WPAPI
	 * @param {String} [relativePath] An endpoint-relative path to which to bind the request
	 * @returns {WPRequest} A request object
	 */
	WPAPI.prototype.root = function( relativePath ) {
		relativePath = relativePath || '';
		var options = extend( {}, this._options );
		// Request should be
		var request = new WPRequest( options );
	
		// Set the path template to the string passed in
		request._path = { '0': relativePath };
	
		return request;
	};
	
	/**
	 * Set the default headers to use for all HTTP requests created from this WPAPI
	 * site instance. Accepts a header name and its associated value as two strings,
	 * or multiple headers as an object of name-value pairs.
	 *
	 * @example <caption>Set a single header to be used by all requests to this site</caption>
	 *
	 *     site.setHeaders( 'Authorization', 'Bearer trustme' )...
	 *
	 * @example <caption>Set multiple headers to be used by all requests to this site</caption>
	 *
	 *     site.setHeaders({
	 *       Authorization: 'Bearer comeonwereoldfriendsright',
	 *       'Accept-Language': 'en-CA'
	 *     })...
	 *
	 * @memberof! WPAPI
	 * @since 1.1.0
	 * @chainable
	 * @param {String|Object} headers The name of the header to set, or an object of
	 *                                header names and their associated string values
	 * @param {String}        [value] The value of the header being set
	 * @returns {WPAPI} The WPAPI site handler instance, for chaining
	 */
	WPAPI.prototype.setHeaders = WPRequest.prototype.setHeaders;
	
	/**
	 * Set the authentication to use for a WPAPI site handler instance. Accepts basic
	 * HTTP authentication credentials (string username & password) or a Nonce (for
	 * cookie authentication) by default; may be overloaded to accept OAuth credentials
	 * in the future.
	 *
	 * @example <caption>Basic Authentication</caption>
	 *
	 *     site.auth({
	 *       username: 'admin',
	 *       password: 'securepass55'
	 *     })...
	 *
	 * @example <caption>Cookie/Nonce Authentication</caption>
	 *
	 *     site.auth({
	 *       nonce: 'somenonce'
	 *     })...
	 *
	 * @memberof! WPAPI
	 * @method
	 * @chainable
	 * @param {Object} credentials            An authentication credentials object
	 * @param {String} [credentials.username] A WP-API Basic HTTP Authentication username
	 * @param {String} [credentials.password] A WP-API Basic HTTP Authentication password
	 * @param {String} [credentials.nonce]    A WP nonce for use with cookie authentication
	 * @returns {WPAPI} The WPAPI site handler instance, for chaining
	 */
	WPAPI.prototype.auth = WPRequest.prototype.auth;
	
	// Apply the registerRoute method to the prototype
	WPAPI.prototype.registerRoute = __webpack_require__( 57 );
	
	/**
	 * Deduce request methods from a provided API root JSON response object's
	 * routes dictionary, and assign those methods to the current instance. If
	 * no routes dictionary is provided then the instance will be bootstrapped
	 * with route handlers for the default API endpoints only.
	 *
	 * This method is called automatically during WPAPI instance creation.
	 *
	 * @memberof! WPAPI
	 * @chainable
	 * @param {Object} routes The "routes" object from the JSON object returned
	 *                        from the root API endpoint of a WP site, which should
	 *                        be a dictionary of route definition objects keyed by
	 *                        the route's regex pattern
	 * @returns {WPAPI} The bootstrapped WPAPI client instance (for chaining or assignment)
	 */
	WPAPI.prototype.bootstrap = function( routes ) {
		var routesByNamespace;
		var endpointFactoriesByNamespace;
	
		if ( ! routes ) {
			// Auto-generate default endpoint factories if they are not already available
			if ( ! defaultEndpointFactories ) {
				routesByNamespace = buildRouteTree( defaultRoutes );
				defaultEndpointFactories = generateEndpointFactories( routesByNamespace );
			}
			endpointFactoriesByNamespace = defaultEndpointFactories;
		} else {
			routesByNamespace = buildRouteTree( routes );
			endpointFactoriesByNamespace = generateEndpointFactories( routesByNamespace );
		}
	
		// For each namespace for which routes were identified, store the generated
		// route handlers on the WPAPI instance's private _ns dictionary. These namespaced
		// handler methods can be accessed by calling `.namespace( str )` on the
		// client instance and passing a registered namespace string.
		// Handlers for default (wp/v2) routes will also be assigned to the WPAPI
		// client instance object itself, for brevity.
		return objectReduce( endpointFactoriesByNamespace, function( wpInstance, endpointFactories, namespace ) {
	
			// Set (or augment) the route handler factories for this namespace.
			wpInstance._ns[ namespace ] = objectReduce( endpointFactories, function( nsHandlers, handlerFn, methodName ) {
				nsHandlers[ methodName ] = handlerFn;
				return nsHandlers;
			}, wpInstance._ns[ namespace ] || {
				// Create all namespace dictionaries with a direct reference to the main WPAPI
				// instance's _options property so that things like auth propagate properly
				_options: wpInstance._options
			} );
	
			// For the default namespace, e.g. "wp/v2" at the time this comment was
			// written, ensure all methods are assigned to the root client object itself
			// in addition to the private _ns dictionary: this is done so that these
			// methods can be called with e.g. `wp.posts()` and not the more verbose
			// `wp.namespace( 'wp/v2' ).posts()`.
			if ( namespace === apiDefaultNamespace ) {
				Object.keys( wpInstance._ns[ namespace ] ).forEach(function( methodName ) {
					wpInstance[ methodName ] = wpInstance._ns[ namespace ][ methodName ];
				});
			}
	
			return wpInstance;
		}, this );
	};
	
	/**
	 * Access API endpoint handlers from a particular API namespace object
	 *
	 * @example
	 *
	 *     wp.namespace( 'myplugin/v1' ).author()...
	 *
	 *     // Default WP endpoint handlers are assigned to the wp instance itself.
	 *     // These are equivalent:
	 *     wp.namespace( 'wp/v2' ).posts()...
	 *     wp.posts()...
	 *
	 * @memberof! WPAPI
	 * @param {string} namespace A namespace string
	 * @returns {Object} An object of route endpoint handler methods for the
	 * routes within the specified namespace
	 */
	WPAPI.prototype.namespace = function( namespace ) {
		if ( ! this._ns[ namespace ] ) {
			throw new Error( 'Error: namespace ' + namespace + ' is not recognized' );
		}
		return this._ns[ namespace ];
	};
	
	/**
	 * Take an arbitrary WordPress site, deduce the WP REST API root endpoint, query
	 * that endpoint, and parse the response JSON. Use the returned JSON response
	 * to instantiate a WPAPI instance bound to the provided site.
	 *
	 * @memberof! WPAPI
	 * @static
	 * @param {string} url A URL within a REST API-enabled WordPress website
	 * @returns {Promise} A promise that resolves to a configured WPAPI instance bound
	 * to the deduced endpoint, or rejected if an endpoint is not found or the
	 * library is unable to parse the provided endpoint.
	 */
	WPAPI.discover = function( url ) {
		// local placeholder for API root URL
		var endpoint;
	
		// Try HEAD request first, for smaller payload: use WPAPI.site to produce
		// a request that utilizes the defined HTTP transports
		var req = WPAPI.site( url ).root();
		return req.headers()
			.catch(function() {
				// On the hypothesis that any error here is related to the HEAD request
				// failing, provisionally try again using GET because that method is
				// more widely supported
				return req.get();
			})
			// Inspect response to find API location header
			.then( autodiscovery.locateAPIRootHeader )
			.then(function( apiRootURL ) {
				// Set the function-scope variable that will be used to instantiate
				// the bound WPAPI instance,
				endpoint = apiRootURL;
	
				// then GET the API root JSON object
				return WPAPI.site( apiRootURL ).root().get();
			})
			.then(function( apiRootJSON ) {
				// Instantiate & bootstrap with the discovered methods
				return new WPAPI({
					endpoint: endpoint,
					routes: apiRootJSON.routes
				});
			})
			.catch(function( err ) {
				console.error( err );
				if ( endpoint ) {
					console.warn( 'Endpoint detected, proceeding despite error...' );
					console.warn( 'Binding to ' + endpoint + ' and assuming default routes' );
					return new WPAPI.site( endpoint );
				}
				throw new Error( 'Autodiscovery failed' );
			});
	};
	
	module.exports = WPAPI;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(2);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/*!
	 * node.extend
	 * Copyright 2011, John Resig
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://jquery.org/license
	 *
	 * @fileoverview
	 * Port of jQuery.extend that actually works on node.js
	 */
	var is = __webpack_require__(3);
	
	var extend = function extend() {
	  var target = arguments[0] || {};
	  var i = 1;
	  var length = arguments.length;
	  var deep = false;
	  var options, name, src, copy, copyIsArray, clone;
	
	  // Handle a deep copy situation
	  if (typeof target === 'boolean') {
	    deep = target;
	    target = arguments[1] || {};
	    // skip the boolean and the target
	    i = 2;
	  }
	
	  // Handle case when target is a string or something (possible in deep copy)
	  if (typeof target !== 'object' && !is.fn(target)) {
	    target = {};
	  }
	
	  for (; i < length; i++) {
	    // Only deal with non-null/undefined values
	    options = arguments[i];
	    if (options != null) {
	      if (typeof options === 'string') {
	        options = options.split('');
	      }
	      // Extend the base object
	      for (name in options) {
	        src = target[name];
	        copy = options[name];
	
	        // Prevent never-ending loop
	        if (target === copy) {
	          continue;
	        }
	
	        // Recurse if we're merging plain objects or arrays
	        if (deep && copy && (is.hash(copy) || (copyIsArray = is.array(copy)))) {
	          if (copyIsArray) {
	            copyIsArray = false;
	            clone = src && is.array(src) ? src : [];
	          } else {
	            clone = src && is.hash(src) ? src : {};
	          }
	
	          // Never move original objects, clone them
	          target[name] = extend(deep, clone, copy);
	
	        // Don't bring in undefined values
	        } else if (typeof copy !== 'undefined') {
	          target[name] = copy;
	        }
	      }
	    }
	  }
	
	  // Return the modified object
	  return target;
	};
	
	/**
	 * @public
	 */
	extend.version = '1.1.3';
	
	/**
	 * Exports module.
	 */
	module.exports = extend;


/***/ },
/* 3 */
/***/ function(module, exports) {

	/* globals window, HTMLElement */
	
	'use strict';
	
	/**!
	 * is
	 * the definitive JavaScript type testing library
	 *
	 * @copyright 2013-2014 Enrico Marino / Jordan Harband
	 * @license MIT
	 */
	
	var objProto = Object.prototype;
	var owns = objProto.hasOwnProperty;
	var toStr = objProto.toString;
	var symbolValueOf;
	if (typeof Symbol === 'function') {
	  symbolValueOf = Symbol.prototype.valueOf;
	}
	var isActualNaN = function (value) {
	  return value !== value;
	};
	var NON_HOST_TYPES = {
	  'boolean': 1,
	  number: 1,
	  string: 1,
	  undefined: 1
	};
	
	var base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
	var hexRegex = /^[A-Fa-f0-9]+$/;
	
	/**
	 * Expose `is`
	 */
	
	var is = {};
	
	/**
	 * Test general.
	 */
	
	/**
	 * is.type
	 * Test if `value` is a type of `type`.
	 *
	 * @param {Mixed} value value to test
	 * @param {String} type type
	 * @return {Boolean} true if `value` is a type of `type`, false otherwise
	 * @api public
	 */
	
	is.a = is.type = function (value, type) {
	  return typeof value === type;
	};
	
	/**
	 * is.defined
	 * Test if `value` is defined.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if 'value' is defined, false otherwise
	 * @api public
	 */
	
	is.defined = function (value) {
	  return typeof value !== 'undefined';
	};
	
	/**
	 * is.empty
	 * Test if `value` is empty.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is empty, false otherwise
	 * @api public
	 */
	
	is.empty = function (value) {
	  var type = toStr.call(value);
	  var key;
	
	  if (type === '[object Array]' || type === '[object Arguments]' || type === '[object String]') {
	    return value.length === 0;
	  }
	
	  if (type === '[object Object]') {
	    for (key in value) {
	      if (owns.call(value, key)) {
	        return false;
	      }
	    }
	    return true;
	  }
	
	  return !value;
	};
	
	/**
	 * is.equal
	 * Test if `value` is equal to `other`.
	 *
	 * @param {Mixed} value value to test
	 * @param {Mixed} other value to compare with
	 * @return {Boolean} true if `value` is equal to `other`, false otherwise
	 */
	
	is.equal = function equal(value, other) {
	  if (value === other) {
	    return true;
	  }
	
	  var type = toStr.call(value);
	  var key;
	
	  if (type !== toStr.call(other)) {
	    return false;
	  }
	
	  if (type === '[object Object]') {
	    for (key in value) {
	      if (!is.equal(value[key], other[key]) || !(key in other)) {
	        return false;
	      }
	    }
	    for (key in other) {
	      if (!is.equal(value[key], other[key]) || !(key in value)) {
	        return false;
	      }
	    }
	    return true;
	  }
	
	  if (type === '[object Array]') {
	    key = value.length;
	    if (key !== other.length) {
	      return false;
	    }
	    while (key--) {
	      if (!is.equal(value[key], other[key])) {
	        return false;
	      }
	    }
	    return true;
	  }
	
	  if (type === '[object Function]') {
	    return value.prototype === other.prototype;
	  }
	
	  if (type === '[object Date]') {
	    return value.getTime() === other.getTime();
	  }
	
	  return false;
	};
	
	/**
	 * is.hosted
	 * Test if `value` is hosted by `host`.
	 *
	 * @param {Mixed} value to test
	 * @param {Mixed} host host to test with
	 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
	 * @api public
	 */
	
	is.hosted = function (value, host) {
	  var type = typeof host[value];
	  return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
	};
	
	/**
	 * is.instance
	 * Test if `value` is an instance of `constructor`.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is an instance of `constructor`
	 * @api public
	 */
	
	is.instance = is['instanceof'] = function (value, constructor) {
	  return value instanceof constructor;
	};
	
	/**
	 * is.nil / is.null
	 * Test if `value` is null.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is null, false otherwise
	 * @api public
	 */
	
	is.nil = is['null'] = function (value) {
	  return value === null;
	};
	
	/**
	 * is.undef / is.undefined
	 * Test if `value` is undefined.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is undefined, false otherwise
	 * @api public
	 */
	
	is.undef = is.undefined = function (value) {
	  return typeof value === 'undefined';
	};
	
	/**
	 * Test arguments.
	 */
	
	/**
	 * is.args
	 * Test if `value` is an arguments object.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is an arguments object, false otherwise
	 * @api public
	 */
	
	is.args = is.arguments = function (value) {
	  var isStandardArguments = toStr.call(value) === '[object Arguments]';
	  var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
	  return isStandardArguments || isOldArguments;
	};
	
	/**
	 * Test array.
	 */
	
	/**
	 * is.array
	 * Test if 'value' is an array.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is an array, false otherwise
	 * @api public
	 */
	
	is.array = Array.isArray || function (value) {
	  return toStr.call(value) === '[object Array]';
	};
	
	/**
	 * is.arguments.empty
	 * Test if `value` is an empty arguments object.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
	 * @api public
	 */
	is.args.empty = function (value) {
	  return is.args(value) && value.length === 0;
	};
	
	/**
	 * is.array.empty
	 * Test if `value` is an empty array.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is an empty array, false otherwise
	 * @api public
	 */
	is.array.empty = function (value) {
	  return is.array(value) && value.length === 0;
	};
	
	/**
	 * is.arraylike
	 * Test if `value` is an arraylike object.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is an arguments object, false otherwise
	 * @api public
	 */
	
	is.arraylike = function (value) {
	  return !!value && !is.bool(value)
	    && owns.call(value, 'length')
	    && isFinite(value.length)
	    && is.number(value.length)
	    && value.length >= 0;
	};
	
	/**
	 * Test boolean.
	 */
	
	/**
	 * is.bool
	 * Test if `value` is a boolean.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is a boolean, false otherwise
	 * @api public
	 */
	
	is.bool = is['boolean'] = function (value) {
	  return toStr.call(value) === '[object Boolean]';
	};
	
	/**
	 * is.false
	 * Test if `value` is false.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is false, false otherwise
	 * @api public
	 */
	
	is['false'] = function (value) {
	  return is.bool(value) && Boolean(Number(value)) === false;
	};
	
	/**
	 * is.true
	 * Test if `value` is true.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is true, false otherwise
	 * @api public
	 */
	
	is['true'] = function (value) {
	  return is.bool(value) && Boolean(Number(value)) === true;
	};
	
	/**
	 * Test date.
	 */
	
	/**
	 * is.date
	 * Test if `value` is a date.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is a date, false otherwise
	 * @api public
	 */
	
	is.date = function (value) {
	  return toStr.call(value) === '[object Date]';
	};
	
	/**
	 * is.date.valid
	 * Test if `value` is a valid date.
	 *
	 * @param {Mixed} value value to test
	 * @returns {Boolean} true if `value` is a valid date, false otherwise
	 */
	is.date.valid = function (value) {
	  return is.date(value) && !isNaN(Number(value));
	};
	
	/**
	 * Test element.
	 */
	
	/**
	 * is.element
	 * Test if `value` is an html element.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is an HTML Element, false otherwise
	 * @api public
	 */
	
	is.element = function (value) {
	  return value !== undefined
	    && typeof HTMLElement !== 'undefined'
	    && value instanceof HTMLElement
	    && value.nodeType === 1;
	};
	
	/**
	 * Test error.
	 */
	
	/**
	 * is.error
	 * Test if `value` is an error object.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is an error object, false otherwise
	 * @api public
	 */
	
	is.error = function (value) {
	  return toStr.call(value) === '[object Error]';
	};
	
	/**
	 * Test function.
	 */
	
	/**
	 * is.fn / is.function (deprecated)
	 * Test if `value` is a function.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is a function, false otherwise
	 * @api public
	 */
	
	is.fn = is['function'] = function (value) {
	  var isAlert = typeof window !== 'undefined' && value === window.alert;
	  return isAlert || toStr.call(value) === '[object Function]';
	};
	
	/**
	 * Test number.
	 */
	
	/**
	 * is.number
	 * Test if `value` is a number.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is a number, false otherwise
	 * @api public
	 */
	
	is.number = function (value) {
	  return toStr.call(value) === '[object Number]';
	};
	
	/**
	 * is.infinite
	 * Test if `value` is positive or negative infinity.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
	 * @api public
	 */
	is.infinite = function (value) {
	  return value === Infinity || value === -Infinity;
	};
	
	/**
	 * is.decimal
	 * Test if `value` is a decimal number.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is a decimal number, false otherwise
	 * @api public
	 */
	
	is.decimal = function (value) {
	  return is.number(value) && !isActualNaN(value) && !is.infinite(value) && value % 1 !== 0;
	};
	
	/**
	 * is.divisibleBy
	 * Test if `value` is divisible by `n`.
	 *
	 * @param {Number} value value to test
	 * @param {Number} n dividend
	 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
	 * @api public
	 */
	
	is.divisibleBy = function (value, n) {
	  var isDividendInfinite = is.infinite(value);
	  var isDivisorInfinite = is.infinite(n);
	  var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
	  return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
	};
	
	/**
	 * is.integer
	 * Test if `value` is an integer.
	 *
	 * @param value to test
	 * @return {Boolean} true if `value` is an integer, false otherwise
	 * @api public
	 */
	
	is.integer = is['int'] = function (value) {
	  return is.number(value) && !isActualNaN(value) && value % 1 === 0;
	};
	
	/**
	 * is.maximum
	 * Test if `value` is greater than 'others' values.
	 *
	 * @param {Number} value value to test
	 * @param {Array} others values to compare with
	 * @return {Boolean} true if `value` is greater than `others` values
	 * @api public
	 */
	
	is.maximum = function (value, others) {
	  if (isActualNaN(value)) {
	    throw new TypeError('NaN is not a valid value');
	  } else if (!is.arraylike(others)) {
	    throw new TypeError('second argument must be array-like');
	  }
	  var len = others.length;
	
	  while (--len >= 0) {
	    if (value < others[len]) {
	      return false;
	    }
	  }
	
	  return true;
	};
	
	/**
	 * is.minimum
	 * Test if `value` is less than `others` values.
	 *
	 * @param {Number} value value to test
	 * @param {Array} others values to compare with
	 * @return {Boolean} true if `value` is less than `others` values
	 * @api public
	 */
	
	is.minimum = function (value, others) {
	  if (isActualNaN(value)) {
	    throw new TypeError('NaN is not a valid value');
	  } else if (!is.arraylike(others)) {
	    throw new TypeError('second argument must be array-like');
	  }
	  var len = others.length;
	
	  while (--len >= 0) {
	    if (value > others[len]) {
	      return false;
	    }
	  }
	
	  return true;
	};
	
	/**
	 * is.nan
	 * Test if `value` is not a number.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is not a number, false otherwise
	 * @api public
	 */
	
	is.nan = function (value) {
	  return !is.number(value) || value !== value;
	};
	
	/**
	 * is.even
	 * Test if `value` is an even number.
	 *
	 * @param {Number} value value to test
	 * @return {Boolean} true if `value` is an even number, false otherwise
	 * @api public
	 */
	
	is.even = function (value) {
	  return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
	};
	
	/**
	 * is.odd
	 * Test if `value` is an odd number.
	 *
	 * @param {Number} value value to test
	 * @return {Boolean} true if `value` is an odd number, false otherwise
	 * @api public
	 */
	
	is.odd = function (value) {
	  return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
	};
	
	/**
	 * is.ge
	 * Test if `value` is greater than or equal to `other`.
	 *
	 * @param {Number} value value to test
	 * @param {Number} other value to compare with
	 * @return {Boolean}
	 * @api public
	 */
	
	is.ge = function (value, other) {
	  if (isActualNaN(value) || isActualNaN(other)) {
	    throw new TypeError('NaN is not a valid value');
	  }
	  return !is.infinite(value) && !is.infinite(other) && value >= other;
	};
	
	/**
	 * is.gt
	 * Test if `value` is greater than `other`.
	 *
	 * @param {Number} value value to test
	 * @param {Number} other value to compare with
	 * @return {Boolean}
	 * @api public
	 */
	
	is.gt = function (value, other) {
	  if (isActualNaN(value) || isActualNaN(other)) {
	    throw new TypeError('NaN is not a valid value');
	  }
	  return !is.infinite(value) && !is.infinite(other) && value > other;
	};
	
	/**
	 * is.le
	 * Test if `value` is less than or equal to `other`.
	 *
	 * @param {Number} value value to test
	 * @param {Number} other value to compare with
	 * @return {Boolean} if 'value' is less than or equal to 'other'
	 * @api public
	 */
	
	is.le = function (value, other) {
	  if (isActualNaN(value) || isActualNaN(other)) {
	    throw new TypeError('NaN is not a valid value');
	  }
	  return !is.infinite(value) && !is.infinite(other) && value <= other;
	};
	
	/**
	 * is.lt
	 * Test if `value` is less than `other`.
	 *
	 * @param {Number} value value to test
	 * @param {Number} other value to compare with
	 * @return {Boolean} if `value` is less than `other`
	 * @api public
	 */
	
	is.lt = function (value, other) {
	  if (isActualNaN(value) || isActualNaN(other)) {
	    throw new TypeError('NaN is not a valid value');
	  }
	  return !is.infinite(value) && !is.infinite(other) && value < other;
	};
	
	/**
	 * is.within
	 * Test if `value` is within `start` and `finish`.
	 *
	 * @param {Number} value value to test
	 * @param {Number} start lower bound
	 * @param {Number} finish upper bound
	 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
	 * @api public
	 */
	is.within = function (value, start, finish) {
	  if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
	    throw new TypeError('NaN is not a valid value');
	  } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
	    throw new TypeError('all arguments must be numbers');
	  }
	  var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
	  return isAnyInfinite || (value >= start && value <= finish);
	};
	
	/**
	 * Test object.
	 */
	
	/**
	 * is.object
	 * Test if `value` is an object.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is an object, false otherwise
	 * @api public
	 */
	is.object = function (value) {
	  return toStr.call(value) === '[object Object]';
	};
	
	/**
	 * is.primitive
	 * Test if `value` is a primitive.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is a primitive, false otherwise
	 * @api public
	 */
	is.primitive = function isPrimitive(value) {
	  if (!value) {
	    return true;
	  }
	  if (typeof value === 'object' || is.object(value) || is.fn(value) || is.array(value)) {
	    return false;
	  }
	  return true;
	};
	
	/**
	 * is.hash
	 * Test if `value` is a hash - a plain object literal.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is a hash, false otherwise
	 * @api public
	 */
	
	is.hash = function (value) {
	  return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
	};
	
	/**
	 * Test regexp.
	 */
	
	/**
	 * is.regexp
	 * Test if `value` is a regular expression.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is a regexp, false otherwise
	 * @api public
	 */
	
	is.regexp = function (value) {
	  return toStr.call(value) === '[object RegExp]';
	};
	
	/**
	 * Test string.
	 */
	
	/**
	 * is.string
	 * Test if `value` is a string.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if 'value' is a string, false otherwise
	 * @api public
	 */
	
	is.string = function (value) {
	  return toStr.call(value) === '[object String]';
	};
	
	/**
	 * Test base64 string.
	 */
	
	/**
	 * is.base64
	 * Test if `value` is a valid base64 encoded string.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if 'value' is a base64 encoded string, false otherwise
	 * @api public
	 */
	
	is.base64 = function (value) {
	  return is.string(value) && (!value.length || base64Regex.test(value));
	};
	
	/**
	 * Test base64 string.
	 */
	
	/**
	 * is.hex
	 * Test if `value` is a valid hex encoded string.
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if 'value' is a hex encoded string, false otherwise
	 * @api public
	 */
	
	is.hex = function (value) {
	  return is.string(value) && (!value.length || hexRegex.test(value));
	};
	
	/**
	 * is.symbol
	 * Test if `value` is an ES6 Symbol
	 *
	 * @param {Mixed} value value to test
	 * @return {Boolean} true if `value` is a Symbol, false otherise
	 * @api public
	 */
	
	is.symbol = function (value) {
	  return typeof Symbol === 'function' && toStr.call(value) === '[object Symbol]' && typeof symbolValueOf.call(value) === 'symbol';
	};
	
	module.exports = is;


/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Utility method to permit Array#reduce-like operations over objects
	 *
	 * This is likely to be slightly more inefficient than using lodash.reduce,
	 * but results in ~50kb less size in the resulting bundled code before
	 * minification and ~12kb of savings with minification.
	 *
	 * Unlike lodash.reduce(), the iterator and initial value properties are NOT
	 * optional: this is done to simplify the code, this module is not intended to
	 * be a full replacement for lodash.reduce and instead prioritizes simplicity
	 * for a specific common case.
	 *
	 * @module util/object-reduce
	 * @private
	 * @param {Object} obj An object of key-value pairs
	 * @param {Function} iterator A function to use to reduce the object
	 * @param {*} initialState The initial value to pass to the reducer function
	 * @returns The result of the reduction operation
	 */
	module.exports = function( obj, iterator, initialState ) {
		return Object.keys( obj ).reduce( function( memo, key ) {
			return iterator( memo, obj[ key ], key );
		}, initialState );
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {
		"/": {
			"namespace": "",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				}
			]
		},
		"/oembed/1.0": {
			"namespace": "oembed/1.0",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"namespace": {},
						"context": {}
					}
				}
			]
		},
		"/oembed/1.0/embed": {
			"namespace": "oembed/1.0",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"url": {},
						"format": {},
						"maxwidth": {}
					}
				}
			]
		},
		"/wp/v2": {
			"namespace": "wp/v2",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"namespace": {},
						"context": {}
					}
				}
			]
		},
		"/wp/v2/posts": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"page": {},
						"per_page": {},
						"search": {},
						"after": {},
						"author": {},
						"author_exclude": {},
						"before": {},
						"exclude": {},
						"include": {},
						"offset": {},
						"order": {},
						"orderby": {},
						"slug": {},
						"status": {},
						"categories": {},
						"categories_exclude": {},
						"tags": {},
						"tags_exclude": {},
						"sticky": {}
					}
				},
				{
					"methods": [
						"POST"
					],
					"args": {
						"date": {},
						"date_gmt": {},
						"slug": {},
						"status": {},
						"password": {},
						"title": {},
						"content": {},
						"author": {},
						"excerpt": {},
						"featured_media": {},
						"comment_status": {},
						"ping_status": {},
						"format": {},
						"meta": {},
						"sticky": {},
						"template": {},
						"categories": {},
						"tags": {}
					}
				}
			]
		},
		"/wp/v2/posts/(?P<id>[\\d]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"password": {}
					}
				},
				{
					"methods": [
						"POST",
						"PUT",
						"PATCH"
					],
					"args": {
						"date": {},
						"date_gmt": {},
						"slug": {},
						"status": {},
						"password": {},
						"title": {},
						"content": {},
						"author": {},
						"excerpt": {},
						"featured_media": {},
						"comment_status": {},
						"ping_status": {},
						"format": {},
						"meta": {},
						"sticky": {},
						"template": {},
						"categories": {},
						"tags": {}
					}
				},
				{
					"methods": [
						"DELETE"
					],
					"args": {
						"force": {}
					}
				}
			]
		},
		"/wp/v2/posts/(?P<parent>[\\d]+)/revisions": {
			"namespace": "wp/v2",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				}
			]
		},
		"/wp/v2/posts/(?P<parent>[\\d]+)/revisions/(?P<id>[\\d]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"DELETE"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				},
				{
					"methods": [
						"DELETE"
					],
					"args": {
						"force": {}
					}
				}
			]
		},
		"/wp/v2/pages": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"page": {},
						"per_page": {},
						"search": {},
						"after": {},
						"author": {},
						"author_exclude": {},
						"before": {},
						"exclude": {},
						"include": {},
						"menu_order": {},
						"offset": {},
						"order": {},
						"orderby": {},
						"parent": {},
						"parent_exclude": {},
						"slug": {},
						"status": {}
					}
				},
				{
					"methods": [
						"POST"
					],
					"args": {
						"date": {},
						"date_gmt": {},
						"slug": {},
						"status": {},
						"password": {},
						"parent": {},
						"title": {},
						"content": {},
						"author": {},
						"excerpt": {},
						"featured_media": {},
						"comment_status": {},
						"ping_status": {},
						"menu_order": {},
						"meta": {},
						"template": {}
					}
				}
			]
		},
		"/wp/v2/pages/(?P<id>[\\d]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"password": {}
					}
				},
				{
					"methods": [
						"POST",
						"PUT",
						"PATCH"
					],
					"args": {
						"date": {},
						"date_gmt": {},
						"slug": {},
						"status": {},
						"password": {},
						"parent": {},
						"title": {},
						"content": {},
						"author": {},
						"excerpt": {},
						"featured_media": {},
						"comment_status": {},
						"ping_status": {},
						"menu_order": {},
						"meta": {},
						"template": {}
					}
				},
				{
					"methods": [
						"DELETE"
					],
					"args": {
						"force": {}
					}
				}
			]
		},
		"/wp/v2/pages/(?P<parent>[\\d]+)/revisions": {
			"namespace": "wp/v2",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				}
			]
		},
		"/wp/v2/pages/(?P<parent>[\\d]+)/revisions/(?P<id>[\\d]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"DELETE"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				},
				{
					"methods": [
						"DELETE"
					],
					"args": {
						"force": {}
					}
				}
			]
		},
		"/wp/v2/media": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"page": {},
						"per_page": {},
						"search": {},
						"after": {},
						"author": {},
						"author_exclude": {},
						"before": {},
						"exclude": {},
						"include": {},
						"offset": {},
						"order": {},
						"orderby": {},
						"parent": {},
						"parent_exclude": {},
						"slug": {},
						"status": {},
						"media_type": {},
						"mime_type": {}
					}
				},
				{
					"methods": [
						"POST"
					],
					"args": {
						"date": {},
						"date_gmt": {},
						"slug": {},
						"status": {},
						"title": {},
						"author": {},
						"comment_status": {},
						"ping_status": {},
						"meta": {},
						"template": {},
						"alt_text": {},
						"caption": {},
						"description": {},
						"post": {}
					}
				}
			]
		},
		"/wp/v2/media/(?P<id>[\\d]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"password": {}
					}
				},
				{
					"methods": [
						"POST",
						"PUT",
						"PATCH"
					],
					"args": {
						"date": {},
						"date_gmt": {},
						"slug": {},
						"status": {},
						"title": {},
						"author": {},
						"comment_status": {},
						"ping_status": {},
						"meta": {},
						"template": {},
						"alt_text": {},
						"caption": {},
						"description": {},
						"post": {}
					}
				},
				{
					"methods": [
						"DELETE"
					],
					"args": {
						"force": {}
					}
				}
			]
		},
		"/wp/v2/types": {
			"namespace": "wp/v2",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				}
			]
		},
		"/wp/v2/types/(?P<type>[\\w-]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				}
			]
		},
		"/wp/v2/statuses": {
			"namespace": "wp/v2",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				}
			]
		},
		"/wp/v2/statuses/(?P<status>[\\w-]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				}
			]
		},
		"/wp/v2/taxonomies": {
			"namespace": "wp/v2",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"type": {}
					}
				}
			]
		},
		"/wp/v2/taxonomies/(?P<taxonomy>[\\w-]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				}
			]
		},
		"/wp/v2/categories": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"page": {},
						"per_page": {},
						"search": {},
						"exclude": {},
						"include": {},
						"order": {},
						"orderby": {},
						"hide_empty": {},
						"parent": {},
						"post": {},
						"slug": {}
					}
				},
				{
					"methods": [
						"POST"
					],
					"args": {
						"description": {},
						"name": {},
						"slug": {},
						"parent": {},
						"meta": {}
					}
				}
			]
		},
		"/wp/v2/categories/(?P<id>[\\d]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				},
				{
					"methods": [
						"POST",
						"PUT",
						"PATCH"
					],
					"args": {
						"description": {},
						"name": {},
						"slug": {},
						"parent": {},
						"meta": {}
					}
				},
				{
					"methods": [
						"DELETE"
					],
					"args": {
						"force": {}
					}
				}
			]
		},
		"/wp/v2/tags": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"page": {},
						"per_page": {},
						"search": {},
						"exclude": {},
						"include": {},
						"offset": {},
						"order": {},
						"orderby": {},
						"hide_empty": {},
						"post": {},
						"slug": {}
					}
				},
				{
					"methods": [
						"POST"
					],
					"args": {
						"description": {},
						"name": {},
						"slug": {},
						"meta": {}
					}
				}
			]
		},
		"/wp/v2/tags/(?P<id>[\\d]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				},
				{
					"methods": [
						"POST",
						"PUT",
						"PATCH"
					],
					"args": {
						"description": {},
						"name": {},
						"slug": {},
						"meta": {}
					}
				},
				{
					"methods": [
						"DELETE"
					],
					"args": {
						"force": {}
					}
				}
			]
		},
		"/wp/v2/users": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"page": {},
						"per_page": {},
						"search": {},
						"exclude": {},
						"include": {},
						"offset": {},
						"order": {},
						"orderby": {},
						"slug": {},
						"roles": {}
					}
				},
				{
					"methods": [
						"POST"
					],
					"args": {
						"username": {},
						"name": {},
						"first_name": {},
						"last_name": {},
						"email": {},
						"url": {},
						"description": {},
						"locale": {},
						"nickname": {},
						"slug": {},
						"roles": {},
						"password": {},
						"meta": {}
					}
				}
			]
		},
		"/wp/v2/users/(?P<id>[\\d]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				},
				{
					"methods": [
						"POST",
						"PUT",
						"PATCH"
					],
					"args": {
						"username": {},
						"name": {},
						"first_name": {},
						"last_name": {},
						"email": {},
						"url": {},
						"description": {},
						"locale": {},
						"nickname": {},
						"slug": {},
						"roles": {},
						"password": {},
						"meta": {}
					}
				},
				{
					"methods": [
						"DELETE"
					],
					"args": {
						"force": {},
						"reassign": {}
					}
				}
			]
		},
		"/wp/v2/users/me": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {}
					}
				},
				{
					"methods": [
						"POST",
						"PUT",
						"PATCH"
					],
					"args": {
						"username": {},
						"name": {},
						"first_name": {},
						"last_name": {},
						"email": {},
						"url": {},
						"description": {},
						"locale": {},
						"nickname": {},
						"slug": {},
						"roles": {},
						"password": {},
						"meta": {}
					}
				},
				{
					"methods": [
						"DELETE"
					],
					"args": {
						"force": {},
						"reassign": {}
					}
				}
			]
		},
		"/wp/v2/comments": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"page": {},
						"per_page": {},
						"search": {},
						"after": {},
						"author": {},
						"author_exclude": {},
						"author_email": {},
						"before": {},
						"exclude": {},
						"include": {},
						"offset": {},
						"order": {},
						"orderby": {},
						"parent": {},
						"parent_exclude": {},
						"post": {},
						"status": {},
						"type": {},
						"password": {}
					}
				},
				{
					"methods": [
						"POST"
					],
					"args": {
						"author": {},
						"author_email": {},
						"author_ip": {},
						"author_name": {},
						"author_url": {},
						"author_user_agent": {},
						"content": {},
						"date": {},
						"date_gmt": {},
						"parent": {},
						"post": {},
						"status": {},
						"meta": {}
					}
				}
			]
		},
		"/wp/v2/comments/(?P<id>[\\d]+)": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {
						"context": {},
						"password": {}
					}
				},
				{
					"methods": [
						"POST",
						"PUT",
						"PATCH"
					],
					"args": {
						"author": {},
						"author_email": {},
						"author_ip": {},
						"author_name": {},
						"author_url": {},
						"author_user_agent": {},
						"content": {},
						"date": {},
						"date_gmt": {},
						"parent": {},
						"post": {},
						"status": {},
						"meta": {}
					}
				},
				{
					"methods": [
						"DELETE"
					],
					"args": {
						"force": {},
						"password": {}
					}
				}
			]
		},
		"/wp/v2/settings": {
			"namespace": "wp/v2",
			"methods": [
				"GET",
				"POST",
				"PUT",
				"PATCH"
			],
			"endpoints": [
				{
					"methods": [
						"GET"
					],
					"args": {}
				},
				{
					"methods": [
						"POST",
						"PUT",
						"PATCH"
					],
					"args": {
						"title": {},
						"description": {},
						"url": {},
						"email": {},
						"timezone": {},
						"date_format": {},
						"time_format": {},
						"start_of_week": {},
						"language": {},
						"use_smilies": {},
						"default_category": {},
						"default_post_format": {},
						"posts_per_page": {},
						"default_ping_status": {},
						"default_comment_status": {}
					}
				}
			]
		}
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module route-tree
	 */
	'use strict';
	
	var namedGroupRE = __webpack_require__( 7 ).namedGroupRE;
	var splitPath = __webpack_require__( 8 );
	var ensure = __webpack_require__( 9 );
	var objectReduce = __webpack_require__( 4 );
	
	/**
	 * Method to use when reducing route components array.
	 *
	 * @private
	 * @param {object} routeObj     A route definition object (set via .bind partial application)
	 * @param {object} topLevel     The top-level route tree object for this set of routes (set
	 *                              via .bind partial application)
	 * @param {object} parentLevel  The memo object, which is mutated as the reducer adds
	 *                              a new level handler for each level in the route
	 * @param {string} component    The string defining this route component
	 * @param {number} idx          The index of this component within the components array
	 * @param {string[]} components The array of all components
	 * @returns {object} The child object of the level being reduced
	 */
	function reduceRouteComponents( routeObj, topLevel, parentLevel, component, idx, components ) {
		// Check to see if this component is a dynamic URL segment (i.e. defined by
		// a named capture group regular expression). namedGroup will be `null` if
		// the regexp does not match, or else an array defining the RegExp match, e.g.
		// [
		//   'P<id>[\\d]+)',
		//   'id', // Name of the group
		//   '[\\d]+', // regular expression for this URL segment's contents
		//   index: 15,
		//   input: '/wp/v2/posts/(?P<id>[\\d]+)'
		// ]
		var namedGroup = component.match( namedGroupRE );
		// Pull out references to the relevant indices of the match, for utility:
		// `null` checking is necessary in case the component did not match the RE,
		// hence the `namedGroup &&`.
		var groupName = namedGroup && namedGroup[ 1 ];
		var groupPattern = namedGroup && namedGroup[ 2 ];
	
		// When branching based on a dynamic capture group we used the group's RE
		// pattern as the unique identifier: this is done because the same group
		// could be assigned different names in different endpoint handlers, e.g.
		// "id" for posts/:id vs "parent_id" for posts/:parent_id/revisions.
		//
		// There is an edge case where groupPattern will be "" if we are registering
		// a custom route via `.registerRoute` that does not include parameter
		// validation. In this case we assume the groupName is sufficiently unique,
		// and fall back to `|| groupName` for the levelKey string.
		var levelKey = namedGroup ? ( groupPattern || groupName ) : component;
	
		// Level name on the other hand takes its value from the group's name, if
		// defined, and falls back to the component string to handle situations where
		// `component` is a collection (e.g. "revisions")
		var levelName = namedGroup ? groupName : component;
	
		// Check whether we have a preexisting node at this level of the tree, and
		// create a new level object if not. The component string is included so that
		// validators can throw meaningful errors as appropriate.
		var currentLevel = parentLevel[ levelKey ] || {
			component: component,
			namedGroup: namedGroup ? true : false,
			level: idx,
			names: []
		};
	
		// A level's "names" correspond to the list of strings which could describe
		// an endpoint's component setter functions: "id", "revisions", etc.
		if ( currentLevel.names.indexOf( levelName ) < 0 ) {
			currentLevel.names.push( levelName );
		}
	
		// A level's validate method is called to check whether a value being set
		// on the request URL is of the proper type for the location in which it
		// is specified. If a group pattern was found, the validator checks whether
		// the input string exactly matches the group pattern.
		var groupPatternRE = groupPattern === '' ?
			// If groupPattern is an empty string, accept any input without validation
			/.*/ :
			// Otherwise, validate against the group pattern or the component string
			new RegExp( groupPattern ? '^' + groupPattern + '$' : component, 'i' );
	
		// Only one validate function is maintained for each node, because each node
		// is defined either by a string literal or by a specific regular expression.
		currentLevel.validate = function( input ) {
			return groupPatternRE.test( input );
		};
	
		// Check to see whether to expect more nodes within this branch of the tree,
		if ( components[ idx + 1 ] ) {
			// and create a "children" object to hold those nodes if necessary
			currentLevel.children = currentLevel.children || {};
		} else {
			// At leaf nodes, specify the method capabilities of this endpoint
			currentLevel.methods = ( routeObj.methods || [] ).map(function( str ) {
				return str.toLowerCase();
			});
			// Ensure HEAD is included whenever GET is supported: the API automatically
			// adds support for HEAD if you have GET
			if ( currentLevel.methods.indexOf( 'get' ) > -1 && currentLevel.methods.indexOf( 'head' ) === -1 ) {
				currentLevel.methods.push( 'head' );
			}
	
			// At leaf nodes also flag (at the top level) what arguments are
			// available to GET requests, so that we may automatically apply the
			// appropriate parameter mixins
			if ( routeObj.endpoints ) {
				topLevel._getArgs = topLevel._getArgs || {};
				routeObj.endpoints.forEach(function( endpoint ) {
					// `endpoint.methods` will be an array of methods like `[ 'GET' ]`: we
					// only care about GET for this exercise. Validating POST and PUT args
					// could be useful but is currently deemed to be out-of-scope.
					endpoint.methods.forEach(function( method ) {
						if ( method.toLowerCase() === 'get' ) {
							Object.keys( endpoint.args ).forEach(function( argKey ) {
								// Reference param definition objects in the top _getArgs dictionary
								topLevel._getArgs[ argKey ] = endpoint.args[ argKey ];
							});
						}
					});
				});
			}
		}
	
		// Return the child node object as the new "level"
		parentLevel[ levelKey ] = currentLevel;
		return currentLevel.children;
	}
	
	/**
	 *
	 * @private
	 * @param {object}   namespaces The memo object that becomes a dictionary mapping API
	 *                              namespaces to an object of the namespace's routes
	 * @param {object}   routeObj   A route definition object
	 * @param {string}   route      The string key of the `routeObj` route object
	 * @returns {object} The namespaces dictionary memo object
	 */
	function reduceRouteTree( namespaces, routeObj, route ) {
		var nsForRoute = routeObj.namespace;
	
		// Strip the namespace from the route string (all routes should have the
		// format `/namespace/other/stuff`) @TODO: Validate this assumption
		// Also strip any trailing "/?": the slash is already optional and a single
		// question mark would break the regex parser
		var routeString = route.replace( '/' + nsForRoute + '/', '' ).replace( /\/\?$/, '' );
	
		// Split the routes up into hierarchical route components
		var routeComponents = splitPath( routeString );
	
		// Do not make a namespace group for the API root
		// Do not add the namespace root to its own group
		// Do not take any action if routeString is empty
		if ( ! nsForRoute || '/' + nsForRoute === route || ! routeString ) {
			return namespaces;
		}
	
		// Ensure that the namespace object for this namespace exists
		ensure( namespaces, nsForRoute, {} );
	
		// Get a local reference to namespace object
		var ns = namespaces[ nsForRoute ];
	
		// The first element of the route tells us what type of resource this route
		// is for, e.g. "posts" or "comments": we build one handler per resource
		// type, so we group like resource paths together.
		var resource = routeComponents[0];
	
		// @TODO: This code above currently precludes baseless routes, e.g.
		// myplugin/v2/(?P<resource>\w+) -- should those be supported?
	
		// Create an array to represent this resource, and ensure it is assigned
		// to the namespace object. The array will structure the "levels" (path
		// components and subresource types) of this resource's endpoint handler.
		ensure( ns, resource, {} );
		var levels = ns[ resource ];
	
		// Recurse through the route components, mutating levels with information about
		// each child node encountered while walking through the routes tree and what
		// arguments (parameters) are available for GET requests to this endpoint.
		routeComponents.reduce( reduceRouteComponents.bind( null, routeObj, levels ), levels );
	
		return namespaces;
	}
	
	/**
	 * Build a route tree by reducing over a routes definition object from the API
	 * root endpoint response object
	 *
	 * @method build
	 * @param {object} routes A dictionary of routes keyed by route regex strings
	 * @returns {object} A dictionary, keyed by namespace, of resource handler
	 * factory methods for each namespace's resources
	 */
	function buildRouteTree( routes ) {
		return objectReduce( routes, reduceRouteTree, {} );
	}
	
	module.exports = {
		build: buildRouteTree
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * @module util/named-group-regexp
	 */
	'use strict';
	
	var pattern = [
		// Capture group start
		'\\(\\?',
		// Capture group name begins either `P<`, `<` or `'`
		'(?:P<|<|\')',
		// Everything up to the next `>`` or `'` (depending) will be the capture group name
		'([^>\']+)',
		// Capture group end
		'[>\']',
		// Get everything up to the end of the capture group: this is the RegExp used
		// when matching URLs to this route, which we can use for validation purposes.
		'([^\\)]*)',
		// Capture group end
		'\\)'
	].join( '' );
	
	var namedGroupRE = new RegExp( pattern );
	
	module.exports = {
		/**
		 * String representation of the exported Regular Expression; we construct this
		 * RegExp from a string to enable more detailed annotation and permutation
		 *
		 * @prop {String} pattern
		 */
		pattern: pattern,
	
		/**
		 * Regular Expression to identify a capture group in PCRE formats
		 * `(?<name>regex)`, `(?'name'regex)` or `(?P<name>regex)` (see
		 * regular-expressions.info/refext.html)
		 *
		 * @prop {RegExp} namedGroupRE
		 */
		namedGroupRE: namedGroupRE
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module util/split-path
	 */
	'use strict';
	
	var namedGroupPattern = __webpack_require__( 7 ).pattern;
	
	// Convert capture groups to non-matching groups, because all capture groups
	// are included in the resulting array when an RE is passed to `.split()`
	// (We re-use the existing named group's capture pattern instead of creating
	// a new RegExp just for this purpose)
	var patternWithoutSubgroups = namedGroupPattern
		.replace( /([^\\])\(([^?])/g, '$1(?:$2' );
	
	// Make a new RegExp using the same pattern as one single unified capture group,
	// so the match as a whole will be preserved after `.split()`. Permit non-slash
	// characters before or after the named capture group, although those components
	// will not yield functioning setters.
	var namedGroupRE = new RegExp( '([^/]*' + patternWithoutSubgroups + '[^/]*)' );
	
	/**
	 * Divide a route string up into hierarchical components by breaking it apart
	 * on forward slash characters.
	 *
	 * There are plugins (including Jetpack) that register routes with regex capture
	 * groups which also contain forward slashes, so those groups have to be pulled
	 * out first before the remainder of the string can be .split() as normal.
	 *
	 * @param {String} pathStr A route path string to break into components
	 * @returns {String[]} An array of route component strings
	 */
	module.exports = function( pathStr ) {
		// Divide a string like "/some/path/(?P<with_named_groups>)/etc" into an
		// array `[ "/some/path/", "(?P<with_named_groups>)", "/etc" ]`.
		// Then, reduce through the array of parts, splitting any non-capture-group
		// parts on forward slashes and discarding empty strings to create the final
		// array of path components.
		return pathStr.split( namedGroupRE ).reduce(function( components, part ) {
			if ( ! part ) {
				// Ignore empty strings parts
				return components;
			}
	
			if ( namedGroupRE.test( part ) ) {
				// Include named capture groups as-is
				return components.concat( part );
			}
	
			// Split the part on / and filter out empty strings
			return components.concat( part.split( '/' ).filter( Boolean ) );
		}, [] );
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Ensure that a property is present in an object, initializing it to a default
	 * value if it is not already defined. Modifies the provided object by reference.
	 *
	 * @module util/ensure
	 * @param {object} obj              The object in which to ensure a property exists
	 * @param {string} prop             The property key to ensure
	 * @param {}       propDefaultValue The default value for the property
	 * @returns {void}
	 */
	module.exports = function( obj, prop, propDefaultValue ) {
		if ( obj && obj[ prop ] === undefined ) {
			obj[ prop ] = propDefaultValue;
		}
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Take a WP route string (with PCRE named capture groups), `such as /author/(?P<id>\d+)`,
	 * and generate request handler factory methods for each represented endpoint.
	 *
	 * @module endpoint-factories
	 */
	'use strict';
	
	var extend = __webpack_require__( 1 );
	var createResourceHandlerSpec = __webpack_require__( 11 ).create;
	var createEndpointRequest = __webpack_require__( 13 ).create;
	var objectReduce = __webpack_require__( 4 );
	
	/**
	 * Given an array of route definitions and a specific namespace for those routes,
	 * recurse through the node tree representing all possible routes within the
	 * provided namespace to define path value setters (and corresponding property
	 * validators) for all possible variants of each resource's API endpoints.
	 *
	 * @method generate
	 * @param {string} namespace         The namespace string for these routes
	 * @param {object} routesByNamespace A dictionary of namespace - route definition
	 *                                   object pairs as generated from buildRouteTree,
	 *                                   where each route definition object is a dictionary
	 *                                   keyed by route definition strings
	 * @returns {object} A dictionary of endpoint request handler factories
	 */
	function generateEndpointFactories( routesByNamespace ) {
	
		return objectReduce( routesByNamespace, function( namespaces, routeDefinitions, namespace ) {
	
			// Create
			namespaces[ namespace ] = objectReduce( routeDefinitions, function( handlers, routeDef, resource ) {
	
				var handlerSpec = createResourceHandlerSpec( routeDef, resource );
	
				var EndpointRequest = createEndpointRequest( handlerSpec, resource, namespace );
	
				// "handler" object is now fully prepared; create the factory method that
				// will instantiate and return a handler instance
				handlers[ resource ] = function( options ) {
					return new EndpointRequest( extend( {}, this._options, options ) );
				};
	
				// Expose the constructor as a property on the factory function, so that
				// auto-generated endpoint request constructors may be further customized
				// when needed
				handlers[ resource ].Ctor = EndpointRequest;
	
				return handlers;
			}, {} );
	
			return namespaces;
		}, {} );
	}
	
	module.exports = {
		generate: generateEndpointFactories
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module resource-handler-spec
	 */
	'use strict';
	
	var createPathPartSetter = __webpack_require__( 12 ).create;
	
	/** @private */
	function addLevelOption( levelsObj, level, obj ) {
		levelsObj[ level ] = levelsObj[ level ] || [];
		levelsObj[ level ].push( obj );
	}
	
	/**
	 * Assign a setter function for the provided node to the provided route
	 * handler object setters dictionary (mutates handler by reference).
	 *
	 * @private
	 * @param {Object} handler A route handler definition object
	 * @param {Object} node    A route hierarchy level node object
	 */
	function assignSetterFnForNode( handler, node ) {
		var setterFn;
	
		// For each node, add its handler to the relevant "level" representation
		addLevelOption( handler._levels, node.level, {
			component: node.component,
			validate: node.validate,
			methods: node.methods
		});
	
		// First level is set implicitly, no dedicated setter needed
		if ( node.level > 0 ) {
	
			setterFn = createPathPartSetter( node );
	
			node.names.forEach(function( name ) {
				// Convert from snake_case to camelCase
				var setterFnName = name
					.replace( /[_-]+\w/g, function( match ) {
						return match.replace( /[_-]+/, '' ).toUpperCase();
					});
	
				// Don't overwrite previously-set methods
				if ( ! handler._setters[ setterFnName ] ) {
					handler._setters[ setterFnName ] = setterFn;
				}
			});
		}
	}
	
	/**
	 * Walk the tree of a specific resource node to create the setter methods
	 *
	 * The API we want to produce from the node tree looks like this:
	 *
	 *     wp.posts();                        /wp/v2/posts
	 *     wp.posts().id( 7 );                /wp/v2/posts/7
	 *     wp.posts().id( 7 ).revisions();    /wp/v2/posts/7/revisions
	 *     wp.posts().id( 7 ).revisions( 8 ); /wp/v2/posts/7/revisions/8
	 *
	 * ^ That last one's the tricky one: we can deduce that this parameter is "id", but
	 * that param will already be taken by the post ID, so sub-collections have to be
	 * set up as `.revisions()` to get the collection, and `.revisions( id )` to get a
	 * specific resource.
	 *
	 * @private
	 * @param  {Object} node            A node object
	 * @param  {Object} [node.children] An object of child nodes
	 * // @returns {isLeaf} A boolean indicating whether the processed node is a leaf
	 */
	function extractSetterFromNode( handler, node ) {
	
		assignSetterFnForNode( handler, node );
	
		if ( node.children ) {
			// Recurse down to this node's children
			Object.keys( node.children ).forEach(function( key ) {
				extractSetterFromNode( handler, node.children[ key ] );
			});
		}
	}
	
	/**
	 * Create a node handler specification object from a route definition object
	 *
	 * @name create
	 * @param {object} routeDefinition A route definition object
	 * @param {string} resource The string key of the resource for which to create a handler
	 * @returns {object} A handler spec object with _path, _levels and _setters properties
	 */
	function createNodeHandlerSpec( routeDefinition, resource ) {
	
		var handler = {
			// A "path" is an ordered (by key) set of values composed into the final URL
			_path: {
				'0': resource
			},
	
			// A "level" is a level-keyed object representing the valid options for
			// one level of the resource URL
			_levels: {},
	
			// Objects that hold methods and properties which will be copied to
			// instances of this endpoint's handler
			_setters: {},
	
			// Arguments (query parameters) that may be set in GET requests to endpoints
			// nested within this resource route tree, used to determine the mixins to
			// add to the request handler
			_getArgs: routeDefinition._getArgs
		};
	
		// Walk the tree
		Object.keys( routeDefinition ).forEach(function( routeDefProp ) {
			if ( routeDefProp !== '_getArgs' ) {
				extractSetterFromNode( handler, routeDefinition[ routeDefProp ] );
			}
		});
	
		return handler;
	}
	
	module.exports = {
		create: createNodeHandlerSpec
	};


/***/ },
/* 12 */
/***/ function(module, exports) {

	/**
	 * @module path-part-setter
	 */
	'use strict';
	
	/**
	 * Return a function to set part of the request URL path.
	 *
	 * Path part setter methods may be either dynamic (*i.e.* may represent a
	 * "named group") or non-dynamic (representing a static part of the URL, which
	 * is usually a collection endpoint of some sort). Which type of function is
	 * returned depends on whether a given route has one or many sub-resources.
	 *
	 * @alias module:lib/path-part-setter.create
	 * @param {Object} node An object representing a level of an endpoint path hierarchy
	 * @returns {Function} A path part setter function
	 */
	function createPathPartSetter( node ) {
		// Local references to `node` properties used by returned functions
		var nodeLevel = node.level;
		var nodeName = node.names[ 0 ];
		var supportedMethods = node.methods || [];
		var dynamicChildren = node.children ? Object.keys( node.children )
			.map(function( key ) {
				return node.children[ key ];
			})
			.filter(function( childNode ) {
				return childNode.namedGroup === true;
			}) : [];
		var dynamicChild = dynamicChildren.length === 1 && dynamicChildren[ 0 ];
		var dynamicChildLevel = dynamicChild && dynamicChild.level;
	
		if ( node.namedGroup ) {
			/**
			 * Set a dymanic (named-group) path part of a query URL.
			 *
			 * @example
			 *
			 *     // id() is a dynamic path part setter:
			 *     wp.posts().id( 7 ); // Get posts/7
			 *
			 * @chainable
			 * @param  {String|Number} val The path part value to set
			 * @returns {Object} The handler instance (for chaining)
			 */
			return function( val ) {
				/* jshint validthis:true */
				this.setPathPart( nodeLevel, val );
				if ( supportedMethods.length ) {
					this._supportedMethods = supportedMethods;
				}
				return this;
			};
		} else {
			/**
			 * Set a non-dymanic (non-named-group) path part of a query URL, and
			 * set the value of a subresource if an input value is provided and
			 * exactly one named-group child node exists.
			 *
			 * @example
			 *
			 *     // revisions() is a non-dynamic path part setter:
			 *     wp.posts().id( 4 ).revisions();       // Get posts/4/revisions
			 *     wp.posts().id( 4 ).revisions( 1372 ); // Get posts/4/revisions/1372
			 *
			 * @chainable
			 * @param  {String|Number} [val] The path part value to set (if provided)
			 *                               for a subresource within this resource
			 * @returns {Object} The handler instance (for chaining)
			 */
			return function( val ) {
				/* jshint validthis:true */
				// If the path part is not a namedGroup, it should have exactly one
				// entry in the names array: use that as the value for this setter,
				// as it will usually correspond to a collection endpoint.
				this.setPathPart( nodeLevel, nodeName );
	
				// If this node has exactly one dynamic child, this method may act as
				// a setter for that child node. `dynamicChildLevel` will be falsy if the
				// node does not have a child or has multiple children.
				if ( val !== undefined && dynamicChildLevel ) {
					this.setPathPart( dynamicChildLevel, val );
				}
				return this;
			};
		}
	}
	
	module.exports = {
		create: createPathPartSetter
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module endpoint-request
	 */
	'use strict';
	
	var inherit = __webpack_require__( 14 ).inherits;
	var WPRequest = __webpack_require__( 18 );
	var mixins = __webpack_require__( 28 );
	
	var applyMixin = __webpack_require__( 32 );
	
	/**
	 * Create an endpoint request handler constructor for a specific resource tree
	 *
	 * @method create
	 * @param {Object} handlerSpec A resource handler specification object
	 * @param {String} resource    The root resource of requests created from the returned factory
	 * @param {String} namespace   The namespace string for the returned factory's handlers
	 * @returns {Function} A constructor inheriting from {@link WPRequest}
	 */
	function createEndpointRequest( handlerSpec, resource, namespace ) {
	
		// Create the constructor function for this endpoint
		function EndpointRequest( options ) {
			WPRequest.call( this, options );
	
			/**
			 * Semi-private instance property specifying the available URL path options
			 * for this endpoint request handler, keyed by ascending whole numbers.
			 *
			 * @property _levels
			 * @type {object}
			 * @private
			 */
			this._levels = handlerSpec._levels;
	
			// Configure handler for this endpoint's root URL path & set namespace
			this
				.setPathPart( 0, resource )
				.namespace( namespace );
		}
	
		inherit( EndpointRequest, WPRequest );
	
		// Mix in all available shortcut methods for GET request query parameters that
		// are valid within this endpoint tree
		if ( typeof handlerSpec._getArgs === 'object' ) {
			Object.keys( handlerSpec._getArgs ).forEach(function( supportedQueryParam ) {
				var mixinsForParam = mixins[ supportedQueryParam ];
	
				// Only proceed if there is a mixin available AND the specified mixins will
				// not overwrite any previously-set prototype method
				if ( typeof mixinsForParam === 'object' ) {
					Object.keys( mixinsForParam ).forEach(function( methodName ) {
						applyMixin( EndpointRequest.prototype, methodName, mixinsForParam[ methodName ] );
					});
				}
			});
		}
	
		Object.keys( handlerSpec._setters ).forEach(function( setterFnName ) {
			// Only assign setter functions if they do not overwrite preexisting methods
			if ( ! EndpointRequest.prototype[ setterFnName ] ) {
				EndpointRequest.prototype[ setterFnName ] = handlerSpec._setters[ setterFnName ];
			}
		});
	
		return EndpointRequest;
	}
	
	module.exports = {
		create: createEndpointRequest
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }
	
	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};
	
	
	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }
	
	  if (process.noDeprecation === true) {
	    return fn;
	  }
	
	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }
	
	  return deprecated;
	};
	
	
	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};
	
	
	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;
	
	
	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};
	
	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};
	
	
	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];
	
	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}
	
	
	function stylizeNoColor(str, styleType) {
	  return str;
	}
	
	
	function arrayToHash(array) {
	  var hash = {};
	
	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });
	
	  return hash;
	}
	
	
	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }
	
	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }
	
	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);
	
	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }
	
	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }
	
	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }
	
	  var base = '', array = false, braces = ['{', '}'];
	
	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }
	
	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }
	
	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }
	
	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }
	
	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }
	
	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }
	
	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }
	
	  ctx.seen.push(value);
	
	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }
	
	  ctx.seen.pop();
	
	  return reduceToSingleString(output, base, braces);
	}
	
	
	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}
	
	
	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}
	
	
	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}
	
	
	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }
	
	  return name + ': ' + str;
	}
	
	
	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);
	
	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }
	
	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}
	
	
	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;
	
	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;
	
	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;
	
	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;
	
	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;
	
	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;
	
	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;
	
	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;
	
	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;
	
	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;
	
	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;
	
	exports.isBuffer = __webpack_require__(16);
	
	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}
	
	
	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}
	
	
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];
	
	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}
	
	
	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};
	
	
	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(17);
	
	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;
	
	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};
	
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(15)))

/***/ },
/* 15 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 17 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var qs = __webpack_require__( 19 );
	var _unique = __webpack_require__( 24 );
	var extend = __webpack_require__( 1 );
	
	var alphaNumericSort = __webpack_require__( 25 );
	var keyValToObj = __webpack_require__( 26 );
	var paramSetter = __webpack_require__( 27 );
	var objectReduce = __webpack_require__( 4 );
	
	/**
	 * WPRequest is the base API request object constructor
	 *
	 * @constructor WPRequest
	 * @param {Object} options A hash of options for the WPRequest instance
	 * @param {String} options.endpoint The endpoint URI for the invoking WPAPI instance
	 * @param {Object} options.transport An object of http transport methods (get, post, etc)
	 * @param {String} [options.username] A username for authenticating API requests
	 * @param {String} [options.password] A password for authenticating API requests
	 * @param {String} [options.nonce] A WP nonce for use with cookie authentication
	 */
	function WPRequest( options ) {
		/**
		 * Configuration options for the request
		 *
		 * @property _options
		 * @type Object
		 * @private
		 * @default {}
		 */
		this._options = [
			// Whitelisted options keys
			'auth',
			'endpoint',
			'headers',
			'username',
			'password',
			'nonce'
		].reduce(function( localOptions, key ) {
			if ( options && options[ key ] ) {
				localOptions[ key ] = options[ key ];
			}
			return localOptions;
		}, {});
	
		/**
		 * The HTTP transport methods (.get, .post, .put, .delete, .head) to use for this request
		 *
		 * @property transport
		 * @type {Object}
		 * @private
		 */
		this.transport = options && options.transport;
	
		/**
		 * A hash of query parameters
		 * This is used to store the values for supported query parameters like ?_embed
		 *
		 * @property _params
		 * @type Object
		 * @private
		 * @default {}
		 */
		this._params = {};
	
		/**
		 * Methods supported by this API request instance:
		 * Individual endpoint handlers specify their own subset of supported methods
		 *
		 * @property _supportedMethods
		 * @type Array
		 * @private
		 * @default [ 'head', 'get', 'put', 'post', 'delete' ]
		 */
		this._supportedMethods = [ 'head', 'get', 'put', 'post', 'delete' ];
	
		/**
		 * A hash of values to assemble into the API request path
		 * (This will be overwritten by each specific endpoint handler constructor)
		 *
		 * @property _path
		 * @type Object
		 * @private
		 * @default {}
		 */
		this._path = {};
	}
	
	// Private helper methods
	// ======================
	
	/**
	 * Identity function for use within invokeAndPromisify()
	 * @private
	 */
	function identity( value ) {
		return value;
	}
	
	/**
	 * Process arrays of taxonomy terms into query parameters.
	 * All terms listed in the arrays will be required (AND behavior).
	 *
	 * This method will not be called with any values unless we are handling
	 * an endpoint with the filter mixin; however, since parameter handling
	 * (and therefore `_renderQuery()`) are part of WPRequest itself, this
	 * helper method lives here alongside the code where it is used.
	 *
	 * @example
	 *     prepareTaxonomies({
	 *         tag: [ 'tag1 ', 'tag2' ], // by term slug
	 *         cat: [ 7 ] // by term ID
	 *     }) === {
	 *         tag: 'tag1+tag2',
	 *         cat: '7'
	 *     }
	 *
	 * @private
	 * @param {Object} taxonomyFilters An object of taxonomy term arrays, keyed by taxonomy name
	 * @returns {Object} An object of prepareFilters-ready query arg and query param value pairs
	 */
	function prepareTaxonomies( taxonomyFilters ) {
		if ( ! taxonomyFilters ) {
			return {};
		}
	
		return objectReduce( taxonomyFilters, function( result, terms, key ) {
			// Trim whitespace and concatenate multiple terms with +
			result[ key ] = terms.map(function( term ) {
				// Coerce term into a string so that trim() won't fail
				return ( term + '' ).trim().toLowerCase();
			}).join( '+' );
	
			return result;
		}, {});
	}
	
	/**
	 * Return an object with any properties with undefined, null or empty string
	 * values removed.
	 *
	 * @example
	 *
	 *     populated({
	 *       a: 'a',
	 *       b: '',
	 *       c: null
	 *     }); // { a: 'a' }
	 *
	 * @private
	 * @param {Object} obj An object of key/value pairs
	 * @returns {Object} That object with all empty values removed
	 */
	function populated( obj ) {
		if ( ! obj ) {
			return obj;
		}
		return objectReduce( obj, function( values, val, key ) {
			if ( val !== undefined && val !== null && val !== '' ) {
				values[ key ] = val;
			}
			return values;
		}, {});
	}
	
	/**
	 * Assert whether a provided URL component is "valid" by checking it against
	 * an array of registered path component validator methods for that level of
	 * the URL path.
	 *
	 * @private
	 * @param {object[]} levelDefinitions An array of Level Definition objects
	 * @param {string}   levelContents    The URL path string that has been specified
	 *                                    for use on the provided level
	 * @returns {boolean} Whether the provided input matches any of the provided
	 * level validation functions
	 */
	function validatePathLevel( levelDefinitions, levelContents ) {
		// One "level" may have multiple options, as a route tree is a branching
		// structure. We consider a level "valid" if the provided levelContents
		// match any of the available validators.
		var valid = levelDefinitions.reduce(function( anyOptionValid, levelOption ) {
			if ( ! levelOption.validate ) {
				// If there is no validator function, the level is implicitly valid
				return true;
			}
			return anyOptionValid || levelOption.validate( levelContents );
		}, false );
	
		if ( ! valid ) {
			throw new Error([
				'Invalid path component:',
				levelContents,
				// awkward pluralization support:
				'does not match' + ( levelDefinitions.length > 1 ? ' any of' : '' ),
				levelDefinitions.reduce(function( components, levelOption ) {
					return components.concat( levelOption.component );
				}, [] ).join( ', ' )
			].join( ' ' ) );
		}
	}
	
	// (Semi-)Private Prototype Methods
	// ================================
	
	/**
	 * Process the endpoint query's filter objects into a valid query string.
	 * Nested objects and Array properties are rendered with indexed array syntax.
	 *
	 * @example
	 *     _renderQuery({ p1: 'val1', p2: 'val2' });  // ?p1=val1&p2=val2
	 *     _renderQuery({ obj: { prop: 'val' } });    // ?obj[prop]=val
	 *     _renderQuery({ arr: [ 'val1', 'val2' ] }); // ?arr[0]=val1&arr[1]=val2
	 *
	 * @private
	 *
	 * @method _renderQuery
	 * @returns {String} A query string representing the specified filter parameters
	 */
	WPRequest.prototype._renderQuery = function() {
		// Build the full query parameters object
		var queryParams = extend( {}, populated( this._params ) );
	
		// Prepare any taxonomies and merge with other filter values
		var taxonomies = prepareTaxonomies( this._taxonomyFilters );
		queryParams.filter = extend( {}, populated( this._filters ), taxonomies );
	
		// Parse query parameters object into a query string, sorting the object
		// properties by alphabetical order (consistent property ordering can make
		// for easier caching of request URIs)
		var queryString = qs.stringify( queryParams, { arrayFormat: 'brackets' } )
			.split( '&' )
			.sort()
			.join( '&' );
	
		// Check if the endpoint contains a previous query and set the query character accordingly.
		var queryCharacter = /\?/.test( this._options.endpoint ) ? '&' : '?';
	
		// Prepend a "?" (or a "&") if a query is present, and return.
		return ( queryString === '' ) ? '' : queryCharacter + queryString;
	};
	
	/**
	 * Validate & assemble a path string from the request object's _path
	 *
	 * @private
	 * @returns {String} The rendered path
	 */
	WPRequest.prototype._renderPath = function() {
		// Call validatePath: if the provided path components are not well-formed,
		// an error will be thrown
		this.validatePath();
	
		var pathParts = this._path;
		var orderedPathParts = Object.keys( pathParts )
			.sort(function( a, b ) {
				var intA = parseInt( a, 10 );
				var intB = parseInt( b, 10 );
				return intA - intB;
			})
			.map(function( pathPartKey ) {
				return pathParts[ pathPartKey ];
			});
	
		// Combine all parts of the path together, filtered to omit any components
		// that are unspecified or empty strings, to create the full path template
		var path = [
			this._namespace
		].concat( orderedPathParts ).filter( identity ).join( '/' );
	
		return path;
	};
	
	// Public Prototype Methods
	// ========================
	
	/**
	 * Parse the request into a WordPress API request URI string
	 *
	 * @method
	 * @returns {String} The URI for the HTTP request to be sent
	 */
	WPRequest.prototype.toString = function() {
		// Render the path to a string
		var path = this._renderPath();
	
		// Render the query string
		var queryStr = this._renderQuery();
	
		return this._options.endpoint + path + queryStr;
	};
	
	/**
	 * Set a component of the resource URL itself (as opposed to a query parameter)
	 *
	 * If a path component has already been set at this level, throw an error:
	 * requests are meant to be transient, so any re-writing of a previously-set
	 * path part value is likely to be a mistake.
	 *
	 * @method
	 * @chainable
	 * @param {Number|String} level A "level" of the path to set, e.g. "1" or "2"
	 * @param {Number|String} val   The value to set at that path part level
	 * @returns {WPRequest} The WPRequest instance (for chaining)
	 */
	WPRequest.prototype.setPathPart = function( level, val ) {
		if ( this._path[ level ] ) {
			throw new Error( 'Cannot overwrite value ' + this._path[ level ] );
		}
		this._path[ level ] = val;
	
		return this;
	};
	
	/**
	 * Validate whether the specified path parts are valid for this endpoint
	 *
	 * "Path parts" are non-query-string URL segments, like "some" "path" in the URL
	 * `mydomain.com/some/path?and=a&query=string&too`. Because a well-formed path
	 * is necessary to execute a successful API request, we throw an error if the
	 * user has omitted a value (such as `/some/[missing component]/url`) or has
	 * provided a path part value that does not match the regular expression the
	 * API uses to goven that segment.
	 *
	 * @method
	 * @chainable
	 * @returns {WPRequest} The WPRequest instance (for chaining), if no errors were found
	 */
	WPRequest.prototype.validatePath = function() {
		// Iterate through all _specified_ levels of this endpoint
		var specifiedLevels = Object.keys( this._path )
			.map(function( level ) {
				return parseInt( level, 10 );
			})
			.filter(function( pathPartKey ) {
				return ! isNaN( pathPartKey );
			});
	
		var maxLevel = Math.max.apply( null, specifiedLevels );
	
		// Ensure that all necessary levels are specified
		var path = [];
		var valid = true;
	
		for ( var level = 0; level <= maxLevel; level++ ) {
	
			if ( ! this._levels || ! this._levels[ level ] ) {
				continue;
			}
	
			if ( this._path[ level ] ) {
				// Validate the provided path level against all available path validators
				validatePathLevel( this._levels[ level ], this._path[ level ] );
	
				// Add the path value to the array
				path.push( this._path[ level ] );
			} else {
				path.push( ' ??? ' );
				valid = false;
			}
		}
	
		if ( ! valid ) {
			throw new Error( 'Incomplete URL! Missing component: /' + path.join( '/' ) );
		}
	
		return this;
	};
	
	/**
	 * Set a parameter to render into the final query URI.
	 *
	 * @method
	 * @chainable
	 * @param {String|Object} props The name of the parameter to set, or an object containing
	 *                              parameter keys and their corresponding values
	 * @param {String|Number|Array} [value] The value of the parameter being set
	 * @returns {WPRequest} The WPRequest instance (for chaining)
	 */
	WPRequest.prototype.param = function( props, value ) {
		if ( ! props || typeof props === 'string' && value === undefined ) {
			// We have no property to set, or no value to set for that property
			return this;
		}
	
		// We can use the same iterator function below to handle explicit key-value
		// pairs if we convert them into to an object we can iterate over:
		if ( typeof props === 'string' ) {
			props = keyValToObj( props, value );
		}
	
		// Iterate through the properties
		Object.keys( props ).forEach(function( key ) {
			var value = props[ key ];
	
			// Arrays should be de-duped and sorted
			if ( Array.isArray( value ) ) {
				value = _unique( value ).sort( alphaNumericSort );
			}
	
			// Set the value
			this._params[ key ] = value;
		}.bind( this ));
	
		return this;
	};
	
	// Globally-applicable parameters that impact the shape of the request or response
	// ===============================================================================
	
	/**
	 * Set the context of the request. Used primarily to expose private values on a
	 * request object by setting the context to "edit".
	 *
	 * @method
	 * @chainable
	 * @param {String} context The context to set on the request
	 * @returns {WPRequest} The WPRequest instance (for chaining)
	 */
	WPRequest.prototype.context = paramSetter( 'context' );
	
	/**
	 * Convenience wrapper for `.context( 'edit' )`
	 *
	 * @method
	 * @chainable
	 * @returns {WPRequest} The WPRequest instance (for chaining)
	 */
	WPRequest.prototype.edit = function() {
		return this.context( 'edit' );
	};
	
	/**
	 * Return embedded resources as part of the response payload.
	 *
	 * @method
	 * @chainable
	 * @returns {WPRequest} The WPRequest instance (for chaining)
	 */
	WPRequest.prototype.embed = function() {
		return this.param( '_embed', true );
	};
	
	// Parameters supported by all/nearly all default collections
	// ==========================================================
	
	/**
	 * Set the pagination of a request. Use in conjunction with `.perPage()` for explicit
	 * pagination handling. (The number of pages in a response can be retrieved from the
	 * response's `_paging.totalPages` property.)
	 *
	 * @method
	 * @chainable
	 * @param {Number} pageNumber The page number of results to retrieve
	 * @returns The request instance (for chaining)
	 */
	WPRequest.prototype.page = paramSetter( 'page' );
	
	/**
	 * Set the number of items to be returned in a page of responses.
	 *
	 * @method
	 * @chainable
	 * @param {Number} itemsPerPage The number of items to return in one page of results
	 * @returns The request instance (for chaining)
	 */
	WPRequest.prototype.perPage = paramSetter( 'per_page' );
	
	/**
	 * Set an arbitrary offset to retrieve items from a specific point in a collection.
	 *
	 * @method
	 * @chainable
	 * @param {Number} offsetNumber The number of items by which to offset the response
	 * @returns The request instance (for chaining)
	 */
	WPRequest.prototype.offset = paramSetter( 'offset' );
	
	/**
	 * Change the sort direction of a returned collection
	 *
	 * @example <caption>order comments chronologically (oldest first)</caption>
	 *
	 *     site.comments().order( 'asc' )...
	 *
	 * @method
	 * @chainable
	 * @param {String} direction The order to use when sorting the response
	 * @returns The request instance (for chaining)
	 */
	WPRequest.prototype.order = paramSetter( 'order' );
	
	/**
	 * Order a collection by a specific field
	 *
	 * @method
	 * @chainable
	 * @param {String} field The field by which to order the response
	 * @returns The request instance (for chaining)
	 */
	WPRequest.prototype.orderby = paramSetter( 'orderby' );
	
	/**
	 * Filter results to those matching the specified search terms.
	 *
	 * @method
	 * @chainable
	 * @param {String} searchString A string to search for within post content
	 * @returns The request instance (for chaining)
	 */
	WPRequest.prototype.search = paramSetter( 'search' );
	
	/**
	 * Include specific resource IDs in the response collection.
	 *
	 * @method
	 * @chainable
	 * @param {Number|Number[]} ids An ID or array of IDs to include
	 * @returns The request instance (for chaining)
	 */
	WPRequest.prototype.include = paramSetter( 'include' );
	
	/**
	 * Exclude specific resource IDs in the response collection.
	 *
	 * @method
	 * @chainable
	 * @param {Number|Number[]} ids An ID or array of IDs to exclude
	 * @returns The request instance (for chaining)
	 */
	WPRequest.prototype.exclude = paramSetter( 'exclude' );
	
	/**
	 * Query a collection for members with a specific slug.
	 *
	 * @method
	 * @chainable
	 * @param {String} slug A post slug (slug), e.g. "hello-world"
	 * @returns The request instance (for chaining)
	 */
	WPRequest.prototype.slug = paramSetter( 'slug' );
	
	// HTTP Transport Prototype Methods
	// ================================
	
	// Chaining methods
	// ================
	
	/**
	 * Set the namespace of the request, e.g. to specify the API root for routes
	 * registered by wp core v2 ("wp/v2") or by any given plugin. Any previously-
	 * set namespace will be overwritten by subsequent calls to the method.
	 *
	 * @method
	 * @chainable
	 * @param {String} namespace A namespace string, e.g. "wp/v2"
	 * @returns {WPRequest} The WPRequest instance (for chaining)
	 */
	WPRequest.prototype.namespace = function( namespace ) {
		this._namespace = namespace;
		return this;
	};
	
	/**
	 * Set a request to use authentication, and optionally provide auth credentials
	 *
	 * If auth credentials were already specified when the WPAPI instance was created, calling
	 * `.auth` on the request chain will set that request to use the existing credentials:
	 *
	 * @example <caption>use existing credentials</caption>
	 *
	 *     request.auth().get...
	 *
	 * Alternatively, a username & password (or nonce) can be explicitly passed into `.auth`:
	 *
	 * @example <caption>use explicit basic authentication credentials</caption>
	 *
	 *     request.auth({
	 *       username: 'admin',
	 *       password: 'super secure'
	 *     }).get...
	 *
	 * @example <caption>use a nonce for cookie authentication</caption>
	 *
	 *     request.auth({
	 *       nonce: 'somenonce'
	 *     })...
	 *
	 * @method
	 * @chainable
	 * @param {Object} credentials            An object with 'username' and 'password' string
	 *                                        properties, or else a 'nonce' property
	 * @param {String} [credentials.username] A WP-API Basic HTTP Authentication username
	 * @param {String} [credentials.password] A WP-API Basic HTTP Authentication password
	 * @param {String} [credentials.nonce]    A WP nonce for use with cookie authentication
	 * @returns {WPRequest} The WPRequest instance (for chaining)
	 */
	WPRequest.prototype.auth = function( credentials ) {
		if ( typeof credentials === 'object' ) {
			if ( typeof credentials.username === 'string' ) {
				this._options.username = credentials.username;
			}
	
			if ( typeof credentials.password === 'string' ) {
				this._options.password = credentials.password;
			}
	
			if ( credentials.nonce ) {
				this._options.nonce = credentials.nonce;
			}
		}
	
		// Set the "auth" options flag that will force authentication on this request
		this._options.auth = true;
	
		return this;
	};
	
	/**
	 * Specify a file or a file buffer to attach to the request, for use when
	 * creating a new Media item
	 *
	 * @example <caption>within a server context</caption>
	 *
	 *     wp.media()
	 *       // Pass .file() the file system path to a file to upload
	 *       .file( '/path/to/file.jpg' )
	 *       .create({})...
	 *
	 * @example <caption>within a browser context</caption>
	 *
	 *     wp.media()
	 *       // Pass .file() the file reference from an HTML file input
	 *       .file( document.querySelector( 'input[type="file"]' ).files[0] )
	 *       .create({})...
	 *
	 * @method
	 * @chainable
	 * @param {string|object} file   A path to a file (in Node) or an file object
	 *                               (Node or Browser) to attach to the request
	 * @param {string}        [name] An (optional) filename to use for the file
	 * @returns {WPRequest} The WPRequest instance (for chaining)
	 */
	WPRequest.prototype.file = function( file, name ) {
		this._attachment = file;
		// Explicitly set to undefined if not provided, to override any previously-
		// set attachment name property that might exist from a prior `.file()` call
		this._attachmentName = name ? name : undefined;
		return this;
	};
	
	// HTTP Methods: Public Interface
	// ==============================
	
	/**
	 * Specify one or more headers to send with the dispatched HTTP request.
	 *
	 * @example <caption>Set a single header to be used on this request</caption>
	 *
	 *     request.setHeaders( 'Authorization', 'Bearer trustme' )...
	 *
	 * @example <caption>Set multiple headers to be used by this request</caption>
	 *
	 *     request.setHeaders({
	 *       Authorization: 'Bearer comeonwereoldfriendsright',
	 *       'Accept-Language': 'en-CA'
	 *     })...
	 *
	 * @since 1.1.0
	 * @method
	 * @chainable
	 * @param {String|Object} headers The name of the header to set, or an object of
	 *                                header names and their associated string values
	 * @param {String}        [value] The value of the header being set
	 * @returns {WPRequest} The WPRequest instance (for chaining)
	 */
	WPRequest.prototype.setHeaders = function( headers, value ) {
		// We can use the same iterator function below to handle explicit key-value
		// pairs if we convert them into to an object we can iterate over:
		if ( typeof headers === 'string' ) {
			headers = keyValToObj( headers, value );
		}
	
		this._options.headers = Object.assign( {}, this._options.headers || {}, headers );
	
		return this;
	};
	
	/**
	 * Get (download the data for) the specified resource
	 *
	 * @method
	 * @async
	 * @param {Function} [callback] A callback to invoke with the results of the GET request
	 * @returns {Promise} A promise to the results of the HTTP request
	 */
	WPRequest.prototype.get = function( callback ) {
		return this.transport.get( this, callback );
	};
	
	/**
	 * Get the headers for the specified resource
	 *
	 * @method
	 * @async
	 * @param {Function} [callback] A callback to invoke with the results of the HEAD request
	 * @returns {Promise} A promise to the header results of the HTTP request
	 */
	WPRequest.prototype.headers = function( callback ) {
		return this.transport.head( this, callback );
	};
	
	/**
	 * Create the specified resource with the provided data
	 *
	 * This is the public interface for creating POST requests
	 *
	 * @method
	 * @async
	 * @param {Object} data The data for the POST request
	 * @param {Function} [callback] A callback to invoke with the results of the POST request
	 * @returns {Promise} A promise to the results of the HTTP request
	 */
	WPRequest.prototype.create = function( data, callback ) {
		return this.transport.post( this, data, callback );
	};
	
	/**
	 * Update the specified resource with the provided data
	 *
	 * This is the public interface for creating PUT requests
	 *
	 * @method
	 * @async
	 * @private
	 * @param {Object} data The data for the PUT request
	 * @param {Function} [callback] A callback to invoke with the results of the PUT request
	 * @returns {Promise} A promise to the results of the HTTP request
	 */
	WPRequest.prototype.update = function( data, callback ) {
		return this.transport.put( this, data, callback );
	};
	
	/**
	 * Delete the specified resource
	 *
	 * @method
	 * @async
	 * @param {Object} [data] Data to send along with the DELETE request
	 * @param {Function} [callback] A callback to invoke with the results of the DELETE request
	 * @returns {Promise} A promise to the results of the HTTP request
	 */
	WPRequest.prototype.delete = function( data, callback ) {
		return this.transport.delete( this, data, callback );
	};
	
	/**
	 * Calling .then on a query chain will invoke the query as a GET and return a promise
	 *
	 * @method
	 * @async
	 * @param {Function} [successCallback] A callback to handle the data returned from the GET request
	 * @param {Function} [failureCallback] A callback to handle any errors encountered by the request
	 * @returns {Promise} A promise to the results of the HTTP request
	 */
	WPRequest.prototype.then = function( successCallback, failureCallback ) {
		return this.transport.get( this ).then( successCallback, failureCallback );
	};
	
	module.exports = WPRequest;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var stringify = __webpack_require__(20);
	var parse = __webpack_require__(23);
	var formats = __webpack_require__(22);
	
	module.exports = {
	    formats: formats,
	    parse: parse,
	    stringify: stringify
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(21);
	var formats = __webpack_require__(22);
	
	var arrayPrefixGenerators = {
	    brackets: function brackets(prefix) {
	        return prefix + '[]';
	    },
	    indices: function indices(prefix, key) {
	        return prefix + '[' + key + ']';
	    },
	    repeat: function repeat(prefix) {
	        return prefix;
	    }
	};
	
	var toISO = Date.prototype.toISOString;
	
	var defaults = {
	    delimiter: '&',
	    encode: true,
	    encoder: utils.encode,
	    serializeDate: function serializeDate(date) {
	        return toISO.call(date);
	    },
	    skipNulls: false,
	    strictNullHandling: false
	};
	
	var stringify = function stringify(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter) {
	    var obj = object;
	    if (typeof filter === 'function') {
	        obj = filter(prefix, obj);
	    } else if (obj instanceof Date) {
	        obj = serializeDate(obj);
	    } else if (obj === null) {
	        if (strictNullHandling) {
	            return encoder ? encoder(prefix) : prefix;
	        }
	
	        obj = '';
	    }
	
	    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
	        if (encoder) {
	            return [formatter(encoder(prefix)) + '=' + formatter(encoder(obj))];
	        }
	        return [formatter(prefix) + '=' + formatter(String(obj))];
	    }
	
	    var values = [];
	
	    if (typeof obj === 'undefined') {
	        return values;
	    }
	
	    var objKeys;
	    if (Array.isArray(filter)) {
	        objKeys = filter;
	    } else {
	        var keys = Object.keys(obj);
	        objKeys = sort ? keys.sort(sort) : keys;
	    }
	
	    for (var i = 0; i < objKeys.length; ++i) {
	        var key = objKeys[i];
	
	        if (skipNulls && obj[key] === null) {
	            continue;
	        }
	
	        if (Array.isArray(obj)) {
	            values = values.concat(stringify(
	                obj[key],
	                generateArrayPrefix(prefix, key),
	                generateArrayPrefix,
	                strictNullHandling,
	                skipNulls,
	                encoder,
	                filter,
	                sort,
	                allowDots,
	                serializeDate,
	                formatter
	            ));
	        } else {
	            values = values.concat(stringify(
	                obj[key],
	                prefix + (allowDots ? '.' + key : '[' + key + ']'),
	                generateArrayPrefix,
	                strictNullHandling,
	                skipNulls,
	                encoder,
	                filter,
	                sort,
	                allowDots,
	                serializeDate,
	                formatter
	            ));
	        }
	    }
	
	    return values;
	};
	
	module.exports = function (object, opts) {
	    var obj = object;
	    var options = opts || {};
	    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
	    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
	    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
	    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
	    var encoder = encode ? (typeof options.encoder === 'function' ? options.encoder : defaults.encoder) : null;
	    var sort = typeof options.sort === 'function' ? options.sort : null;
	    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
	    var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
	    if (typeof options.format === 'undefined') {
	        options.format = formats.default;
	    } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
	        throw new TypeError('Unknown format option provided.');
	    }
	    var formatter = formats.formatters[options.format];
	    var objKeys;
	    var filter;
	
	    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
	        throw new TypeError('Encoder has to be a function.');
	    }
	
	    if (typeof options.filter === 'function') {
	        filter = options.filter;
	        obj = filter('', obj);
	    } else if (Array.isArray(options.filter)) {
	        filter = options.filter;
	        objKeys = filter;
	    }
	
	    var keys = [];
	
	    if (typeof obj !== 'object' || obj === null) {
	        return '';
	    }
	
	    var arrayFormat;
	    if (options.arrayFormat in arrayPrefixGenerators) {
	        arrayFormat = options.arrayFormat;
	    } else if ('indices' in options) {
	        arrayFormat = options.indices ? 'indices' : 'repeat';
	    } else {
	        arrayFormat = 'indices';
	    }
	
	    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];
	
	    if (!objKeys) {
	        objKeys = Object.keys(obj);
	    }
	
	    if (sort) {
	        objKeys.sort(sort);
	    }
	
	    for (var i = 0; i < objKeys.length; ++i) {
	        var key = objKeys[i];
	
	        if (skipNulls && obj[key] === null) {
	            continue;
	        }
	
	        keys = keys.concat(stringify(
	            obj[key],
	            key,
	            generateArrayPrefix,
	            strictNullHandling,
	            skipNulls,
	            encoder,
	            filter,
	            sort,
	            allowDots,
	            serializeDate,
	            formatter
	        ));
	    }
	
	    return keys.join(delimiter);
	};


/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';
	
	var has = Object.prototype.hasOwnProperty;
	
	var hexTable = (function () {
	    var array = [];
	    for (var i = 0; i < 256; ++i) {
	        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
	    }
	
	    return array;
	}());
	
	exports.arrayToObject = function (source, options) {
	    var obj = options && options.plainObjects ? Object.create(null) : {};
	    for (var i = 0; i < source.length; ++i) {
	        if (typeof source[i] !== 'undefined') {
	            obj[i] = source[i];
	        }
	    }
	
	    return obj;
	};
	
	exports.merge = function (target, source, options) {
	    if (!source) {
	        return target;
	    }
	
	    if (typeof source !== 'object') {
	        if (Array.isArray(target)) {
	            target.push(source);
	        } else if (typeof target === 'object') {
	            target[source] = true;
	        } else {
	            return [target, source];
	        }
	
	        return target;
	    }
	
	    if (typeof target !== 'object') {
	        return [target].concat(source);
	    }
	
	    var mergeTarget = target;
	    if (Array.isArray(target) && !Array.isArray(source)) {
	        mergeTarget = exports.arrayToObject(target, options);
	    }
	
	    if (Array.isArray(target) && Array.isArray(source)) {
	        source.forEach(function (item, i) {
	            if (has.call(target, i)) {
	                if (target[i] && typeof target[i] === 'object') {
	                    target[i] = exports.merge(target[i], item, options);
	                } else {
	                    target.push(item);
	                }
	            } else {
	                target[i] = item;
	            }
	        });
	        return target;
	    }
	
	    return Object.keys(source).reduce(function (acc, key) {
	        var value = source[key];
	
	        if (Object.prototype.hasOwnProperty.call(acc, key)) {
	            acc[key] = exports.merge(acc[key], value, options);
	        } else {
	            acc[key] = value;
	        }
	        return acc;
	    }, mergeTarget);
	};
	
	exports.decode = function (str) {
	    try {
	        return decodeURIComponent(str.replace(/\+/g, ' '));
	    } catch (e) {
	        return str;
	    }
	};
	
	exports.encode = function (str) {
	    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
	    // It has been adapted here for stricter adherence to RFC 3986
	    if (str.length === 0) {
	        return str;
	    }
	
	    var string = typeof str === 'string' ? str : String(str);
	
	    var out = '';
	    for (var i = 0; i < string.length; ++i) {
	        var c = string.charCodeAt(i);
	
	        if (
	            c === 0x2D || // -
	            c === 0x2E || // .
	            c === 0x5F || // _
	            c === 0x7E || // ~
	            (c >= 0x30 && c <= 0x39) || // 0-9
	            (c >= 0x41 && c <= 0x5A) || // a-z
	            (c >= 0x61 && c <= 0x7A) // A-Z
	        ) {
	            out += string.charAt(i);
	            continue;
	        }
	
	        if (c < 0x80) {
	            out = out + hexTable[c];
	            continue;
	        }
	
	        if (c < 0x800) {
	            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
	            continue;
	        }
	
	        if (c < 0xD800 || c >= 0xE000) {
	            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
	            continue;
	        }
	
	        i += 1;
	        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
	        out += hexTable[0xF0 | (c >> 18)] + hexTable[0x80 | ((c >> 12) & 0x3F)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)];
	    }
	
	    return out;
	};
	
	exports.compact = function (obj, references) {
	    if (typeof obj !== 'object' || obj === null) {
	        return obj;
	    }
	
	    var refs = references || [];
	    var lookup = refs.indexOf(obj);
	    if (lookup !== -1) {
	        return refs[lookup];
	    }
	
	    refs.push(obj);
	
	    if (Array.isArray(obj)) {
	        var compacted = [];
	
	        for (var i = 0; i < obj.length; ++i) {
	            if (obj[i] && typeof obj[i] === 'object') {
	                compacted.push(exports.compact(obj[i], refs));
	            } else if (typeof obj[i] !== 'undefined') {
	                compacted.push(obj[i]);
	            }
	        }
	
	        return compacted;
	    }
	
	    var keys = Object.keys(obj);
	    keys.forEach(function (key) {
	        obj[key] = exports.compact(obj[key], refs);
	    });
	
	    return obj;
	};
	
	exports.isRegExp = function (obj) {
	    return Object.prototype.toString.call(obj) === '[object RegExp]';
	};
	
	exports.isBuffer = function (obj) {
	    if (obj === null || typeof obj === 'undefined') {
	        return false;
	    }
	
	    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
	};


/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';
	
	var replace = String.prototype.replace;
	var percentTwenties = /%20/g;
	
	module.exports = {
	    'default': 'RFC3986',
	    formatters: {
	        RFC1738: function (value) {
	            return replace.call(value, percentTwenties, '+');
	        },
	        RFC3986: function (value) {
	            return value;
	        }
	    },
	    RFC1738: 'RFC1738',
	    RFC3986: 'RFC3986'
	};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(21);
	
	var has = Object.prototype.hasOwnProperty;
	
	var defaults = {
	    allowDots: false,
	    allowPrototypes: false,
	    arrayLimit: 20,
	    decoder: utils.decode,
	    delimiter: '&',
	    depth: 5,
	    parameterLimit: 1000,
	    plainObjects: false,
	    strictNullHandling: false
	};
	
	var parseValues = function parseValues(str, options) {
	    var obj = {};
	    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);
	
	    for (var i = 0; i < parts.length; ++i) {
	        var part = parts[i];
	        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;
	
	        var key, val;
	        if (pos === -1) {
	            key = options.decoder(part);
	            val = options.strictNullHandling ? null : '';
	        } else {
	            key = options.decoder(part.slice(0, pos));
	            val = options.decoder(part.slice(pos + 1));
	        }
	        if (has.call(obj, key)) {
	            obj[key] = [].concat(obj[key]).concat(val);
	        } else {
	            obj[key] = val;
	        }
	    }
	
	    return obj;
	};
	
	var parseObject = function parseObject(chain, val, options) {
	    if (!chain.length) {
	        return val;
	    }
	
	    var root = chain.shift();
	
	    var obj;
	    if (root === '[]') {
	        obj = [];
	        obj = obj.concat(parseObject(chain, val, options));
	    } else {
	        obj = options.plainObjects ? Object.create(null) : {};
	        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
	        var index = parseInt(cleanRoot, 10);
	        if (
	            !isNaN(index) &&
	            root !== cleanRoot &&
	            String(index) === cleanRoot &&
	            index >= 0 &&
	            (options.parseArrays && index <= options.arrayLimit)
	        ) {
	            obj = [];
	            obj[index] = parseObject(chain, val, options);
	        } else {
	            obj[cleanRoot] = parseObject(chain, val, options);
	        }
	    }
	
	    return obj;
	};
	
	var parseKeys = function parseKeys(givenKey, val, options) {
	    if (!givenKey) {
	        return;
	    }
	
	    // Transform dot notation to bracket notation
	    var key = options.allowDots ? givenKey.replace(/\.([^\.\[]+)/g, '[$1]') : givenKey;
	
	    // The regex chunks
	
	    var parent = /^([^\[\]]*)/;
	    var child = /(\[[^\[\]]*\])/g;
	
	    // Get the parent
	
	    var segment = parent.exec(key);
	
	    // Stash the parent if it exists
	
	    var keys = [];
	    if (segment[1]) {
	        // If we aren't using plain objects, optionally prefix keys
	        // that would overwrite object prototype properties
	        if (!options.plainObjects && has.call(Object.prototype, segment[1])) {
	            if (!options.allowPrototypes) {
	                return;
	            }
	        }
	
	        keys.push(segment[1]);
	    }
	
	    // Loop through children appending to the array until we hit depth
	
	    var i = 0;
	    while ((segment = child.exec(key)) !== null && i < options.depth) {
	        i += 1;
	        if (!options.plainObjects && has.call(Object.prototype, segment[1].replace(/\[|\]/g, ''))) {
	            if (!options.allowPrototypes) {
	                continue;
	            }
	        }
	        keys.push(segment[1]);
	    }
	
	    // If there's a remainder, just add whatever is left
	
	    if (segment) {
	        keys.push('[' + key.slice(segment.index) + ']');
	    }
	
	    return parseObject(keys, val, options);
	};
	
	module.exports = function (str, opts) {
	    var options = opts || {};
	
	    if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
	        throw new TypeError('Decoder has to be a function.');
	    }
	
	    options.delimiter = typeof options.delimiter === 'string' || utils.isRegExp(options.delimiter) ? options.delimiter : defaults.delimiter;
	    options.depth = typeof options.depth === 'number' ? options.depth : defaults.depth;
	    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults.arrayLimit;
	    options.parseArrays = options.parseArrays !== false;
	    options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults.decoder;
	    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults.allowDots;
	    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults.plainObjects;
	    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults.allowPrototypes;
	    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults.parameterLimit;
	    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
	
	    if (str === '' || str === null || typeof str === 'undefined') {
	        return options.plainObjects ? Object.create(null) : {};
	    }
	
	    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
	    var obj = options.plainObjects ? Object.create(null) : {};
	
	    // Iterate over the keys and setup the new object
	
	    var keys = Object.keys(tempObj);
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        var newObj = parseKeys(key, tempObj[key], options);
	        obj = utils.merge(obj, newObj, options);
	    }
	
	    return utils.compact(obj);
	};


/***/ },
/* 24 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';
	
	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
	
	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	/**
	 * A specialized version of `_.includes` for arrays without support for
	 * specifying an index to search from.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludes(array, value) {
	  var length = array ? array.length : 0;
	  return !!length && baseIndexOf(array, value, 0) > -1;
	}
	
	/**
	 * This function is like `arrayIncludes` except that it accepts a comparator.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @param {Function} comparator The comparator invoked per element.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludesWith(array, value, comparator) {
	  var index = -1,
	      length = array ? array.length : 0;
	
	  while (++index < length) {
	    if (comparator(value, array[index])) {
	      return true;
	    }
	  }
	  return false;
	}
	
	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 1 : -1);
	
	  while ((fromRight ? index-- : ++index < length)) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  if (value !== value) {
	    return baseFindIndex(array, baseIsNaN, fromIndex);
	  }
	  var index = fromIndex - 1,
	      length = array.length;
	
	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	/**
	 * The base implementation of `_.isNaN` without support for number objects.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	 */
	function baseIsNaN(value) {
	  return value !== value;
	}
	
	/**
	 * Checks if a cache value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}
	
	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}
	
	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}
	
	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);
	
	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}
	
	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    funcProto = Function.prototype,
	    objectProto = Object.prototype;
	
	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];
	
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/** Built-in value references. */
	var splice = arrayProto.splice;
	
	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map'),
	    Set = getNative(root, 'Set'),
	    nativeCreate = getNative(Object, 'create');
	
	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}
	
	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  return this.has(key) && delete this.__data__[key];
	}
	
	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}
	
	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}
	
	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}
	
	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	
	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}
	
	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  return true;
	}
	
	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  return index < 0 ? undefined : data[index][1];
	}
	
	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}
	
	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}
	
	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	
	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}
	
	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  return getMapData(this, key)['delete'](key);
	}
	
	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}
	
	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}
	
	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  getMapData(this, key).set(key, value);
	  return this;
	}
	
	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	
	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	      length = values ? values.length : 0;
	
	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}
	
	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}
	
	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}
	
	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;
	
	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}
	
	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}
	
	/**
	 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new duplicate free array.
	 */
	function baseUniq(array, iteratee, comparator) {
	  var index = -1,
	      includes = arrayIncludes,
	      length = array.length,
	      isCommon = true,
	      result = [],
	      seen = result;
	
	  if (comparator) {
	    isCommon = false;
	    includes = arrayIncludesWith;
	  }
	  else if (length >= LARGE_ARRAY_SIZE) {
	    var set = iteratee ? null : createSet(array);
	    if (set) {
	      return setToArray(set);
	    }
	    isCommon = false;
	    includes = cacheHas;
	    seen = new SetCache;
	  }
	  else {
	    seen = iteratee ? [] : result;
	  }
	  outer:
	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value) : value;
	
	    value = (comparator || value !== 0) ? value : 0;
	    if (isCommon && computed === computed) {
	      var seenIndex = seen.length;
	      while (seenIndex--) {
	        if (seen[seenIndex] === computed) {
	          continue outer;
	        }
	      }
	      if (iteratee) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	    else if (!includes(seen, computed, comparator)) {
	      if (seen !== result) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	  }
	  return result;
	}
	
	/**
	 * Creates a set object of `values`.
	 *
	 * @private
	 * @param {Array} values The values to add to the set.
	 * @returns {Object} Returns the new set.
	 */
	var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
	  return new Set(values);
	};
	
	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}
	
	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}
	
	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}
	
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}
	
	/**
	 * Creates a duplicate-free version of an array, using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons, in which only the first occurrence of each
	 * element is kept.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @returns {Array} Returns the new duplicate free array.
	 * @example
	 *
	 * _.uniq([2, 1, 2]);
	 * // => [2, 1]
	 */
	function uniq(array) {
	  return (array && array.length)
	    ? baseUniq(array)
	    : [];
	}
	
	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8-9 which returns 'object' for typed array and other constructors.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}
	
	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * This method returns `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.3.0
	 * @category Util
	 * @example
	 *
	 * _.times(2, _.noop);
	 * // => [undefined, undefined]
	 */
	function noop() {
	  // No operation performed.
	}
	
	module.exports = uniq;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Utility function for sorting arrays of numbers or strings.
	 *
	 * @module util/alphanumeric-sort
	 * @param {String|Number} a The first comparator operand
	 * @param {String|Number} a The second comparator operand
	 * @returns -1 if the values are backwards, 1 if they're ordered, and 0 if they're the same
	 */
	function alphaNumericSort( a, b ) {
		if ( a > b ) {
			return 1;
		}
		if ( a < b ) {
			return -1;
		}
		return 0;
	}
	
	module.exports = alphaNumericSort;


/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Convert a (key, value) pair to a { key: value } object
	 *
	 * @module util/key-val-to-obj
	 * @param {string} key   The key to use in the returned object
	 * @param {}       value The value to assign to the provided key
	 * @returns {object} A dictionary object containing the key-value pair
	 */
	module.exports = function( key, value ) {
		var obj = {};
		obj[ key ] = value;
		return obj;
	};


/***/ },
/* 27 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Helper to create a simple parameter setter convenience method
	 *
	 * @module util/parameter-setter
	 * @param {String} param The string key of the parameter this method will set
	 * @returns {Function} A setter method that can be assigned to a request instance
	 */
	module.exports = function( param ) {
		/**
		 * A setter for a specific parameter
		 *
		 * @chainable
		 * @param {*} val The value to set for the the parameter
		 * @returns The request instance on which this method was called (for chaining)
		 */
		return function( val ) {
			/* jshint validthis:true */
			return this.param( param, val );
		};
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * This module defines a mapping between supported GET request query parameter
	 * arguments and their corresponding mixin, if available.
	 */
	'use strict';
	
	var filterMixins = __webpack_require__( 29 );
	var parameterMixins = __webpack_require__( 30 );
	
	// `.context`, `.embed`, and `.edit` (a shortcut for `context(edit, true)`) are
	// supported by default in WPRequest, as is the base `.param` method. Any GET
	// argument parameters not covered here must be set directly by using `.param`.
	
	// The initial mixins we define are the ones where either a single property
	// accepted by the API endpoint corresponds to multiple individual mixin
	// functions, or where the name we use for the function diverges from that
	// of the query parameter that the mixin sets.
	var mixins = {
		categories: {
			categories: parameterMixins.categories,
			/** @deprecated use .categories() */
			category: parameterMixins.category
		},
		categories_exclude: {
			excludeCategories: parameterMixins.excludeCategories
		},
		tags: {
			tags: parameterMixins.tags,
			/** @deprecated use .tags() */
			tag: parameterMixins.tag
		},
		tags_exclude: {
			excludeTags: parameterMixins.excludeTags
		},
		filter: filterMixins,
		post: {
			post: parameterMixins.post,
			/** @deprecated use .post() */
			forPost: parameterMixins.post
		}
	};
	
	// All of these parameter mixins use a setter function named identically to the
	// property that the function sets, but they must still be provided in wrapper
	// objects so that the mixin can be `.assign`ed correctly: wrap & assign each
	// setter to the mixins dictionary object.
	[
		'after',
		'author',
		'before',
		'parent',
		'password',
		'status',
		'sticky'
	].forEach(function( mixinName ) {
		mixins[ mixinName ] = {};
		mixins[ mixinName ][ mixinName ] = parameterMixins[ mixinName ];
	});
	
	module.exports = mixins;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module mixins/filters
	 */
	'use strict';
	
	var _unique = __webpack_require__( 24 );
	var extend = __webpack_require__( 1 );
	
	var alphaNumericSort = __webpack_require__( 25 );
	var keyValToObj = __webpack_require__( 26 );
	
	/**
	 * Filter methods that can be mixed in to a request constructor's prototype to
	 * allow that request to take advantage of the `?filter[]=` aliases for WP_Query
	 * parameters for collection endpoints, when available.
	 *
	 * @mixin filters
	 */
	var filterMixins = {};
	
	// Filter Methods
	// ==============
	
	/**
	 * Specify key-value pairs by which to filter the API results (commonly used
	 * to retrieve only posts meeting certain criteria, such as posts within a
	 * particular category or by a particular author).
	 *
	 * @example
	 *
	 *     // Set a single property:
	 *     wp.filter( 'post_type', 'cpt_event' )...
	 *
	 *     // Set multiple properties at once:
	 *     wp.filter({
	 *         post_status: 'publish',
	 *         category_name: 'news'
	 *     })...
	 *
	 *     // Chain calls to .filter():
	 *     wp.filter( 'post_status', 'publish' ).filter( 'category_name', 'news' )...
	 *
	 * @method filter
	 * @chainable
	 * @param {String|Object} props A filter property name string, or object of name/value pairs
	 * @param {String|Number|Array} [value] The value(s) corresponding to the provided filter property
	 * @returns The request instance (for chaining)
	 */
	filterMixins.filter = function( props, value ) {
		/* jshint validthis:true */
	
		if ( ! props || typeof props === 'string' && value === undefined ) {
			// We have no filter to set, or no value to set for that filter
			return this;
		}
	
		// convert the property name string `props` and value `value` into an object
		if ( typeof props === 'string' ) {
			props = keyValToObj( props, value );
		}
	
		this._filters = extend( this._filters, props );
	
		return this;
	};
	
	/**
	 * Restrict the query results to posts matching one or more taxonomy terms.
	 *
	 * @method taxonomy
	 * @chainable
	 * @param {String} taxonomy The name of the taxonomy to filter by
	 * @param {String|Number|Array} term A string or integer, or array thereof, representing terms
	 * @returns The request instance (for chaining)
	 */
	filterMixins.taxonomy = function( taxonomy, term ) {
		/* jshint validthis:true */
		var termIsArray = Array.isArray( term );
		var termIsNumber = termIsArray ?
			term.reduce(function( allAreNumbers, term ) {
				return allAreNumbers && typeof term === 'number';
			}, true ) :
			typeof term === 'number';
		var termIsString = termIsArray ?
			term.reduce(function( allAreStrings, term ) {
				return allAreStrings && typeof term === 'string';
			}, true ) :
			typeof term === 'string';
		var taxonomyTerms;
	
		if ( ! termIsString && ! termIsNumber ) {
			throw new Error( 'term must be a number, string, or array of numbers or strings' );
		}
	
		if ( taxonomy === 'category' ) {
			if ( termIsString ) {
				// Query param for filtering by category slug is "category_name"
				taxonomy = 'category_name';
			} else {
				// The boolean check above ensures that if taxonomy === 'category' and
				// term is not a string, then term must be a number and therefore an ID:
				// Query param for filtering by category ID is "cat"
				taxonomy = 'cat';
			}
		} else if ( taxonomy === 'post_tag' ) {
			// tag is used in place of post_tag in the public query variables
			taxonomy = 'tag';
		}
	
		// Ensure the taxonomy filters object is available
		this._taxonomyFilters = this._taxonomyFilters || {};
	
		// Ensure there's an array of terms available for this taxonomy
		taxonomyTerms = ( this._taxonomyFilters[ taxonomy ] || [] )
			// Insert the provided terms into the specified taxonomy's terms array
			.concat( term )
			// Sort array
			.sort( alphaNumericSort );
	
		// De-dupe
		this._taxonomyFilters[ taxonomy ] = _unique( taxonomyTerms, true );
	
		return this;
	};
	
	/**
	 * Query for posts published in a given year.
	 *
	 * @method year
	 * @chainable
	 * @param {Number} year integer representation of year requested
	 * @returns The request instance (for chaining)
	 */
	filterMixins.year = function( year ) {
		/* jshint validthis:true */
		return filterMixins.filter.call( this, 'year', year );
	};
	
	/**
	 * Query for posts published in a given month, either by providing the number
	 * of the requested month (e.g. 3), or the month's name as a string (e.g. "March")
	 *
	 * @method month
	 * @chainable
	 * @param {Number|String} month Integer for month (1) or month string ("January")
	 * @returns The request instance (for chaining)
	 */
	filterMixins.month = function( month ) {
		/* jshint validthis:true */
		var monthDate;
		if ( typeof month === 'string' ) {
			// Append a arbitrary day and year to the month to parse the string into a Date
			monthDate = new Date( Date.parse( month + ' 1, 2012' ) );
	
			// If the generated Date is NaN, then the passed string is not a valid month
			if ( isNaN( monthDate ) ) {
				return this;
			}
	
			// JS Dates are 0 indexed, but the WP API requires a 1-indexed integer
			month = monthDate.getMonth() + 1;
		}
	
		// If month is a Number, add the monthnum filter to the request
		if ( typeof month === 'number' ) {
			return filterMixins.filter.call( this, 'monthnum', month );
		}
	
		return this;
	};
	
	/**
	 * Add the day filter into the request to retrieve posts for a given day
	 *
	 * @method day
	 * @chainable
	 * @param {Number} day Integer representation of the day requested
	 * @returns The request instance (for chaining)
	 */
	filterMixins.day = function( day ) {
		/* jshint validthis:true */
		return filterMixins.filter.call( this, 'day', day );
	};
	
	/**
	 * Specify that we are requesting a page by its path (specific to Page resources)
	 *
	 * @method path
	 * @chainable
	 * @param {String} path The root-relative URL path for a page
	 * @returns The request instance (for chaining)
	 */
	filterMixins.path = function( path ) {
		/* jshint validthis:true */
		return filterMixins.filter.call( this, 'pagename', path );
	};
	
	module.exports = filterMixins;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Filter methods that can be mixed in to a request constructor's prototype to
	 * allow that request to take advantage of top-level query parameters for
	 * collection endpoints. These are most relevant to posts, pages and CPTs, but
	 * pagination helpers are applicable to any collection.
	 *
	 * @module mixins/parameters
	 */
	'use strict';
	/*jshint -W106 */// Disable underscore_case warnings in this file b/c WP uses them
	
	var paramSetter = __webpack_require__( 27 );
	var argumentIsNumeric = __webpack_require__( 31 );
	
	/**
	 * @mixin parameters
	 */
	var parameterMixins = {};
	
	var filters = __webpack_require__( 29 );
	// Needed for .author mixin, as author by ID is a parameter and by Name is a filter
	var filter = filters.filter;
	// Needed for .tag and .category mixin, for deprecated query-by-slug support
	var taxonomy = filters.taxonomy;
	
	// Parameter Methods
	// =================
	
	/**
	 * Query for posts by a specific author.
	 * This method will replace any previous 'author' query parameters that had been set.
	 *
	 * Note that this method will either set the "author" top-level query parameter,
	 * or else the "author_name" filter parameter (when querying by nicename): this is
	 * irregular as most parameter helper methods either set a top level parameter or a
	 * filter, not both.
	 *
	 * _Usage with the author nicename string is deprecated._ Query by author ID instead.
	 * If the "rest-filter" plugin is not installed, the name query will have no effect.
	 *
	 * @method author
	 * @chainable
	 * @param {String|Number} author The nicename or ID for a particular author
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.author = function( author ) {
		/* jshint validthis:true */
		if ( author === undefined ) {
			return this;
		}
		if ( typeof author === 'string' ) {
			this.param( 'author', null );
			return filter.call( this, 'author_name', author );
		}
		if ( typeof author === 'number' ) {
			filter.call( this, 'author_name', null );
			return this.param( 'author', author );
		}
		if ( author === null ) {
			filter.call( this, 'author_name', null );
			return this.param( 'author', null );
		}
		throw new Error( 'author must be either a nicename string or numeric ID' );
	};
	
	/**
	 * Search for hierarchical taxonomy terms that are children of the parent term
	 * indicated by the provided term ID
	 *
	 * @example
	 *
	 *     wp.pages().parent( 3 ).then(function( pages ) {
	 *       // console.log( 'all of these pages are nested below page ID#3:' );
	 *       // console.log( pages );
	 *     });
	 *
	 *     wp.categories().parent( 42 ).then(function( categories ) {
	 *       console.log( 'all of these categories are sub-items of cat ID#42:' );
	 *       console.log( categories );
	 *     });
	 *
	 * @method parent
	 * @chainable
	 * @param {Number} parentId The ID of a (hierarchical) taxonomy term
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.parent = paramSetter( 'parent' );
	
	/**
	 * Specify the post for which to retrieve terms (relevant for *e.g.* taxonomy
	 * and comment collection endpoints).
	 *
	 * @method post
	 * @chainable
	 * @param {String|Number} post The ID of the post for which to retrieve terms
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.post = paramSetter( 'post' );
	
	/**
	 * Specify the password to use to access the content of a password-protected post
	 *
	 * @method password
	 * @chainable
	 * @param {string} password A string password to access protected content within a post
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.password = paramSetter( 'password' );
	
	/**
	 * Specify for which post statuses to return posts in a response collection
	 *
	 * See https://codex.wordpress.org/Post_Status -- the default post status
	 * values in WordPress which are most relevant to the API are 'publish',
	 * 'future', 'draft', 'pending', 'private', and 'trash'. This parameter also
	 * supports passing the special value "any" to return all statuses.
	 *
	 * @method status
	 * @chainable
	 * @param {string|string[]} status A status name string or array of strings
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.status = paramSetter( 'status' );
	
	/**
	 * Specify whether to return only, or to completely exclude, sticky posts
	 *
	 * @method sticky
	 * @chainable
	 * @param {boolean} sticky A boolean value for whether ONLY sticky posts (true) or
	 *                         NO sticky posts (false) should be returned in the query
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.sticky = paramSetter( 'sticky' );
	
	// Taxonomy Term Filter Methods
	// ============================
	
	/**
	 * Retrieve only records associated with one of the provided categories
	 *
	 * @method categories
	 * @chainable
	 * @param {String|Number|Array} categories A term ID integer or numeric string, or array thereof
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.categories = paramSetter( 'categories' );
	
	/**
	 * Legacy wrapper for `.categories()` that uses `?filter` to query by slug if available
	 *
	 * @method tag
	 * @deprecated Use `.categories()` and query by category IDs
	 * @chainable
	 * @param {String|Number|Array} tag A category term slug string, numeric ID, or array of numeric IDs
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.category = function( category ) {
		/* jshint validthis:true */
		if ( argumentIsNumeric( category ) ) {
			return parameterMixins.categories.call( this, category );
		}
		return taxonomy.call( this, 'category', category );
	};
	
	/**
	 * Exclude records associated with any of the provided category IDs
	 *
	 * @method excludeCategories
	 * @chainable
	 * @param {String|Number|Array} category A term ID integer or numeric string, or array thereof
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.excludeCategories = paramSetter( 'categories_exclude' );
	
	/**
	 * Retrieve only records associated with one of the provided tag IDs
	 *
	 * @method tags
	 * @chainable
	 * @param {String|Number|Array} tags A term ID integer or numeric string, or array thereof
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.tags = paramSetter( 'tags' );
	
	/**
	 * Legacy wrapper for `.tags()` that uses `?filter` to query by slug if available
	 *
	 * @method tag
	 * @deprecated Use `.tags()` and query by term IDs
	 * @chainable
	 * @param {String|Number|Array} tag A tag term slug string, numeric ID, or array of numeric IDs
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.tag = function( tag ) {
		/* jshint validthis:true */
		if ( argumentIsNumeric( tag ) ) {
			return parameterMixins.tags.call( this, tag );
		}
		return taxonomy.call( this, 'tag', tag );
	};
	
	/**
	 * Exclude records associated with any of the provided tag IDs
	 *
	 * @method excludeTags
	 * @chainable
	 * @param {String|Number|Array} category A term ID integer or numeric string, or array thereof
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.excludeTags = paramSetter( 'tags_exclude' );
	
	// Date Methods
	// ============
	
	/**
	 * Retrieve only records published before a specified date
	 *
	 * @example <caption>Provide an ISO 8601-compliant date string</caption>
	 *
	 *     wp.posts().before('2016-03-22')...
	 *
	 * @example <caption>Provide a JavaScript Date object</caption>
	 *
	 *     wp.posts().before( new Date( 2016, 03, 22 ) )...
	 *
	 * @method before
	 * @chainable
	 * @param {String|Date} date An ISO 8601-compliant date string, or Date object
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.before = function( date ) {
		/* jshint validthis:true */
		return this.param( 'before', new Date( date ).toISOString() );
	};
	
	/**
	 * Retrieve only records published after a specified date
	 *
	 * @example <caption>Provide an ISO 8601-compliant date string</caption>
	 *
	 *     wp.posts().after('1986-03-22')...
	 *
	 * @example <caption>Provide a JavaScript Date object</caption>
	 *
	 *     wp.posts().after( new Date( 1986, 03, 22 ) )...
	 *
	 * @method after
	 * @chainable
	 * @param {String|Date} date An ISO 8601-compliant date string, or Date object
	 * @returns The request instance (for chaining)
	 */
	parameterMixins.after = function( date ) {
		/* jshint validthis:true */
		return this.param( 'after', new Date( date ).toISOString() );
	};
	
	module.exports = parameterMixins;


/***/ },
/* 31 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Return true if the provided argument is a number, a numeric string, or an
	 * array of numbers or numeric strings
	 *
	 * @module util/argument-is-numeric
	 * @param {Number|String|Number[]|String[]} val The value to inspect
	 * @param {String} key The property to which the mixin method should be assigned
	 * @param {Function} mixin The mixin method
	 * @returns {void}
	 */
	function argumentIsNumeric( val ) {
		if ( typeof val === 'number' ) {
			return true;
		}
	
		if ( typeof val === 'string' ) {
			return /^\d+$/.test( val );
		}
	
		if ( Array.isArray( val ) ) {
			for ( var i = 0; i < val.length; i++ ) {
				// Fail early if any argument isn't determined to be numeric
				if ( ! argumentIsNumeric( val[ i ] ) ) {
					return false;
				}
			}
			return true;
		}
	
		// If it's not an array, and not a string, and not a number, we don't
		// know what to do with it
		return false;
	}
	
	module.exports = argumentIsNumeric;


/***/ },
/* 32 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Augment an object (specifically a prototype) with a mixin method
	 * (the provided object is mutated by reference)
	 *
	 * @module util/apply-mixin
	 * @param {Object} obj The object (usually a prototype) to augment
	 * @param {String} key The property to which the mixin method should be assigned
	 * @param {Function} mixin The mixin method
	 * @returns {void}
	 */
	module.exports = function( obj, key, mixin ) {
		// Will not overwrite existing methods
		if ( typeof mixin === 'function' && ! obj[ key ] ) {
			obj[ key ] = mixin;
		}
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Utility methods used when querying a site in order to discover its available
	 * API endpoints
	 *
	 * @module autodiscovery
	 */
	'use strict';
	
	var parseLinkHeader = __webpack_require__( 34 );
	
	/**
	 * Attempt to locate a `rel="https://api.w.org"` link relation header
	 *
	 * @method locateAPIRootHeader
	 * @param {Object} response A response object with a link or headers property
	 * @returns {String} The URL of the located API root
	 */
	function locateAPIRootHeader( response ) {
		// Define the expected link rel value per http://v2.wp-api.org/guide/discovery/
		var rel = 'https://api.w.org/';
	
		// Extract & parse the response link headers
		var link = response.link || ( response.headers && response.headers.link );
		var headers = parseLinkHeader( link );
		var apiHeader = headers && headers[ rel ];
	
		if ( apiHeader && apiHeader.url ) {
			return apiHeader.url;
		}
	
		throw new Error( 'No header link found with rel="https://api.w.org/"' );
	}
	
	module.exports = {
		locateAPIRootHeader: locateAPIRootHeader
	};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var qs = __webpack_require__(35)
	  , url = __webpack_require__(38)
	  , xtend = __webpack_require__(42);
	
	function hasRel(x) {
	  return x && x.rel;
	}
	
	function intoRels (acc, x) {
	  function splitRel (rel) {
	    acc[rel] = xtend(x, { rel: rel });
	  }
	
	  x.rel.split(/\s+/).forEach(splitRel);
	
	  return acc;
	}
	
	function createObjects (acc, p) {
	  // rel="next" => 1: rel 2: next
	  var m = p.match(/\s*(.+)\s*=\s*"?([^"]+)"?/)
	  if (m) acc[m[1]] = m[2];
	  return acc;
	}
	
	function parseLink(link) {
	  try {
	    var parts     =  link.split(';')
	      , linkUrl   =  parts.shift().replace(/[<>]/g, '')
	      , parsedUrl =  url.parse(linkUrl)
	      , qry       =  qs.parse(parsedUrl.query);
	
	    var info = parts
	      .reduce(createObjects, {});
	    
	    info = xtend(qry, info);
	    info.url = linkUrl;
	    return info;
	  } catch (e) {
	    return null;
	  }
	}
	
	module.exports = function (linkHeader) {
	  if (!linkHeader) return null;
	
	  return linkHeader.split(/,\s*</)
	   .map(parseLink)
	   .filter(hasRel)
	   .reduce(intoRels, {});
	};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.decode = exports.parse = __webpack_require__(36);
	exports.encode = exports.stringify = __webpack_require__(37);


/***/ },
/* 36 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};
	
	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }
	
	  var regexp = /\+/g;
	  qs = qs.split(sep);
	
	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }
	
	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }
	
	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;
	
	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }
	
	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);
	
	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }
	
	  return obj;
	};


/***/ },
/* 37 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;
	
	    case 'boolean':
	      return v ? 'true' : 'false';
	
	    case 'number':
	      return isFinite(v) ? v : '';
	
	    default:
	      return '';
	  }
	};
	
	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }
	
	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);
	
	  }
	
	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var punycode = __webpack_require__(39);
	var util = __webpack_require__(41);
	
	exports.parse = urlParse;
	exports.resolve = urlResolve;
	exports.resolveObject = urlResolveObject;
	exports.format = urlFormat;
	
	exports.Url = Url;
	
	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}
	
	// Reference: RFC 3986, RFC 1808, RFC 2396
	
	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	    portPattern = /:[0-9]*$/,
	
	    // Special case for a simple path URL
	    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
	
	    // RFC 2396: characters reserved for delimiting URLs.
	    // We actually just auto-escape these.
	    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
	
	    // RFC 2396: characters not allowed for various reasons.
	    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),
	
	    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	    autoEscape = ['\''].concat(unwise),
	    // Characters that are never ever allowed in a hostname.
	    // Note that any invalid chars are also handled, but these
	    // are the ones that are *expected* to be seen, so we fast-path
	    // them.
	    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	    hostEndingChars = ['/', '?', '#'],
	    hostnameMaxLen = 255,
	    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
	    // protocols that can allow "unsafe" and "unwise" chars.
	    unsafeProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that never have a hostname.
	    hostlessProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that always contain a // bit.
	    slashedProtocol = {
	      'http': true,
	      'https': true,
	      'ftp': true,
	      'gopher': true,
	      'file': true,
	      'http:': true,
	      'https:': true,
	      'ftp:': true,
	      'gopher:': true,
	      'file:': true
	    },
	    querystring = __webpack_require__(35);
	
	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && util.isObject(url) && url instanceof Url) return url;
	
	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}
	
	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  if (!util.isString(url)) {
	    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
	  }
	
	  // Copy chrome, IE, opera backslash-handling behavior.
	  // Back slashes before the query string get converted to forward slashes
	  // See: https://code.google.com/p/chromium/issues/detail?id=25916
	  var queryIndex = url.indexOf('?'),
	      splitter =
	          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
	      uSplit = url.split(splitter),
	      slashRegex = /\\/g;
	  uSplit[0] = uSplit[0].replace(slashRegex, '/');
	  url = uSplit.join(splitter);
	
	  var rest = url;
	
	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();
	
	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    var simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      this.path = rest;
	      this.href = rest;
	      this.pathname = simplePath[1];
	      if (simplePath[2]) {
	        this.search = simplePath[2];
	        if (parseQueryString) {
	          this.query = querystring.parse(this.search.substr(1));
	        } else {
	          this.query = this.search.substr(1);
	        }
	      } else if (parseQueryString) {
	        this.search = '';
	        this.query = {};
	      }
	      return this;
	    }
	  }
	
	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    this.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }
	
	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }
	
	  if (!hostlessProtocol[proto] &&
	      (slashes || (proto && !slashedProtocol[proto]))) {
	
	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c
	
	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.
	
	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (var i = 0; i < hostEndingChars.length; i++) {
	      var hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	
	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }
	
	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = decodeURIComponent(auth);
	    }
	
	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (var i = 0; i < nonHostChars.length; i++) {
	      var hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;
	
	    this.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);
	
	    // pull out port.
	    this.parseHost();
	
	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';
	
	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = this.hostname[0] === '[' &&
	        this.hostname[this.hostname.length - 1] === ']';
	
	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = this.hostname.split(/\./);
	      for (var i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }
	
	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      this.hostname = this.hostname.toLowerCase();
	    }
	
	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a punycoded representation of "domain".
	      // It only converts parts of the domain name that
	      // have non-ASCII characters, i.e. it doesn't matter if
	      // you call it with a domain that already is ASCII-only.
	      this.hostname = punycode.toASCII(this.hostname);
	    }
	
	    var p = this.port ? ':' + this.port : '';
	    var h = this.hostname || '';
	    this.host = h + p;
	    this.href += this.host;
	
	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }
	
	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {
	
	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (var i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      if (rest.indexOf(ae) === -1)
	        continue;
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }
	
	
	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    this.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      this.query = querystring.parse(this.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    this.search = '';
	    this.query = {};
	  }
	  if (rest) this.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	      this.hostname && !this.pathname) {
	    this.pathname = '/';
	  }
	
	  //to support http.request
	  if (this.pathname || this.search) {
	    var p = this.pathname || '';
	    var s = this.search || '';
	    this.path = p + s;
	  }
	
	  // finally, reconstruct the href based on what has been validated.
	  this.href = this.format();
	  return this;
	};
	
	// format a parsed object into a url string
	function urlFormat(obj) {
	  // ensure it's an object, and not a string url.
	  // If it's an obj, this is a no-op.
	  // this way, you can call url_format() on strings
	  // to clean up potentially wonky urls.
	  if (util.isString(obj)) obj = urlParse(obj);
	  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
	  return obj.format();
	}
	
	Url.prototype.format = function() {
	  var auth = this.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }
	
	  var protocol = this.protocol || '',
	      pathname = this.pathname || '',
	      hash = this.hash || '',
	      host = false,
	      query = '';
	
	  if (this.host) {
	    host = auth + this.host;
	  } else if (this.hostname) {
	    host = auth + (this.hostname.indexOf(':') === -1 ?
	        this.hostname :
	        '[' + this.hostname + ']');
	    if (this.port) {
	      host += ':' + this.port;
	    }
	  }
	
	  if (this.query &&
	      util.isObject(this.query) &&
	      Object.keys(this.query).length) {
	    query = querystring.stringify(this.query);
	  }
	
	  var search = this.search || (query && ('?' + query)) || '';
	
	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';
	
	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (this.slashes ||
	      (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }
	
	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;
	
	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');
	
	  return protocol + host + pathname + search + hash;
	};
	
	function urlResolve(source, relative) {
	  return urlParse(source, false, true).resolve(relative);
	}
	
	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};
	
	function urlResolveObject(source, relative) {
	  if (!source) return relative;
	  return urlParse(source, false, true).resolveObject(relative);
	}
	
	Url.prototype.resolveObject = function(relative) {
	  if (util.isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }
	
	  var result = new Url();
	  var tkeys = Object.keys(this);
	  for (var tk = 0; tk < tkeys.length; tk++) {
	    var tkey = tkeys[tk];
	    result[tkey] = this[tkey];
	  }
	
	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;
	
	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }
	
	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    var rkeys = Object.keys(relative);
	    for (var rk = 0; rk < rkeys.length; rk++) {
	      var rkey = rkeys[rk];
	      if (rkey !== 'protocol')
	        result[rkey] = relative[rkey];
	    }
	
	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	        result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }
	
	    result.href = result.format();
	    return result;
	  }
	
	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      var keys = Object.keys(relative);
	      for (var v = 0; v < keys.length; v++) {
	        var k = keys[v];
	        result[k] = relative[k];
	      }
	      result.href = result.format();
	      return result;
	    }
	
	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      var relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }
	
	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	      isRelAbs = (
	          relative.host ||
	          relative.pathname && relative.pathname.charAt(0) === '/'
	      ),
	      mustEndAbs = (isRelAbs || isSourceAbs ||
	                    (result.host && relative.pathname)),
	      removeAllDots = mustEndAbs,
	      srcPath = result.pathname && result.pathname.split('/') || [],
	      relPath = relative.pathname && relative.pathname.split('/') || [],
	      psychotic = result.protocol && !slashedProtocol[result.protocol];
	
	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }
	
	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	                  relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	                      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!util.isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especially happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                       result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	                    (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	      (result.host || relative.host || srcPath.length > 1) &&
	      (last === '.' || last === '..') || last === '');
	
	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last === '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }
	
	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }
	
	  if (mustEndAbs && srcPath[0] !== '' &&
	      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }
	
	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }
	
	  var isAbsolute = srcPath[0] === '' ||
	      (srcPath[0] && srcPath[0].charAt(0) === '/');
	
	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	                                    srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especially happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                     result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }
	
	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);
	
	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }
	
	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }
	
	  //to support request.http
	  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	                  (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};
	
	Url.prototype.parseHost = function() {
	  var host = this.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) this.hostname = host;
	};


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/punycode v1.3.2 by @mathias */
	;(function(root) {
	
		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports &&
			!exports.nodeType && exports;
		var freeModule = typeof module == 'object' && module &&
			!module.nodeType && module;
		var freeGlobal = typeof global == 'object' && global;
		if (
			freeGlobal.global === freeGlobal ||
			freeGlobal.window === freeGlobal ||
			freeGlobal.self === freeGlobal
		) {
			root = freeGlobal;
		}
	
		/**
		 * The `punycode` object.
		 * @name punycode
		 * @type Object
		 */
		var punycode,
	
		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1
	
		/** Bootstring parameters */
		base = 36,
		tMin = 1,
		tMax = 26,
		skew = 38,
		damp = 700,
		initialBias = 72,
		initialN = 128, // 0x80
		delimiter = '-', // '\x2D'
	
		/** Regular expressions */
		regexPunycode = /^xn--/,
		regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators
	
		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},
	
		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		floor = Math.floor,
		stringFromCharCode = String.fromCharCode,
	
		/** Temporary variable */
		key;
	
		/*--------------------------------------------------------------------------*/
	
		/**
		 * A generic error utility function.
		 * @private
		 * @param {String} type The error type.
		 * @returns {Error} Throws a `RangeError` with the applicable error message.
		 */
		function error(type) {
			throw RangeError(errors[type]);
		}
	
		/**
		 * A generic `Array#map` utility function.
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} callback The function that gets called for every array
		 * item.
		 * @returns {Array} A new array of values returned by the callback function.
		 */
		function map(array, fn) {
			var length = array.length;
			var result = [];
			while (length--) {
				result[length] = fn(array[length]);
			}
			return result;
		}
	
		/**
		 * A simple `Array#map`-like wrapper to work with domain name strings or email
		 * addresses.
		 * @private
		 * @param {String} domain The domain name or email address.
		 * @param {Function} callback The function that gets called for every
		 * character.
		 * @returns {Array} A new string of characters returned by the callback
		 * function.
		 */
		function mapDomain(string, fn) {
			var parts = string.split('@');
			var result = '';
			if (parts.length > 1) {
				// In email addresses, only the domain name should be punycoded. Leave
				// the local part (i.e. everything up to `@`) intact.
				result = parts[0] + '@';
				string = parts[1];
			}
			// Avoid `split(regex)` for IE8 compatibility. See #17.
			string = string.replace(regexSeparators, '\x2E');
			var labels = string.split('.');
			var encoded = map(labels, fn).join('.');
			return result + encoded;
		}
	
		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}
	
		/**
		 * Creates a string based on an array of numeric code points.
		 * @see `punycode.ucs2.decode`
		 * @memberOf punycode.ucs2
		 * @name encode
		 * @param {Array} codePoints The array of numeric code points.
		 * @returns {String} The new Unicode string (UCS-2).
		 */
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}
	
		/**
		 * Converts a basic code point into a digit/integer.
		 * @see `digitToBasic()`
		 * @private
		 * @param {Number} codePoint The basic numeric code point value.
		 * @returns {Number} The numeric value of a basic code point (for use in
		 * representing integers) in the range `0` to `base - 1`, or `base` if
		 * the code point does not represent a value.
		 */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}
	
		/**
		 * Converts a digit/integer into a basic code point.
		 * @see `basicToDigit()`
		 * @private
		 * @param {Number} digit The numeric value of a basic code point.
		 * @returns {Number} The basic code point whose value (when used for
		 * representing integers) is `digit`, which needs to be in the range
		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		 * used; else, the lowercase form is used. The behavior is undefined
		 * if `flag` is non-zero and `digit` has no uppercase form.
		 */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}
	
		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * http://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}
	
		/**
		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The Punycode string of ASCII-only symbols.
		 * @returns {String} The resulting string of Unicode symbols.
		 */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,
			    /** Cached calculation results */
			    baseMinusT;
	
			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.
	
			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}
	
			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}
	
			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.
	
			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {
	
				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {
	
					if (index >= inputLength) {
						error('invalid-input');
					}
	
					digit = basicToDigit(input.charCodeAt(index++));
	
					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}
	
					i += digit * w;
					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	
					if (digit < t) {
						break;
					}
	
					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}
	
					w *= baseMinusT;
	
				}
	
				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);
	
				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}
	
				n += floor(i / out);
				i %= out;
	
				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);
	
			}
	
			return ucs2encode(output);
		}
	
		/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;
	
			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);
	
			// Cache the length
			inputLength = input.length;
	
			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;
	
			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}
	
			handledCPCount = basicLength = output.length;
	
			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.
	
			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}
	
			// Main encoding loop:
			while (handledCPCount < inputLength) {
	
				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}
	
				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}
	
				delta += (m - n) * handledCPCountPlusOne;
				n = m;
	
				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];
	
					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}
	
					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base; /* no condition */; k += base) {
							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(
								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = floor(qMinusT / baseMinusT);
						}
	
						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}
	
				++delta;
				++n;
	
			}
			return output.join('');
		}
	
		/**
		 * Converts a Punycode string representing a domain name or an email address
		 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
		 * it doesn't matter if you call it on a string that has already been
		 * converted to Unicode.
		 * @memberOf punycode
		 * @param {String} input The Punycoded domain name or email address to
		 * convert to Unicode.
		 * @returns {String} The Unicode representation of the given Punycode
		 * string.
		 */
		function toUnicode(input) {
			return mapDomain(input, function(string) {
				return regexPunycode.test(string)
					? decode(string.slice(4).toLowerCase())
					: string;
			});
		}
	
		/**
		 * Converts a Unicode string representing a domain name or an email address to
		 * Punycode. Only the non-ASCII parts of the domain name will be converted,
		 * i.e. it doesn't matter if you call it with a domain that's already in
		 * ASCII.
		 * @memberOf punycode
		 * @param {String} input The domain name or email address to convert, as a
		 * Unicode string.
		 * @returns {String} The Punycode representation of the given domain name or
		 * email address.
		 */
		function toASCII(input) {
			return mapDomain(input, function(string) {
				return regexNonASCII.test(string)
					? 'xn--' + encode(string)
					: string;
			});
		}
	
		/*--------------------------------------------------------------------------*/
	
		/** Define the public API */
		punycode = {
			/**
			 * A string representing the current Punycode.js version number.
			 * @memberOf punycode
			 * @type String
			 */
			'version': '1.3.2',
			/**
			 * An object of methods to convert from JavaScript's internal character
			 * representation (UCS-2) to Unicode code points, and back.
			 * @see <https://mathiasbynens.be/notes/javascript-encoding>
			 * @memberOf punycode
			 * @type Object
			 */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};
	
		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (freeExports && freeModule) {
			if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.punycode = punycode;
		}
	
	}(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(40)(module), (function() { return this; }())))

/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 41 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = {
	  isString: function(arg) {
	    return typeof(arg) === 'string';
	  },
	  isObject: function(arg) {
	    return typeof(arg) === 'object' && arg !== null;
	  },
	  isNull: function(arg) {
	    return arg === null;
	  },
	  isNullOrUndefined: function(arg) {
	    return arg == null;
	  }
	};


/***/ },
/* 42 */
/***/ function(module, exports) {

	module.exports = extend
	
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	
	function extend() {
	    var target = {}
	
	    for (var i = 0; i < arguments.length; i++) {
	        var source = arguments[i]
	
	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key]
	            }
	        }
	    }
	
	    return target
	}


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module http-transport
	 */
	'use strict';
	
	/*jshint -W079 */// Suppress warning about redefiniton of `Promise`
	var Promise = __webpack_require__( 44 ).Promise;
	
	var agent = __webpack_require__( 46 );
	var parseLinkHeader = __webpack_require__( 54 ).parse;
	var url = __webpack_require__( 38 );
	
	var WPRequest = __webpack_require__( 18 );
	var checkMethodSupport = __webpack_require__( 55 );
	var extend = __webpack_require__( 1 );
	var objectReduce = __webpack_require__( 4 );
	var isEmptyObject = __webpack_require__( 56 );
	
	/**
	 * Set any provided headers on the outgoing request object. Runs after _auth.
	 *
	 * @method _setHeaders
	 * @private
	 * @param {Object} request A superagent request object
	 * @param {Object} options A WPRequest _options object
	 * @param {Object} A superagent request object, with any available headers set
	 */
	function _setHeaders( request, options ) {
		// If there's no headers, do nothing
		if ( ! options.headers ) {
			return request;
		}
	
		return objectReduce( options.headers, function( request, value, key ) {
			return request.set( key, value );
		}, request );
	}
	
	/**
	 * Conditionally set basic authentication on a server request object.
	 *
	 * @method _auth
	 * @private
	 * @param {Object} request A superagent request object
	 * @param {Object} options A WPRequest _options object
	 * @param {Boolean} forceAuthentication whether to force authentication on the request
	 * @param {Object} A superagent request object, conditionally configured to use basic auth
	 */
	function _auth( request, options, forceAuthentication ) {
		// If we're not supposed to authenticate, don't even start
		if ( ! forceAuthentication && ! options.auth && ! options.nonce ) {
			return request;
		}
	
		// Enable nonce in options for Cookie authentication http://wp-api.org/guides/authentication.html
		if ( options.nonce ) {
			request.set( 'X-WP-Nonce', options.nonce );
			return request;
		}
	
		// Retrieve the username & password from the request options if they weren't provided
		var username = username || options.username;
		var password = password || options.password;
	
		// If no username or no password, can't authenticate
		if ( ! username || ! password ) {
			return request;
		}
	
		// Can authenticate: set basic auth parameters on the request
		return request.auth( username, password );
	}
	
	// Pagination-Related Helpers
	// ==========================
	
	/**
	 * Combine the API endpoint root URI and link URI into a valid request URL.
	 * Endpoints are generally a full path to the JSON API's root endpoint, such
	 * as `website.com/wp-json`: the link headers, however, are returned as root-
	 * relative paths. Concatenating these would generate a URL such as
	 * `website.com/wp-json/wp-json/posts?page=2`: we must intelligently merge the
	 * URI strings in order to generate a valid new request URL.
	 *
	 * @private
	 * @param endpoint {String} The endpoint URL for the REST API root
	 * @param linkPath {String} A root-relative link path to an API request
	 * @returns {String} The full URL path to the provided link
	 */
	function mergeUrl( endpoint, linkPath ) {
		var request = url.parse( endpoint );
		linkPath = url.parse( linkPath, true );
	
		// Overwrite relevant request URL object properties with the link's values:
		// Setting these three values from the link will ensure proper URL generation
		request.query = linkPath.query;
		request.search = linkPath.search;
		request.pathname = linkPath.pathname;
	
		// Reassemble and return the merged URL
		return url.format( request );
	}
	
	/**
	 * Extract the body property from the superagent response, or else try to parse
	 * the response text to get a JSON object.
	 *
	 * @private
	 * @param {Object} response      The response object from the HTTP request
	 * @param {String} response.text The response content as text
	 * @param {Object} response.body The response content as a JS object
	 * @returns {Object} The response content as a JS object
	 */
	function extractResponseBody( response ) {
		var responseBody = response.body;
		if ( isEmptyObject( responseBody ) && response.type === 'text/html' ) {
			// Response may have come back as HTML due to caching plugin; try to parse
			// the response text into JSON
			try {
				responseBody = JSON.parse( response.text );
			} catch ( e ) {
				// Swallow errors, it's OK to fall back to returning the body
			}
		}
		return responseBody;
	}
	
	/**
	 * If the response is not paged, return the body as-is. If pagination
	 * information is present in the response headers, parse those headers into
	 * a custom `_paging` property on the response body. `_paging` contains links
	 * to the previous and next pages in the collection, as well as metadata
	 * about the size and number of pages in the collection.
	 *
	 * The structure of the `_paging` property is as follows:
	 *
	 * - `total` {Integer} The total number of records in the collection
	 * - `totalPages` {Integer} The number of pages available
	 * - `links` {Object} The parsed "links" headers, separated into individual URI strings
	 * - `next` {WPRequest} A WPRequest object bound to the "next" page (if page exists)
	 * - `prev` {WPRequest} A WPRequest object bound to the "previous" page (if page exists)
	 *
	 * @private
	 * @param {Object} result           The response object from the HTTP request
	 * @param {Object} options          The options hash from the original request
	 * @param {String} options.endpoint The base URL of the requested API endpoint
	 * @param {Object} httpTransport    The HTTP transport object used by the original request
	 * @returns {Object} The pagination metadata object for this HTTP request, or else null
	 */
	function createPaginationObject( result, options, httpTransport ) {
		var _paging = null;
	
		if ( ! result.headers || ! result.headers[ 'x-wp-totalpages' ] ) {
			// No headers: return as-is
			return _paging;
		}
	
		var totalPages = result.headers[ 'x-wp-totalpages' ];
	
		if ( ! totalPages || totalPages === '0' ) {
			// No paging: return as-is
			return _paging;
		}
	
		// Decode the link header object
		var links = result.headers.link ? parseLinkHeader( result.headers.link ) : {};
	
		// Store pagination data from response headers on the response collection
		_paging = {
			total: result.headers[ 'x-wp-total' ],
			totalPages: totalPages,
			links: links
		};
	
		// Re-use any options from the original request, updating only the endpoint
		// (this ensures that request properties like authentication are preserved)
		var endpoint = options.endpoint;
	
		// Create a WPRequest instance pre-bound to the "next" page, if available
		if ( links.next ) {
			_paging.next = new WPRequest( extend( {}, options, {
				transport: httpTransport,
				endpoint: mergeUrl( endpoint, links.next )
			}));
		}
	
		// Create a WPRequest instance pre-bound to the "prev" page, if available
		if ( links.prev ) {
			_paging.prev = new WPRequest( extend( {}, options, {
				transport: httpTransport,
				endpoint: mergeUrl( endpoint, links.prev )
			}));
		}
	
		return _paging;
	}
	
	// HTTP-Related Helpers
	// ====================
	
	/**
	 * Submit the provided superagent request object, invoke a callback (if it was
	 * provided), and return a promise to the response from the HTTP request.
	 *
	 * @private
	 * @param {Object} request A superagent request object
	 * @param {Function} callback A callback function (optional)
	 * @param {Function} transform A function to transform the result data
	 * @returns {Promise} A promise to the superagent request
	 */
	function invokeAndPromisify( request, callback, transform ) {
		return new Promise(function( resolve, reject ) {
			// Fire off the result
			request.end(function( err, result ) {
	
				// Return the results as a promise
				if ( err || result.error ) {
					reject( err || result.error );
				} else {
					resolve( result );
				}
			});
		}).then( transform ).then(function( result ) {
			// If a node-style callback was provided, call it, but also return the
			// result value for use via the returned Promise
			if ( callback && typeof callback === 'function' ) {
				callback( null, result );
			}
			return result;
		}, function( err ) {
			// If the API provided an error object, it will be available within the
			// superagent response object as response.body (containing the response
			// JSON). If that object exists, it will have a .code property if it is
			// truly an API error (non-API errors will not have a .code).
			if ( err.response && err.response.body && err.response.body.code ) {
				// Forward API error response JSON on to the calling method: omit
				// all transport-specific (superagent-specific) properties
				err = err.response.body;
			}
			// If a callback was provided, ensure it is called with the error; otherwise
			// re-throw the error so that it can be handled by a Promise .catch or .then
			if ( callback && typeof callback === 'function' ) {
				callback( err );
			} else {
				throw err;
			}
		});
	}
	
	/**
	 * Return the body of the request, augmented with pagination information if the
	 * result is a paged collection.
	 *
	 * @private
	 * @param {WPRequest} wpreq The WPRequest representing the returned HTTP response
	 * @param {Object} result The results from the HTTP request
	 * @returns {Object} The "body" property of the result, conditionally augmented with
	 *                  pagination information if the result is a partial collection.
	 */
	function returnBody( wpreq, result ) {
		var body = extractResponseBody( result );
		var _paging = createPaginationObject( result, wpreq._options, wpreq.transport );
		if ( _paging ) {
			body._paging = _paging;
		}
		return body;
	}
	
	/**
	 * Extract and return the headers property from a superagent response object
	 *
	 * @private
	 * @param {Object} result The results from the HTTP request
	 * @returns {Object} The "headers" property of the result
	 */
	function returnHeaders( result ) {
		return result.headers;
	}
	
	// HTTP Methods: Private HTTP-verb versions
	// ========================================
	
	/**
	 * @method get
	 * @async
	 * @param {WPRequest} wpreq A WPRequest query object
	 * @param {Function} [callback] A callback to invoke with the results of the GET request
	 * @returns {Promise} A promise to the results of the HTTP request
	 */
	function _httpGet( wpreq, callback ) {
		checkMethodSupport( 'get', wpreq );
		var url = wpreq.toString();
	
		var request = _auth( agent.get( url ), wpreq._options );
		request = _setHeaders( request, wpreq._options );
	
		return invokeAndPromisify( request, callback, returnBody.bind( null, wpreq ) );
	}
	
	/**
	 * Invoke an HTTP "POST" request against the provided endpoint
	 * @method post
	 * @async
	 * @param {WPRequest} wpreq A WPRequest query object
	 * @param {Object} data The data for the POST request
	 * @param {Function} [callback] A callback to invoke with the results of the POST request
	 * @returns {Promise} A promise to the results of the HTTP request
	 */
	function _httpPost( wpreq, data, callback ) {
		checkMethodSupport( 'post', wpreq );
		var url = wpreq.toString();
		data = data || {};
		var request = _auth( agent.post( url ), wpreq._options, true );
		request = _setHeaders( request, wpreq._options );
	
		if ( wpreq._attachment ) {
			// Data must be form-encoded alongside image attachment
			request = objectReduce( data, function( req, value, key ) {
				return req.field( key, value );
			}, request.attach( 'file', wpreq._attachment, wpreq._attachmentName ) );
		} else {
			request = request.send( data );
		}
	
		return invokeAndPromisify( request, callback, returnBody.bind( null, wpreq ) );
	}
	
	/**
	 * @method put
	 * @async
	 * @param {WPRequest} wpreq A WPRequest query object
	 * @param {Object} data The data for the PUT request
	 * @param {Function} [callback] A callback to invoke with the results of the PUT request
	 * @returns {Promise} A promise to the results of the HTTP request
	 */
	function _httpPut( wpreq, data, callback ) {
		checkMethodSupport( 'put', wpreq );
		var url = wpreq.toString();
		data = data || {};
	
		var request = _auth( agent.put( url ), wpreq._options, true ).send( data );
		request = _setHeaders( request, wpreq._options );
	
		return invokeAndPromisify( request, callback, returnBody.bind( null, wpreq ) );
	}
	
	/**
	 * @method delete
	 * @async
	 * @param {WPRequest} wpreq A WPRequest query object
	 * @param {Object} [data] Data to send along with the DELETE request
	 * @param {Function} [callback] A callback to invoke with the results of the DELETE request
	 * @returns {Promise} A promise to the results of the HTTP request
	 */
	function _httpDelete( wpreq, data, callback ) {
		if ( ! callback && typeof data === 'function' ) {
			callback = data;
			data = null;
		}
		checkMethodSupport( 'delete', wpreq );
		var url = wpreq.toString();
		var request = _auth( agent.del( url ), wpreq._options, true ).send( data );
		request = _setHeaders( request, wpreq._options );
	
		return invokeAndPromisify( request, callback, returnBody.bind( null, wpreq ) );
	}
	
	/**
	 * @method head
	 * @async
	 * @param {WPRequest} wpreq A WPRequest query object
	 * @param {Function} [callback] A callback to invoke with the results of the HEAD request
	 * @returns {Promise} A promise to the header results of the HTTP request
	 */
	function _httpHead( wpreq, callback ) {
		checkMethodSupport( 'head', wpreq );
		var url = wpreq.toString();
		var request = _auth( agent.head( url ), wpreq._options );
		request = _setHeaders( request, wpreq._options );
	
		return invokeAndPromisify( request, callback, returnHeaders );
	}
	
	module.exports = {
		delete: _httpDelete,
		get: _httpGet,
		head: _httpHead,
		post: _httpPost,
		put: _httpPut
	};


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var require;/* WEBPACK VAR INJECTION */(function(process, global) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
	 * @version   3.3.1
	 */
	
	(function (global, factory) {
	     true ? module.exports = factory() :
	    typeof define === 'function' && define.amd ? define(factory) :
	    (global.ES6Promise = factory());
	}(this, (function () { 'use strict';
	
	function objectOrFunction(x) {
	  return typeof x === 'function' || typeof x === 'object' && x !== null;
	}
	
	function isFunction(x) {
	  return typeof x === 'function';
	}
	
	var _isArray = undefined;
	if (!Array.isArray) {
	  _isArray = function (x) {
	    return Object.prototype.toString.call(x) === '[object Array]';
	  };
	} else {
	  _isArray = Array.isArray;
	}
	
	var isArray = _isArray;
	
	var len = 0;
	var vertxNext = undefined;
	var customSchedulerFn = undefined;
	
	var asap = function asap(callback, arg) {
	  queue[len] = callback;
	  queue[len + 1] = arg;
	  len += 2;
	  if (len === 2) {
	    // If len is 2, that means that we need to schedule an async flush.
	    // If additional callbacks are queued before the queue is flushed, they
	    // will be processed by this flush that we are scheduling.
	    if (customSchedulerFn) {
	      customSchedulerFn(flush);
	    } else {
	      scheduleFlush();
	    }
	  }
	};
	
	function setScheduler(scheduleFn) {
	  customSchedulerFn = scheduleFn;
	}
	
	function setAsap(asapFn) {
	  asap = asapFn;
	}
	
	var browserWindow = typeof window !== 'undefined' ? window : undefined;
	var browserGlobal = browserWindow || {};
	var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
	var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';
	
	// test for web worker but not in IE10
	var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
	
	// node
	function useNextTick() {
	  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	  // see https://github.com/cujojs/when/issues/410 for details
	  return function () {
	    return process.nextTick(flush);
	  };
	}
	
	// vertx
	function useVertxTimer() {
	  return function () {
	    vertxNext(flush);
	  };
	}
	
	function useMutationObserver() {
	  var iterations = 0;
	  var observer = new BrowserMutationObserver(flush);
	  var node = document.createTextNode('');
	  observer.observe(node, { characterData: true });
	
	  return function () {
	    node.data = iterations = ++iterations % 2;
	  };
	}
	
	// web worker
	function useMessageChannel() {
	  var channel = new MessageChannel();
	  channel.port1.onmessage = flush;
	  return function () {
	    return channel.port2.postMessage(0);
	  };
	}
	
	function useSetTimeout() {
	  // Store setTimeout reference so es6-promise will be unaffected by
	  // other code modifying setTimeout (like sinon.useFakeTimers())
	  var globalSetTimeout = setTimeout;
	  return function () {
	    return globalSetTimeout(flush, 1);
	  };
	}
	
	var queue = new Array(1000);
	function flush() {
	  for (var i = 0; i < len; i += 2) {
	    var callback = queue[i];
	    var arg = queue[i + 1];
	
	    callback(arg);
	
	    queue[i] = undefined;
	    queue[i + 1] = undefined;
	  }
	
	  len = 0;
	}
	
	function attemptVertx() {
	  try {
	    var r = require;
	    var vertx = __webpack_require__(45);
	    vertxNext = vertx.runOnLoop || vertx.runOnContext;
	    return useVertxTimer();
	  } catch (e) {
	    return useSetTimeout();
	  }
	}
	
	var scheduleFlush = undefined;
	// Decide what async method to use to triggering processing of queued callbacks:
	if (isNode) {
	  scheduleFlush = useNextTick();
	} else if (BrowserMutationObserver) {
	  scheduleFlush = useMutationObserver();
	} else if (isWorker) {
	  scheduleFlush = useMessageChannel();
	} else if (browserWindow === undefined && "function" === 'function') {
	  scheduleFlush = attemptVertx();
	} else {
	  scheduleFlush = useSetTimeout();
	}
	
	function then(onFulfillment, onRejection) {
	  var _arguments = arguments;
	
	  var parent = this;
	
	  var child = new this.constructor(noop);
	
	  if (child[PROMISE_ID] === undefined) {
	    makePromise(child);
	  }
	
	  var _state = parent._state;
	
	  if (_state) {
	    (function () {
	      var callback = _arguments[_state - 1];
	      asap(function () {
	        return invokeCallback(_state, child, callback, parent._result);
	      });
	    })();
	  } else {
	    subscribe(parent, child, onFulfillment, onRejection);
	  }
	
	  return child;
	}
	
	/**
	  `Promise.resolve` returns a promise that will become resolved with the
	  passed `value`. It is shorthand for the following:
	
	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    resolve(1);
	  });
	
	  promise.then(function(value){
	    // value === 1
	  });
	  ```
	
	  Instead of writing the above, your code now simply becomes the following:
	
	  ```javascript
	  let promise = Promise.resolve(1);
	
	  promise.then(function(value){
	    // value === 1
	  });
	  ```
	
	  @method resolve
	  @static
	  @param {Any} value value that the returned promise will be resolved with
	  Useful for tooling.
	  @return {Promise} a promise that will become fulfilled with the given
	  `value`
	*/
	function resolve(object) {
	  /*jshint validthis:true */
	  var Constructor = this;
	
	  if (object && typeof object === 'object' && object.constructor === Constructor) {
	    return object;
	  }
	
	  var promise = new Constructor(noop);
	  _resolve(promise, object);
	  return promise;
	}
	
	var PROMISE_ID = Math.random().toString(36).substring(16);
	
	function noop() {}
	
	var PENDING = void 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	
	var GET_THEN_ERROR = new ErrorObject();
	
	function selfFulfillment() {
	  return new TypeError("You cannot resolve a promise with itself");
	}
	
	function cannotReturnOwn() {
	  return new TypeError('A promises callback cannot return that same promise.');
	}
	
	function getThen(promise) {
	  try {
	    return promise.then;
	  } catch (error) {
	    GET_THEN_ERROR.error = error;
	    return GET_THEN_ERROR;
	  }
	}
	
	function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	  try {
	    then.call(value, fulfillmentHandler, rejectionHandler);
	  } catch (e) {
	    return e;
	  }
	}
	
	function handleForeignThenable(promise, thenable, then) {
	  asap(function (promise) {
	    var sealed = false;
	    var error = tryThen(then, thenable, function (value) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;
	      if (thenable !== value) {
	        _resolve(promise, value);
	      } else {
	        fulfill(promise, value);
	      }
	    }, function (reason) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;
	
	      _reject(promise, reason);
	    }, 'Settle: ' + (promise._label || ' unknown promise'));
	
	    if (!sealed && error) {
	      sealed = true;
	      _reject(promise, error);
	    }
	  }, promise);
	}
	
	function handleOwnThenable(promise, thenable) {
	  if (thenable._state === FULFILLED) {
	    fulfill(promise, thenable._result);
	  } else if (thenable._state === REJECTED) {
	    _reject(promise, thenable._result);
	  } else {
	    subscribe(thenable, undefined, function (value) {
	      return _resolve(promise, value);
	    }, function (reason) {
	      return _reject(promise, reason);
	    });
	  }
	}
	
	function handleMaybeThenable(promise, maybeThenable, then$$) {
	  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
	    handleOwnThenable(promise, maybeThenable);
	  } else {
	    if (then$$ === GET_THEN_ERROR) {
	      _reject(promise, GET_THEN_ERROR.error);
	    } else if (then$$ === undefined) {
	      fulfill(promise, maybeThenable);
	    } else if (isFunction(then$$)) {
	      handleForeignThenable(promise, maybeThenable, then$$);
	    } else {
	      fulfill(promise, maybeThenable);
	    }
	  }
	}
	
	function _resolve(promise, value) {
	  if (promise === value) {
	    _reject(promise, selfFulfillment());
	  } else if (objectOrFunction(value)) {
	    handleMaybeThenable(promise, value, getThen(value));
	  } else {
	    fulfill(promise, value);
	  }
	}
	
	function publishRejection(promise) {
	  if (promise._onerror) {
	    promise._onerror(promise._result);
	  }
	
	  publish(promise);
	}
	
	function fulfill(promise, value) {
	  if (promise._state !== PENDING) {
	    return;
	  }
	
	  promise._result = value;
	  promise._state = FULFILLED;
	
	  if (promise._subscribers.length !== 0) {
	    asap(publish, promise);
	  }
	}
	
	function _reject(promise, reason) {
	  if (promise._state !== PENDING) {
	    return;
	  }
	  promise._state = REJECTED;
	  promise._result = reason;
	
	  asap(publishRejection, promise);
	}
	
	function subscribe(parent, child, onFulfillment, onRejection) {
	  var _subscribers = parent._subscribers;
	  var length = _subscribers.length;
	
	  parent._onerror = null;
	
	  _subscribers[length] = child;
	  _subscribers[length + FULFILLED] = onFulfillment;
	  _subscribers[length + REJECTED] = onRejection;
	
	  if (length === 0 && parent._state) {
	    asap(publish, parent);
	  }
	}
	
	function publish(promise) {
	  var subscribers = promise._subscribers;
	  var settled = promise._state;
	
	  if (subscribers.length === 0) {
	    return;
	  }
	
	  var child = undefined,
	      callback = undefined,
	      detail = promise._result;
	
	  for (var i = 0; i < subscribers.length; i += 3) {
	    child = subscribers[i];
	    callback = subscribers[i + settled];
	
	    if (child) {
	      invokeCallback(settled, child, callback, detail);
	    } else {
	      callback(detail);
	    }
	  }
	
	  promise._subscribers.length = 0;
	}
	
	function ErrorObject() {
	  this.error = null;
	}
	
	var TRY_CATCH_ERROR = new ErrorObject();
	
	function tryCatch(callback, detail) {
	  try {
	    return callback(detail);
	  } catch (e) {
	    TRY_CATCH_ERROR.error = e;
	    return TRY_CATCH_ERROR;
	  }
	}
	
	function invokeCallback(settled, promise, callback, detail) {
	  var hasCallback = isFunction(callback),
	      value = undefined,
	      error = undefined,
	      succeeded = undefined,
	      failed = undefined;
	
	  if (hasCallback) {
	    value = tryCatch(callback, detail);
	
	    if (value === TRY_CATCH_ERROR) {
	      failed = true;
	      error = value.error;
	      value = null;
	    } else {
	      succeeded = true;
	    }
	
	    if (promise === value) {
	      _reject(promise, cannotReturnOwn());
	      return;
	    }
	  } else {
	    value = detail;
	    succeeded = true;
	  }
	
	  if (promise._state !== PENDING) {
	    // noop
	  } else if (hasCallback && succeeded) {
	      _resolve(promise, value);
	    } else if (failed) {
	      _reject(promise, error);
	    } else if (settled === FULFILLED) {
	      fulfill(promise, value);
	    } else if (settled === REJECTED) {
	      _reject(promise, value);
	    }
	}
	
	function initializePromise(promise, resolver) {
	  try {
	    resolver(function resolvePromise(value) {
	      _resolve(promise, value);
	    }, function rejectPromise(reason) {
	      _reject(promise, reason);
	    });
	  } catch (e) {
	    _reject(promise, e);
	  }
	}
	
	var id = 0;
	function nextId() {
	  return id++;
	}
	
	function makePromise(promise) {
	  promise[PROMISE_ID] = id++;
	  promise._state = undefined;
	  promise._result = undefined;
	  promise._subscribers = [];
	}
	
	function Enumerator(Constructor, input) {
	  this._instanceConstructor = Constructor;
	  this.promise = new Constructor(noop);
	
	  if (!this.promise[PROMISE_ID]) {
	    makePromise(this.promise);
	  }
	
	  if (isArray(input)) {
	    this._input = input;
	    this.length = input.length;
	    this._remaining = input.length;
	
	    this._result = new Array(this.length);
	
	    if (this.length === 0) {
	      fulfill(this.promise, this._result);
	    } else {
	      this.length = this.length || 0;
	      this._enumerate();
	      if (this._remaining === 0) {
	        fulfill(this.promise, this._result);
	      }
	    }
	  } else {
	    _reject(this.promise, validationError());
	  }
	}
	
	function validationError() {
	  return new Error('Array Methods must be provided an Array');
	};
	
	Enumerator.prototype._enumerate = function () {
	  var length = this.length;
	  var _input = this._input;
	
	  for (var i = 0; this._state === PENDING && i < length; i++) {
	    this._eachEntry(_input[i], i);
	  }
	};
	
	Enumerator.prototype._eachEntry = function (entry, i) {
	  var c = this._instanceConstructor;
	  var resolve$$ = c.resolve;
	
	  if (resolve$$ === resolve) {
	    var _then = getThen(entry);
	
	    if (_then === then && entry._state !== PENDING) {
	      this._settledAt(entry._state, i, entry._result);
	    } else if (typeof _then !== 'function') {
	      this._remaining--;
	      this._result[i] = entry;
	    } else if (c === Promise) {
	      var promise = new c(noop);
	      handleMaybeThenable(promise, entry, _then);
	      this._willSettleAt(promise, i);
	    } else {
	      this._willSettleAt(new c(function (resolve$$) {
	        return resolve$$(entry);
	      }), i);
	    }
	  } else {
	    this._willSettleAt(resolve$$(entry), i);
	  }
	};
	
	Enumerator.prototype._settledAt = function (state, i, value) {
	  var promise = this.promise;
	
	  if (promise._state === PENDING) {
	    this._remaining--;
	
	    if (state === REJECTED) {
	      _reject(promise, value);
	    } else {
	      this._result[i] = value;
	    }
	  }
	
	  if (this._remaining === 0) {
	    fulfill(promise, this._result);
	  }
	};
	
	Enumerator.prototype._willSettleAt = function (promise, i) {
	  var enumerator = this;
	
	  subscribe(promise, undefined, function (value) {
	    return enumerator._settledAt(FULFILLED, i, value);
	  }, function (reason) {
	    return enumerator._settledAt(REJECTED, i, reason);
	  });
	};
	
	/**
	  `Promise.all` accepts an array of promises, and returns a new promise which
	  is fulfilled with an array of fulfillment values for the passed promises, or
	  rejected with the reason of the first passed promise to be rejected. It casts all
	  elements of the passed iterable to promises as it runs this algorithm.
	
	  Example:
	
	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = resolve(2);
	  let promise3 = resolve(3);
	  let promises = [ promise1, promise2, promise3 ];
	
	  Promise.all(promises).then(function(array){
	    // The array here would be [ 1, 2, 3 ];
	  });
	  ```
	
	  If any of the `promises` given to `all` are rejected, the first promise
	  that is rejected will be given as an argument to the returned promises's
	  rejection handler. For example:
	
	  Example:
	
	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = reject(new Error("2"));
	  let promise3 = reject(new Error("3"));
	  let promises = [ promise1, promise2, promise3 ];
	
	  Promise.all(promises).then(function(array){
	    // Code here never runs because there are rejected promises!
	  }, function(error) {
	    // error.message === "2"
	  });
	  ```
	
	  @method all
	  @static
	  @param {Array} entries array of promises
	  @param {String} label optional string for labeling the promise.
	  Useful for tooling.
	  @return {Promise} promise that is fulfilled when all `promises` have been
	  fulfilled, or rejected if any of them become rejected.
	  @static
	*/
	function all(entries) {
	  return new Enumerator(this, entries).promise;
	}
	
	/**
	  `Promise.race` returns a new promise which is settled in the same way as the
	  first passed promise to settle.
	
	  Example:
	
	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });
	
	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 2');
	    }, 100);
	  });
	
	  Promise.race([promise1, promise2]).then(function(result){
	    // result === 'promise 2' because it was resolved before promise1
	    // was resolved.
	  });
	  ```
	
	  `Promise.race` is deterministic in that only the state of the first
	  settled promise matters. For example, even if other promises given to the
	  `promises` array argument are resolved, but the first settled promise has
	  become rejected before the other promises became fulfilled, the returned
	  promise will become rejected:
	
	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });
	
	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      reject(new Error('promise 2'));
	    }, 100);
	  });
	
	  Promise.race([promise1, promise2]).then(function(result){
	    // Code here never runs
	  }, function(reason){
	    // reason.message === 'promise 2' because promise 2 became rejected before
	    // promise 1 became fulfilled
	  });
	  ```
	
	  An example real-world use case is implementing timeouts:
	
	  ```javascript
	  Promise.race([ajax('foo.json'), timeout(5000)])
	  ```
	
	  @method race
	  @static
	  @param {Array} promises array of promises to observe
	  Useful for tooling.
	  @return {Promise} a promise which settles in the same way as the first passed
	  promise to settle.
	*/
	function race(entries) {
	  /*jshint validthis:true */
	  var Constructor = this;
	
	  if (!isArray(entries)) {
	    return new Constructor(function (_, reject) {
	      return reject(new TypeError('You must pass an array to race.'));
	    });
	  } else {
	    return new Constructor(function (resolve, reject) {
	      var length = entries.length;
	      for (var i = 0; i < length; i++) {
	        Constructor.resolve(entries[i]).then(resolve, reject);
	      }
	    });
	  }
	}
	
	/**
	  `Promise.reject` returns a promise rejected with the passed `reason`.
	  It is shorthand for the following:
	
	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    reject(new Error('WHOOPS'));
	  });
	
	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```
	
	  Instead of writing the above, your code now simply becomes the following:
	
	  ```javascript
	  let promise = Promise.reject(new Error('WHOOPS'));
	
	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```
	
	  @method reject
	  @static
	  @param {Any} reason value that the returned promise will be rejected with.
	  Useful for tooling.
	  @return {Promise} a promise rejected with the given `reason`.
	*/
	function reject(reason) {
	  /*jshint validthis:true */
	  var Constructor = this;
	  var promise = new Constructor(noop);
	  _reject(promise, reason);
	  return promise;
	}
	
	function needsResolver() {
	  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	}
	
	function needsNew() {
	  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	}
	
	/**
	  Promise objects represent the eventual result of an asynchronous operation. The
	  primary way of interacting with a promise is through its `then` method, which
	  registers callbacks to receive either a promise's eventual value or the reason
	  why the promise cannot be fulfilled.
	
	  Terminology
	  -----------
	
	  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	  - `thenable` is an object or function that defines a `then` method.
	  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	  - `exception` is a value that is thrown using the throw statement.
	  - `reason` is a value that indicates why a promise was rejected.
	  - `settled` the final resting state of a promise, fulfilled or rejected.
	
	  A promise can be in one of three states: pending, fulfilled, or rejected.
	
	  Promises that are fulfilled have a fulfillment value and are in the fulfilled
	  state.  Promises that are rejected have a rejection reason and are in the
	  rejected state.  A fulfillment value is never a thenable.
	
	  Promises can also be said to *resolve* a value.  If this value is also a
	  promise, then the original promise's settled state will match the value's
	  settled state.  So a promise that *resolves* a promise that rejects will
	  itself reject, and a promise that *resolves* a promise that fulfills will
	  itself fulfill.
	
	
	  Basic Usage:
	  ------------
	
	  ```js
	  let promise = new Promise(function(resolve, reject) {
	    // on success
	    resolve(value);
	
	    // on failure
	    reject(reason);
	  });
	
	  promise.then(function(value) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```
	
	  Advanced Usage:
	  ---------------
	
	  Promises shine when abstracting away asynchronous interactions such as
	  `XMLHttpRequest`s.
	
	  ```js
	  function getJSON(url) {
	    return new Promise(function(resolve, reject){
	      let xhr = new XMLHttpRequest();
	
	      xhr.open('GET', url);
	      xhr.onreadystatechange = handler;
	      xhr.responseType = 'json';
	      xhr.setRequestHeader('Accept', 'application/json');
	      xhr.send();
	
	      function handler() {
	        if (this.readyState === this.DONE) {
	          if (this.status === 200) {
	            resolve(this.response);
	          } else {
	            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	          }
	        }
	      };
	    });
	  }
	
	  getJSON('/posts.json').then(function(json) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```
	
	  Unlike callbacks, promises are great composable primitives.
	
	  ```js
	  Promise.all([
	    getJSON('/posts'),
	    getJSON('/comments')
	  ]).then(function(values){
	    values[0] // => postsJSON
	    values[1] // => commentsJSON
	
	    return values;
	  });
	  ```
	
	  @class Promise
	  @param {function} resolver
	  Useful for tooling.
	  @constructor
	*/
	function Promise(resolver) {
	  this[PROMISE_ID] = nextId();
	  this._result = this._state = undefined;
	  this._subscribers = [];
	
	  if (noop !== resolver) {
	    typeof resolver !== 'function' && needsResolver();
	    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
	  }
	}
	
	Promise.all = all;
	Promise.race = race;
	Promise.resolve = resolve;
	Promise.reject = reject;
	Promise._setScheduler = setScheduler;
	Promise._setAsap = setAsap;
	Promise._asap = asap;
	
	Promise.prototype = {
	  constructor: Promise,
	
	  /**
	    The primary way of interacting with a promise is through its `then` method,
	    which registers callbacks to receive either a promise's eventual value or the
	    reason why the promise cannot be fulfilled.
	  
	    ```js
	    findUser().then(function(user){
	      // user is available
	    }, function(reason){
	      // user is unavailable, and you are given the reason why
	    });
	    ```
	  
	    Chaining
	    --------
	  
	    The return value of `then` is itself a promise.  This second, 'downstream'
	    promise is resolved with the return value of the first promise's fulfillment
	    or rejection handler, or rejected if the handler throws an exception.
	  
	    ```js
	    findUser().then(function (user) {
	      return user.name;
	    }, function (reason) {
	      return 'default name';
	    }).then(function (userName) {
	      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	      // will be `'default name'`
	    });
	  
	    findUser().then(function (user) {
	      throw new Error('Found user, but still unhappy');
	    }, function (reason) {
	      throw new Error('`findUser` rejected and we're unhappy');
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	    });
	    ```
	    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	  
	    ```js
	    findUser().then(function (user) {
	      throw new PedagogicalException('Upstream error');
	    }).then(function (value) {
	      // never reached
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // The `PedgagocialException` is propagated all the way down to here
	    });
	    ```
	  
	    Assimilation
	    ------------
	  
	    Sometimes the value you want to propagate to a downstream promise can only be
	    retrieved asynchronously. This can be achieved by returning a promise in the
	    fulfillment or rejection handler. The downstream promise will then be pending
	    until the returned promise is settled. This is called *assimilation*.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // The user's comments are now available
	    });
	    ```
	  
	    If the assimliated promise rejects, then the downstream promise will also reject.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // If `findCommentsByAuthor` fulfills, we'll have the value here
	    }, function (reason) {
	      // If `findCommentsByAuthor` rejects, we'll have the reason here
	    });
	    ```
	  
	    Simple Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let result;
	  
	    try {
	      result = findResult();
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	    findResult(function(result, err){
	      if (err) {
	        // failure
	      } else {
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findResult().then(function(result){
	      // success
	    }, function(reason){
	      // failure
	    });
	    ```
	  
	    Advanced Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let author, books;
	  
	    try {
	      author = findAuthor();
	      books  = findBooksByAuthor(author);
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	  
	    function foundBooks(books) {
	  
	    }
	  
	    function failure(reason) {
	  
	    }
	  
	    findAuthor(function(author, err){
	      if (err) {
	        failure(err);
	        // failure
	      } else {
	        try {
	          findBoooksByAuthor(author, function(books, err) {
	            if (err) {
	              failure(err);
	            } else {
	              try {
	                foundBooks(books);
	              } catch(reason) {
	                failure(reason);
	              }
	            }
	          });
	        } catch(error) {
	          failure(err);
	        }
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findAuthor().
	      then(findBooksByAuthor).
	      then(function(books){
	        // found books
	    }).catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method then
	    @param {Function} onFulfilled
	    @param {Function} onRejected
	    Useful for tooling.
	    @return {Promise}
	  */
	  then: then,
	
	  /**
	    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	    as the catch block of a try/catch statement.
	  
	    ```js
	    function findAuthor(){
	      throw new Error('couldn't find that author');
	    }
	  
	    // synchronous
	    try {
	      findAuthor();
	    } catch(reason) {
	      // something went wrong
	    }
	  
	    // async with promises
	    findAuthor().catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method catch
	    @param {Function} onRejection
	    Useful for tooling.
	    @return {Promise}
	  */
	  'catch': function _catch(onRejection) {
	    return this.then(null, onRejection);
	  }
	};
	
	function polyfill() {
	    var local = undefined;
	
	    if (typeof global !== 'undefined') {
	        local = global;
	    } else if (typeof self !== 'undefined') {
	        local = self;
	    } else {
	        try {
	            local = Function('return this')();
	        } catch (e) {
	            throw new Error('polyfill failed because global object is unavailable in this environment');
	        }
	    }
	
	    var P = local.Promise;
	
	    if (P) {
	        var promiseToString = null;
	        try {
	            promiseToString = Object.prototype.toString.call(P.resolve());
	        } catch (e) {
	            // silently ignored
	        }
	
	        if (promiseToString === '[object Promise]' && !P.cast) {
	            return;
	        }
	    }
	
	    local.Promise = Promise;
	}
	
	polyfill();
	// Strange compat..
	Promise.polyfill = polyfill;
	Promise.Promise = Promise;
	
	return Promise;
	
	})));
	//# sourceMappingURL=es6-promise.map
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(15), (function() { return this; }())))

/***/ },
/* 45 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Root reference for iframes.
	 */
	
	var root;
	if (typeof window !== 'undefined') { // Browser window
	  root = window;
	} else if (typeof self !== 'undefined') { // Web Worker
	  root = self;
	} else { // Other environments
	  console.warn("Using browser-only version of superagent in non-browser environment");
	  root = this;
	}
	
	var Emitter = __webpack_require__(47);
	var RequestBase = __webpack_require__(48);
	var isObject = __webpack_require__(49);
	var isFunction = __webpack_require__(50);
	var ResponseBase = __webpack_require__(51);
	var shouldRetry = __webpack_require__(53);
	
	/**
	 * Noop.
	 */
	
	function noop(){};
	
	/**
	 * Expose `request`.
	 */
	
	var request = exports = module.exports = function(method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new exports.Request('GET', method).end(url);
	  }
	
	  // url first
	  if (1 == arguments.length) {
	    return new exports.Request('GET', method);
	  }
	
	  return new exports.Request(method, url);
	}
	
	exports.Request = Request;
	
	/**
	 * Determine XHR.
	 */
	
	request.getXHR = function () {
	  if (root.XMLHttpRequest
	      && (!root.location || 'file:' != root.location.protocol
	          || !root.ActiveXObject)) {
	    return new XMLHttpRequest;
	  } else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	  }
	  throw Error("Browser-only verison of superagent could not find XHR");
	};
	
	/**
	 * Removes leading and trailing whitespace, added to support IE.
	 *
	 * @param {String} s
	 * @return {String}
	 * @api private
	 */
	
	var trim = ''.trim
	  ? function(s) { return s.trim(); }
	  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };
	
	/**
	 * Serialize the given `obj`.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */
	
	function serialize(obj) {
	  if (!isObject(obj)) return obj;
	  var pairs = [];
	  for (var key in obj) {
	    pushEncodedKeyValuePair(pairs, key, obj[key]);
	  }
	  return pairs.join('&');
	}
	
	/**
	 * Helps 'serialize' with serializing arrays.
	 * Mutates the pairs array.
	 *
	 * @param {Array} pairs
	 * @param {String} key
	 * @param {Mixed} val
	 */
	
	function pushEncodedKeyValuePair(pairs, key, val) {
	  if (val != null) {
	    if (Array.isArray(val)) {
	      val.forEach(function(v) {
	        pushEncodedKeyValuePair(pairs, key, v);
	      });
	    } else if (isObject(val)) {
	      for(var subkey in val) {
	        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
	      }
	    } else {
	      pairs.push(encodeURIComponent(key)
	        + '=' + encodeURIComponent(val));
	    }
	  } else if (val === null) {
	    pairs.push(encodeURIComponent(key));
	  }
	}
	
	/**
	 * Expose serialization method.
	 */
	
	 request.serializeObject = serialize;
	
	 /**
	  * Parse the given x-www-form-urlencoded `str`.
	  *
	  * @param {String} str
	  * @return {Object}
	  * @api private
	  */
	
	function parseString(str) {
	  var obj = {};
	  var pairs = str.split('&');
	  var pair;
	  var pos;
	
	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    pos = pair.indexOf('=');
	    if (pos == -1) {
	      obj[decodeURIComponent(pair)] = '';
	    } else {
	      obj[decodeURIComponent(pair.slice(0, pos))] =
	        decodeURIComponent(pair.slice(pos + 1));
	    }
	  }
	
	  return obj;
	}
	
	/**
	 * Expose parser.
	 */
	
	request.parseString = parseString;
	
	/**
	 * Default MIME type map.
	 *
	 *     superagent.types.xml = 'application/xml';
	 *
	 */
	
	request.types = {
	  html: 'text/html',
	  json: 'application/json',
	  xml: 'application/xml',
	  urlencoded: 'application/x-www-form-urlencoded',
	  'form': 'application/x-www-form-urlencoded',
	  'form-data': 'application/x-www-form-urlencoded'
	};
	
	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */
	
	 request.serialize = {
	   'application/x-www-form-urlencoded': serialize,
	   'application/json': JSON.stringify
	 };
	
	 /**
	  * Default parsers.
	  *
	  *     superagent.parse['application/xml'] = function(str){
	  *       return { object parsed from str };
	  *     };
	  *
	  */
	
	request.parse = {
	  'application/x-www-form-urlencoded': parseString,
	  'application/json': JSON.parse
	};
	
	/**
	 * Parse the given header `str` into
	 * an object containing the mapped fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	function parseHeader(str) {
	  var lines = str.split(/\r?\n/);
	  var fields = {};
	  var index;
	  var line;
	  var field;
	  var val;
	
	  lines.pop(); // trailing CRLF
	
	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    field = line.slice(0, index).toLowerCase();
	    val = trim(line.slice(index + 1));
	    fields[field] = val;
	  }
	
	  return fields;
	}
	
	/**
	 * Check if `mime` is json or has +json structured syntax suffix.
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api private
	 */
	
	function isJSON(mime) {
	  return /[\/+]json\b/.test(mime);
	}
	
	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * Examples:
	 *
	 *  Aliasing `superagent` as `request` is nice:
	 *
	 *      request = superagent;
	 *
	 *  We can use the promise-like API, or pass callbacks:
	 *
	 *      request.get('/').end(function(res){});
	 *      request.get('/', function(res){});
	 *
	 *  Sending data can be chained:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' })
	 *        .end(function(res){});
	 *
	 *  Or passed to `.send()`:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' }, function(res){});
	 *
	 *  Or passed to `.post()`:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' })
	 *        .end(function(res){});
	 *
	 * Or further reduced to a single call for simple cases:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' }, function(res){});
	 *
	 * @param {XMLHTTPRequest} xhr
	 * @param {Object} options
	 * @api private
	 */
	
	function Response(req) {
	  this.req = req;
	  this.xhr = this.req.xhr;
	  // responseText is accessible only if responseType is '' or 'text' and on older browsers
	  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
	     ? this.xhr.responseText
	     : null;
	  this.statusText = this.req.xhr.statusText;
	  var status = this.xhr.status;
	  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
	  if (status === 1223) {
	      status = 204;
	  }
	  this._setStatusProperties(status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this._setHeaderProperties(this.header);
	
	  if (null === this.text && req._responseType) {
	    this.body = this.xhr.response;
	  } else {
	    this.body = this.req.method != 'HEAD'
	      ? this._parseBody(this.text ? this.text : this.xhr.response)
	      : null;
	  }
	}
	
	ResponseBase(Response.prototype);
	
	/**
	 * Parse the given body `str`.
	 *
	 * Used for auto-parsing of bodies. Parsers
	 * are defined on the `superagent.parse` object.
	 *
	 * @param {String} str
	 * @return {Mixed}
	 * @api private
	 */
	
	Response.prototype._parseBody = function(str){
	  var parse = request.parse[this.type];
	  if(this.req._parser) {
	    return this.req._parser(this, str);
	  }
	  if (!parse && isJSON(this.type)) {
	    parse = request.parse['application/json'];
	  }
	  return parse && str && (str.length || str instanceof Object)
	    ? parse(str)
	    : null;
	};
	
	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */
	
	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var url = req.url;
	
	  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.method = method;
	  err.url = url;
	
	  return err;
	};
	
	/**
	 * Expose `Response`.
	 */
	
	request.Response = Response;
	
	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @api public
	 */
	
	function Request(method, url) {
	  var self = this;
	  this._query = this._query || [];
	  this.method = method;
	  this.url = url;
	  this.header = {}; // preserves header name case
	  this._header = {}; // coerces header names to lowercase
	  this.on('end', function(){
	    var err = null;
	    var res = null;
	
	    try {
	      res = new Response(self);
	    } catch(e) {
	      err = new Error('Parser is unable to parse the response');
	      err.parse = true;
	      err.original = e;
	      // issue #675: return the raw response if the response parsing fails
	      if (self.xhr) {
	        // ie9 doesn't have 'response' property
	        err.rawResponse = typeof self.xhr.responseType == 'undefined' ? self.xhr.responseText : self.xhr.response;
	        // issue #876: return the http status code if the response parsing fails
	        err.status = self.xhr.status ? self.xhr.status : null;
	        err.statusCode = err.status; // backwards-compat only
	      } else {
	        err.rawResponse = null;
	        err.status = null;
	      }
	
	      return self.callback(err);
	    }
	
	    self.emit('response', res);
	
	    var new_err;
	    try {
	      if (!self._isResponseOK(res)) {
	        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
	        new_err.original = err;
	        new_err.response = res;
	        new_err.status = res.status;
	      }
	    } catch(e) {
	      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
	    }
	
	    // #1000 don't catch errors from the callback to avoid double calling it
	    if (new_err) {
	      self.callback(new_err, res);
	    } else {
	      self.callback(null, res);
	    }
	  });
	}
	
	/**
	 * Mixin `Emitter` and `RequestBase`.
	 */
	
	Emitter(Request.prototype);
	RequestBase(Request.prototype);
	
	/**
	 * Set Content-Type to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.xml = 'application/xml';
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.type = function(type){
	  this.set('Content-Type', request.types[type] || type);
	  return this;
	};
	
	/**
	 * Set Accept to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.accept = function(type){
	  this.set('Accept', request.types[type] || type);
	  return this;
	};
	
	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * @param {String} user
	 * @param {String} [pass] optional in case of using 'bearer' as type
	 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.auth = function(user, pass, options){
	  if (typeof pass === 'object' && pass !== null) { // pass is optional and can substitute for options
	    options = pass;
	  }
	  if (!options) {
	    options = {
	      type: 'function' === typeof btoa ? 'basic' : 'auto',
	    }
	  }
	
	  switch (options.type) {
	    case 'basic':
	      this.set('Authorization', 'Basic ' + btoa(user + ':' + pass));
	    break;
	
	    case 'auto':
	      this.username = user;
	      this.password = pass;
	    break;
	      
	    case 'bearer': // usage would be .auth(accessToken, { type: 'bearer' })
	      this.set('Authorization', 'Bearer ' + user);
	    break;  
	  }
	  return this;
	};
	
	/**
	 * Add query-string `val`.
	 *
	 * Examples:
	 *
	 *   request.get('/shoes')
	 *     .query('size=10')
	 *     .query({ color: 'blue' })
	 *
	 * @param {Object|String} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.query = function(val){
	  if ('string' != typeof val) val = serialize(val);
	  if (val) this._query.push(val);
	  return this;
	};
	
	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `options` (or filename).
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String|Object} options
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.attach = function(field, file, options){
	  if (file) {
	    if (this._data) {
	      throw Error("superagent can't mix .send() and .attach()");
	    }
	
	    this._getFormData().append(field, file, options || file.name);
	  }
	  return this;
	};
	
	Request.prototype._getFormData = function(){
	  if (!this._formData) {
	    this._formData = new root.FormData();
	  }
	  return this._formData;
	};
	
	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */
	
	Request.prototype.callback = function(err, res){
	  // console.log(this._retries, this._maxRetries)
	  if (this._maxRetries && this._retries++ < this._maxRetries && shouldRetry(err, res)) {
	    return this._retry();
	  }
	
	  var fn = this._callback;
	  this.clearTimeout();
	
	  if (err) {
	    if (this._maxRetries) err.retries = this._retries - 1;
	    this.emit('error', err);
	  }
	
	  fn(err, res);
	};
	
	/**
	 * Invoke callback with x-domain error.
	 *
	 * @api private
	 */
	
	Request.prototype.crossDomainError = function(){
	  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
	  err.crossDomain = true;
	
	  err.status = this.status;
	  err.method = this.method;
	  err.url = this.url;
	
	  this.callback(err);
	};
	
	// This only warns, because the request is still likely to work
	Request.prototype.buffer = Request.prototype.ca = Request.prototype.agent = function(){
	  console.warn("This is not supported in browser version of superagent");
	  return this;
	};
	
	// This throws, because it can't send/receive data as expected
	Request.prototype.pipe = Request.prototype.write = function(){
	  throw Error("Streaming is not supported in browser version of superagent");
	};
	
	/**
	 * Compose querystring to append to req.url
	 *
	 * @api private
	 */
	
	Request.prototype._appendQueryString = function(){
	  var query = this._query.join('&');
	  if (query) {
	    this.url += (this.url.indexOf('?') >= 0 ? '&' : '?') + query;
	  }
	
	  if (this._sort) {
	    var index = this.url.indexOf('?');
	    if (index >= 0) {
	      var queryArr = this.url.substring(index + 1).split('&');
	      if (isFunction(this._sort)) {
	        queryArr.sort(this._sort);
	      } else {
	        queryArr.sort();
	      }
	      this.url = this.url.substring(0, index) + '?' + queryArr.join('&');
	    }
	  }
	};
	
	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	Request.prototype._isHost = function _isHost(obj) {
	  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
	  return obj && 'object' === typeof obj && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
	}
	
	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.end = function(fn){
	  if (this._endCalled) {
	    console.warn("Warning: .end() was called twice. This is not supported in superagent");
	  }
	  this._endCalled = true;
	
	  // store callback
	  this._callback = fn || noop;
	
	  // querystring
	  this._appendQueryString();
	
	  return this._end();
	};
	
	Request.prototype._end = function() {
	  var self = this;
	  var xhr = this.xhr = request.getXHR();
	  var data = this._formData || this._data;
	
	  this._setTimeouts();
	
	  // state change
	  xhr.onreadystatechange = function(){
	    var readyState = xhr.readyState;
	    if (readyState >= 2 && self._responseTimeoutTimer) {
	      clearTimeout(self._responseTimeoutTimer);
	    }
	    if (4 != readyState) {
	      return;
	    }
	
	    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
	    // result in the error "Could not complete the operation due to error c00c023f"
	    var status;
	    try { status = xhr.status } catch(e) { status = 0; }
	
	    if (!status) {
	      if (self.timedout || self._aborted) return;
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };
	
	  // progress
	  var handleProgress = function(direction, e) {
	    if (e.total > 0) {
	      e.percent = e.loaded / e.total * 100;
	    }
	    e.direction = direction;
	    self.emit('progress', e);
	  }
	  if (this.hasListeners('progress')) {
	    try {
	      xhr.onprogress = handleProgress.bind(null, 'download');
	      if (xhr.upload) {
	        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
	      }
	    } catch(e) {
	      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
	      // Reported here:
	      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
	    }
	  }
	
	  // initiate request
	  try {
	    if (this.username && this.password) {
	      xhr.open(this.method, this.url, true, this.username, this.password);
	    } else {
	      xhr.open(this.method, this.url, true);
	    }
	  } catch (err) {
	    // see #1149
	    return this.callback(err);
	  }
	
	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;
	
	  // body
	  if (!this._formData && 'GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
	    // serialize stuff
	    var contentType = this._header['content-type'];
	    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
	    if (!serialize && isJSON(contentType)) {
	      serialize = request.serialize['application/json'];
	    }
	    if (serialize) data = serialize(data);
	  }
	
	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;
	
	    if (this.header.hasOwnProperty(field))
	      xhr.setRequestHeader(field, this.header[field]);
	  }
	
	  if (this._responseType) {
	    xhr.responseType = this._responseType;
	  }
	
	  // send stuff
	  this.emit('request', this);
	
	  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
	  // We need null here if data is undefined
	  xhr.send(typeof data !== 'undefined' ? data : null);
	  return this;
	};
	
	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.get = function(url, data, fn){
	  var req = request('GET', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.head = function(url, data, fn){
	  var req = request('HEAD', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * OPTIONS query to `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.options = function(url, data, fn){
	  var req = request('OPTIONS', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * DELETE `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	function del(url, data, fn){
	  var req = request('DELETE', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	request['del'] = del;
	request['delete'] = del;
	
	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.patch = function(url, data, fn){
	  var req = request('PATCH', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.post = function(url, data, fn){
	  var req = request('POST', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.put = function(url, data, fn){
	  var req = request('PUT', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	if (true) {
	  module.exports = Emitter;
	}
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module of mixed-in functions shared between node and client code
	 */
	var isObject = __webpack_require__(49);
	
	/**
	 * Expose `RequestBase`.
	 */
	
	module.exports = RequestBase;
	
	/**
	 * Initialize a new `RequestBase`.
	 *
	 * @api public
	 */
	
	function RequestBase(obj) {
	  if (obj) return mixin(obj);
	}
	
	/**
	 * Mixin the prototype properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in RequestBase.prototype) {
	    obj[key] = RequestBase.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.clearTimeout = function _clearTimeout(){
	  clearTimeout(this._timer);
	  clearTimeout(this._responseTimeoutTimer);
	  delete this._timer;
	  delete this._responseTimeoutTimer;
	  return this;
	};
	
	/**
	 * Override default response body parser
	 *
	 * This function will be called to convert incoming data into request.body
	 *
	 * @param {Function}
	 * @api public
	 */
	
	RequestBase.prototype.parse = function parse(fn){
	  this._parser = fn;
	  return this;
	};
	
	/**
	 * Set format of binary response body.
	 * In browser valid formats are 'blob' and 'arraybuffer',
	 * which return Blob and ArrayBuffer, respectively.
	 *
	 * In Node all values result in Buffer.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .responseType('blob')
	 *        .end(callback);
	 *
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.responseType = function(val){
	  this._responseType = val;
	  return this;
	};
	
	/**
	 * Override default request body serializer
	 *
	 * This function will be called to convert data set via .send or .attach into payload to send
	 *
	 * @param {Function}
	 * @api public
	 */
	
	RequestBase.prototype.serialize = function serialize(fn){
	  this._serializer = fn;
	  return this;
	};
	
	/**
	 * Set timeouts.
	 *
	 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
	 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
	 *
	 * Value of 0 or false means no timeout.
	 *
	 * @param {Number|Object} ms or {response, read, deadline}
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.timeout = function timeout(options){
	  if (!options || 'object' !== typeof options) {
	    this._timeout = options;
	    this._responseTimeout = 0;
	    return this;
	  }
	
	  for(var option in options) {
	    switch(option) {
	      case 'deadline':
	        this._timeout = options.deadline;
	        break;
	      case 'response':
	        this._responseTimeout = options.response;
	        break;
	      default:
	        console.warn("Unknown timeout option", option);
	    }
	  }
	  return this;
	};
	
	/**
	 * Set number of retry attempts on error.
	 *
	 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
	 *
	 * @param {Number} count
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.retry = function retry(count){
	  // Default to 1 if no count passed or true
	  if (arguments.length === 0 || count === true) count = 1;
	  if (count <= 0) count = 0;
	  this._maxRetries = count;
	  this._retries = 0;
	  return this;
	};
	
	/**
	 * Retry request
	 *
	 * @return {Request} for chaining
	 * @api private
	 */
	
	RequestBase.prototype._retry = function() {
	  this.clearTimeout();
	
	  // node
	  if (this.req) {
	    this.req = null;
	    this.req = this.request();
	  }
	
	  this._aborted = false;
	  this.timedout = false;
	
	  return this._end();
	};
	
	/**
	 * Promise support
	 *
	 * @param {Function} resolve
	 * @param {Function} [reject]
	 * @return {Request}
	 */
	
	RequestBase.prototype.then = function then(resolve, reject) {
	  if (!this._fullfilledPromise) {
	    var self = this;
	    if (this._endCalled) {
	      console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises");
	    }
	    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
	      self.end(function(err, res){
	        if (err) innerReject(err); else innerResolve(res);
	      });
	    });
	  }
	  return this._fullfilledPromise.then(resolve, reject);
	}
	
	RequestBase.prototype.catch = function(cb) {
	  return this.then(undefined, cb);
	};
	
	/**
	 * Allow for extension
	 */
	
	RequestBase.prototype.use = function use(fn) {
	  fn(this);
	  return this;
	}
	
	RequestBase.prototype.ok = function(cb) {
	  if ('function' !== typeof cb) throw Error("Callback required");
	  this._okCallback = cb;
	  return this;
	};
	
	RequestBase.prototype._isResponseOK = function(res) {
	  if (!res) {
	    return false;
	  }
	
	  if (this._okCallback) {
	    return this._okCallback(res);
	  }
	
	  return res.status >= 200 && res.status < 300;
	};
	
	
	/**
	 * Get request header `field`.
	 * Case-insensitive.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */
	
	RequestBase.prototype.get = function(field){
	  return this._header[field.toLowerCase()];
	};
	
	/**
	 * Get case-insensitive header `field` value.
	 * This is a deprecated internal API. Use `.get(field)` instead.
	 *
	 * (getHeader is no longer used internally by the superagent code base)
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 * @deprecated
	 */
	
	RequestBase.prototype.getHeader = RequestBase.prototype.get;
	
	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 * Case-insensitive.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};
	
	/**
	 * Remove header `field`.
	 * Case-insensitive.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 */
	RequestBase.prototype.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};
	
	/**
	 * Write the field `name` and `val`, or multiple fields with one object
	 * for "multipart/form-data" request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 *
	 * request.post('/upload')
	 *   .field({ foo: 'bar', baz: 'qux' })
	 *   .end(callback);
	 * ```
	 *
	 * @param {String|Object} name
	 * @param {String|Blob|File|Buffer|fs.ReadStream} val
	 * @return {Request} for chaining
	 * @api public
	 */
	RequestBase.prototype.field = function(name, val) {
	
	  // name should be either a string or an object.
	  if (null === name ||  undefined === name) {
	    throw new Error('.field(name, val) name can not be empty');
	  }
	
	  if (this._data) {
	    console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
	  }
	
	  if (isObject(name)) {
	    for (var key in name) {
	      this.field(key, name[key]);
	    }
	    return this;
	  }
	
	  if (Array.isArray(val)) {
	    for (var i in val) {
	      this.field(name, val[i]);
	    }
	    return this;
	  }
	
	  // val should be defined now
	  if (null === val || undefined === val) {
	    throw new Error('.field(name, val) val can not be empty');
	  }
	  if ('boolean' === typeof val) {
	    val = '' + val;
	  }
	  this._getFormData().append(name, val);
	  return this;
	};
	
	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */
	RequestBase.prototype.abort = function(){
	  if (this._aborted) {
	    return this;
	  }
	  this._aborted = true;
	  this.xhr && this.xhr.abort(); // browser
	  this.req && this.req.abort(); // node
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};
	
	/**
	 * Enable transmission of cookies with x-domain requests.
	 *
	 * Note that for this to work the origin must not be
	 * using "Access-Control-Allow-Origin" with a wildcard,
	 * and also must set "Access-Control-Allow-Credentials"
	 * to "true".
	 *
	 * @api public
	 */
	
	RequestBase.prototype.withCredentials = function(on){
	  // This is browser-only functionality. Node side is no-op.
	  if(on==undefined) on = true;
	  this._withCredentials = on;
	  return this;
	};
	
	/**
	 * Set the max redirects to `n`. Does noting in browser XHR implementation.
	 *
	 * @param {Number} n
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.redirects = function(n){
	  this._maxRedirects = n;
	  return this;
	};
	
	/**
	 * Convert to a plain javascript object (not JSON string) of scalar properties.
	 * Note as this method is designed to return a useful non-this value,
	 * it cannot be chained.
	 *
	 * @return {Object} describing method, url, and data of this request
	 * @api public
	 */
	
	RequestBase.prototype.toJSON = function(){
	  return {
	    method: this.method,
	    url: this.url,
	    data: this._data,
	    headers: this._header
	  };
	};
	
	
	/**
	 * Send `data` as the request body, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"}')
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // defaults to x-www-form-urlencoded
	 *      request.post('/user')
	 *        .send('name=tobi')
	 *        .send('species=ferret')
	 *        .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.send = function(data){
	  var isObj = isObject(data);
	  var type = this._header['content-type'];
	
	  if (this._formData) {
	    console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
	  }
	
	  if (isObj && !this._data) {
	    if (Array.isArray(data)) {
	      this._data = [];
	    } else if (!this._isHost(data)) {
	      this._data = {};
	    }
	  } else if (data && this._data && this._isHost(this._data)) {
	    throw Error("Can't merge these send calls");
	  }
	
	  // merge
	  if (isObj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    // default to x-www-form-urlencoded
	    if (!type) this.type('form');
	    type = this._header['content-type'];
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }
	
	  if (!isObj || this._isHost(data)) {
	    return this;
	  }
	
	  // default to json
	  if (!type) this.type('json');
	  return this;
	};
	
	
	/**
	 * Sort `querystring` by the sort function
	 *
	 *
	 * Examples:
	 *
	 *       // default order
	 *       request.get('/user')
	 *         .query('name=Nick')
	 *         .query('search=Manny')
	 *         .sortQuery()
	 *         .end(callback)
	 *
	 *       // customized sort function
	 *       request.get('/user')
	 *         .query('name=Nick')
	 *         .query('search=Manny')
	 *         .sortQuery(function(a, b){
	 *           return a.length - b.length;
	 *         })
	 *         .end(callback)
	 *
	 *
	 * @param {Function} sort
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.sortQuery = function(sort) {
	  // _sort default to true but otherwise can be a function or boolean
	  this._sort = typeof sort === 'undefined' ? true : sort;
	  return this;
	};
	
	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */
	
	RequestBase.prototype._timeoutError = function(reason, timeout, errno){
	  if (this._aborted) {
	    return;
	  }
	  var err = new Error(reason + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  err.code = 'ECONNABORTED';
	  err.errno = errno;
	  this.timedout = true;
	  this.abort();
	  this.callback(err);
	};
	
	RequestBase.prototype._setTimeouts = function() {
	  var self = this;
	
	  // deadline
	  if (this._timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
	    }, this._timeout);
	  }
	  // response timeout
	  if (this._responseTimeout && !this._responseTimeoutTimer) {
	    this._responseTimeoutTimer = setTimeout(function(){
	      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
	    }, this._responseTimeout);
	  }
	}


/***/ },
/* 49 */
/***/ function(module, exports) {

	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	
	function isObject(obj) {
	  return null !== obj && 'object' === typeof obj;
	}
	
	module.exports = isObject;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Check if `fn` is a function.
	 *
	 * @param {Function} fn
	 * @return {Boolean}
	 * @api private
	 */
	var isObject = __webpack_require__(49);
	
	function isFunction(fn) {
	  var tag = isObject(fn) ? Object.prototype.toString.call(fn) : '';
	  return tag === '[object Function]';
	}
	
	module.exports = isFunction;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	var utils = __webpack_require__(52);
	
	/**
	 * Expose `ResponseBase`.
	 */
	
	module.exports = ResponseBase;
	
	/**
	 * Initialize a new `ResponseBase`.
	 *
	 * @api public
	 */
	
	function ResponseBase(obj) {
	  if (obj) return mixin(obj);
	}
	
	/**
	 * Mixin the prototype properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in ResponseBase.prototype) {
	    obj[key] = ResponseBase.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */
	
	ResponseBase.prototype.get = function(field){
	    return this.header[field.toLowerCase()];
	};
	
	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */
	
	ResponseBase.prototype._setHeaderProperties = function(header){
	    // TODO: moar!
	    // TODO: make this a util
	
	    // content-type
	    var ct = header['content-type'] || '';
	    this.type = utils.type(ct);
	
	    // params
	    var params = utils.params(ct);
	    for (var key in params) this[key] = params[key];
	
	    this.links = {};
	
	    // links
	    try {
	        if (header.link) {
	            this.links = utils.parseLinks(header.link);
	        }
	    } catch (err) {
	        // ignore
	    }
	};
	
	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */
	
	ResponseBase.prototype._setStatusProperties = function(status){
	    var type = status / 100 | 0;
	
	    // status / class
	    this.status = this.statusCode = status;
	    this.statusType = type;
	
	    // basics
	    this.info = 1 == type;
	    this.ok = 2 == type;
	    this.redirect = 3 == type;
	    this.clientError = 4 == type;
	    this.serverError = 5 == type;
	    this.error = (4 == type || 5 == type)
	        ? this.toError()
	        : false;
	
	    // sugar
	    this.accepted = 202 == status;
	    this.noContent = 204 == status;
	    this.badRequest = 400 == status;
	    this.unauthorized = 401 == status;
	    this.notAcceptable = 406 == status;
	    this.forbidden = 403 == status;
	    this.notFound = 404 == status;
	};


/***/ },
/* 52 */
/***/ function(module, exports) {

	
	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */
	
	exports.type = function(str){
	  return str.split(/ *; */).shift();
	};
	
	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	exports.params = function(str){
	  return str.split(/ *; */).reduce(function(obj, str){
	    var parts = str.split(/ *= */);
	    var key = parts.shift();
	    var val = parts.shift();
	
	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};
	
	/**
	 * Parse Link header fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	exports.parseLinks = function(str){
	  return str.split(/ *, */).reduce(function(obj, str){
	    var parts = str.split(/ *; */);
	    var url = parts[0].slice(1, -1);
	    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
	    obj[rel] = url;
	    return obj;
	  }, {});
	};
	
	/**
	 * Strip content related fields from `header`.
	 *
	 * @param {Object} header
	 * @return {Object} header
	 * @api private
	 */
	
	exports.cleanHeader = function(header, shouldStripCookie){
	  delete header['content-type'];
	  delete header['content-length'];
	  delete header['transfer-encoding'];
	  delete header['host'];
	  if (shouldStripCookie) {
	    delete header['cookie'];
	  }
	  return header;
	};

/***/ },
/* 53 */
/***/ function(module, exports) {

	var ERROR_CODES = [
	  'ECONNRESET',
	  'ETIMEDOUT',
	  'EADDRINFO',
	  'ESOCKETTIMEDOUT'
	];
	
	/**
	 * Determine if a request should be retried.
	 * (Borrowed from segmentio/superagent-retry)
	 *
	 * @param {Error} err
	 * @param {Response} [res]
	 * @returns {Boolean}
	 */
	module.exports = function shouldRetry(err, res) {
	  if (err && err.code && ~ERROR_CODES.indexOf(err.code)) return true;
	  if (res && res.status && res.status >= 500) return true;
	  // Superagent timeout
	  if (err && 'timeout' in err && err.code == 'ECONNABORTED') return true;
	  if (err && 'crossDomain' in err) return true;
	  return false;
	};


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (name, definition, context) {
	
	  //try CommonJS, then AMD (require.js), then use global.
	
	  if (typeof module != 'undefined' && module.exports) module.exports = definition();
	  else if (typeof context['define'] == 'function' && context['define']['amd']) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  else context[name] = definition();
	
	})('li', function () {
	  // compile regular expressions ahead of time for efficiency
	  var relsRegExp = /^;\s*([^"=]+)=(?:"([^"]+)"|([^";,]+)(?:[;,]|$))/;
	  var keysRegExp = /([^\s]+)/g;
	  var sourceRegExp = /^<([^>]*)>/;
	  var delimiterRegExp = /^\s*,\s*/;
	
	  return {
	    parse: function (linksHeader, options) {
	      var match;
	      var source;
	      var rels;
	      var extended = options && options.extended || false;
	      var links = [];
	
	      while (linksHeader) {
	        linksHeader = linksHeader.trim();
	
	        // Parse `<link>`
	        source = sourceRegExp.exec(linksHeader);
	        if (!source) break;
	
	        var current = {
	          link: source[1]
	        };
	
	        // Move cursor
	        linksHeader = linksHeader.slice(source[0].length);
	
	        // Parse `; attr=relation` and `; attr="relation"`
	
	        var nextDelimiter = linksHeader.match(delimiterRegExp);
	        while(linksHeader && (!nextDelimiter || nextDelimiter.index > 0)) {
	          match = relsRegExp.exec(linksHeader);
	          if (!match) break;
	
	          // Move cursor
	          linksHeader = linksHeader.slice(match[0].length);
	          nextDelimiter = linksHeader.match(delimiterRegExp);
	
	
	          if (match[1] === 'rel' || match[1] === 'rev') {
	            // Add either quoted rel or unquoted rel
	            rels = (match[2] || match[3]).split(/\s+/);
	            current[match[1]] = rels;
	          } else {
	            current[match[1]] = match[2] || match[3];
	          }
	        }
	
	        links.push(current);
	        // Move cursor
	        linksHeader = linksHeader.replace(delimiterRegExp, '');
	      }
	
	      if (!extended) {
	        return links.reduce(function(result, currentLink) {
	          if (currentLink.rel) {
	            currentLink.rel.forEach(function(rel) {
	              result[rel] = currentLink.link;
	            });
	          }
	          return result;
	        }, {});
	      }
	
	      return links;
	    },
	    stringify: function (headerObject, callback) {
	      var result = "";
	      for (var x in headerObject) {
	        result += '<' + headerObject[x] + '>; rel="' + x + '", ';
	      }
	      result = result.substring(0, result.length - 2);
	
	      return result;
	    }
	  };
	
	}, this);


/***/ },
/* 55 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Verify that a specific HTTP method is supported by the provided WPRequest
	 *
	 * @module util/check-method-support
	 * @param {String} method An HTTP method to check ('get', 'post', etc)
	 * @param {WPRequest} request A WPRequest object with a _supportedMethods array
	 * @returns true iff the method is within request._supportedMethods
	 */
	module.exports = function( method, request ) {
		if ( request._supportedMethods.indexOf( method.toLowerCase() ) === -1 ) {
			throw new Error(
				'Unsupported method; supported methods are: ' +
				request._supportedMethods.join( ', ' )
			);
		}
	
		return true;
	};


/***/ },
/* 56 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Determine whether an provided value is an empty object
	 *
	 * @module util/is-empty-object
	 * @param {} value A value to test for empty-object-ness
	 * @returns {boolean} Whether the provided value is an empty object
	 */
	module.exports = function( value ) {
		// If the value is not object-like, then it is certainly not an empty object
		if ( typeof value !== 'object' ) {
			return false;
		}
	
		// For our purposes an empty array should not be treated as an empty object
		// (Since this is used to process invalid content-type responses, )
		if ( Array.isArray( value ) ) {
			return false;
		}
	
		for ( var key in value ) {
			if ( value.hasOwnProperty( key ) ) {
				return false;
			}
		}
	
		return true;
	};


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var extend = __webpack_require__( 1 );
	
	var buildRouteTree = __webpack_require__( 6 ).build;
	var generateEndpointFactories = __webpack_require__( 10 ).generate;
	var paramSetter = __webpack_require__( 27 );
	var applyMixin = __webpack_require__( 32 );
	var mixins = __webpack_require__( 28 );
	
	/**
	 * Create and return a handler for an arbitrary WP REST API endpoint.
	 *
	 * The first two parameters mirror `register_rest_route` in the REST API
	 * codebase:
	 *
	 * @memberof! WPAPI#
	 * @param {string}   namespace         A namespace string, e.g. 'myplugin/v1'
	 * @param {string}   restBase          A REST route string, e.g. '/author/(?P<id>\d+)'
	 * @param {object}   [options]         An (optional) options object
	 * @param {object}   [options.mixins]  A hash of functions to apply as mixins
	 * @param {string[]} [options.methods] An array of methods to whitelist (on the leaf node only)
	 * @returns {Function} An endpoint handler factory function for the specified route
	 */
	function registerRoute( namespace, restBase, options ) {
		// Support all methods until requested to do otherwise
		var supportedMethods = [ 'head', 'get', 'patch', 'put', 'post', 'delete' ];
	
		if ( options && Array.isArray( options.methods ) ) {
			// Permit supported methods to be specified as an array
			supportedMethods = options.methods.map(function( method ) {
				return method.trim().toLowerCase();
			});
		} else if ( options && typeof options.methods === 'string' ) {
			// Permit a supported method to be specified as a string
			supportedMethods = [ options.methods.trim().toLowerCase() ];
		}
	
		// Ensure that if GET is supported, then HEAD is as well, and vice-versa
		if ( supportedMethods.indexOf( 'get' ) !== -1 && supportedMethods.indexOf( 'head' ) === -1 ) {
			supportedMethods.push( 'head' );
		} else if ( supportedMethods.indexOf( 'head' ) !== -1 && supportedMethods.indexOf( 'get' ) === -1 ) {
			supportedMethods.push( 'get' );
		}
	
		var fullRoute = namespace
			// Route should always have preceding slash
			.replace( /^[\s/]*/, '/' )
			// Route should always be joined to namespace with a single slash
			.replace( /[\s/]*$/, '/' ) + restBase.replace( /^[\s/]*/, '' );
	
		var routeObj = {};
		routeObj[ fullRoute ] = {
			namespace: namespace,
			methods: supportedMethods
		};
	
		// Go through the same steps used to bootstrap the client to parse the
		// provided route out into a handler request method
		var routeTree = buildRouteTree( routeObj );
		// Parse the mock route object into endpoint factories
		var endpointFactories = generateEndpointFactories( routeTree )[ namespace ];
		var EndpointRequest = endpointFactories[ Object.keys( endpointFactories )[ 0 ] ].Ctor;
	
		if ( options && options.params ) {
			options.params.forEach(function( param ) {
				// Only accept string parameters
				if ( typeof param !== 'string' ) {
					return;
				}
	
				// If the parameter can be mapped to a mixin, apply that mixin
				if ( typeof mixins[ param ] === 'object' ) {
					Object.keys( mixins[ param ] ).forEach(function( key ) {
						applyMixin( EndpointRequest.prototype, key, mixins[ param ][ key ] );
					});
					return;
				}
	
				// Attempt to create a simple setter for any parameters for which
				// we do not already have a custom mixin
				applyMixin( EndpointRequest.prototype, param, paramSetter( param ) );
			});
		}
	
		// Set any explicitly-provided object mixins
		if ( options && typeof options.mixins === 'object' ) {
	
			// Set any specified mixin functions on the response
			Object.keys( options.mixins ).forEach(function( key ) {
				applyMixin( EndpointRequest.prototype, key, options.mixins[ key ] );
			});
		}
	
		function endpointFactory( options ) {
			/* jshint validthis:true */
			options = options || {};
			options = extend( options, this && this._options );
			return new EndpointRequest( options );
		}
		endpointFactory.Ctor = EndpointRequest;
	
		return endpointFactory;
	}
	
	module.exports = registerRoute;


/***/ }
/******/ ])
});
;
//# sourceMappingURL=wpapi.js.map