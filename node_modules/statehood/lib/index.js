'use strict';

// Load modules

const Boom = require('boom');
const Cryptiles = require('cryptiles');
const Hoek = require('hoek');
const Iron = require('iron');
const Items = require('items');
const Joi = require('joi');
const Querystring = require('querystring');


// Declare internals

const internals = {};


internals.schema = Joi.object({
    strictHeader: Joi.boolean(),
    ignoreErrors: Joi.boolean(),
    isSecure: Joi.boolean(),
    isHttpOnly: Joi.boolean(),
    isSameSite: Joi.valid('Strict', 'Lax').allow(false),
    path: Joi.string().allow(null),
    domain: Joi.string().allow(null),
    ttl: Joi.number().allow(null),
    encoding: Joi.string().valid('base64json', 'base64', 'form', 'iron', 'none'),
    sign: Joi.object({
        password: [Joi.string(), Joi.binary(), Joi.object()],
        integrity: Joi.object()
    }),
    iron: Joi.object(),
    password: [Joi.string(), Joi.binary(), Joi.object()],

    // Used by hapi

    clearInvalid: Joi.boolean(),
    autoValue: Joi.any(),
    passThrough: Joi.boolean()
});


internals.defaults = {
    strictHeader: true,                             // Require an RFC 6265 compliant header format
    ignoreErrors: false,
    isSecure: true,
    isHttpOnly: true,
    isSameSite: 'Strict',
    path: null,
    domain: null,
    ttl: null,                                      // MSecs, 0 means remove
    encoding: 'none'                                // options: 'base64json', 'base64', 'form', 'iron', 'none'
};


exports.Definitions = internals.Definitions = function (options) {

    this.settings = Hoek.applyToDefaults(internals.defaults, options || {});
    Joi.assert(this.settings, internals.schema, 'Invalid state definition defaults');

    this.cookies = {};
    this.names = [];
};


internals.Definitions.prototype.add = function (name, options) {

    Hoek.assert(name && typeof name === 'string', 'Invalid name');
    Hoek.assert(!this.cookies[name], 'State already defined:', name);

    const settings = Hoek.applyToDefaults(this.settings, options || {}, true);
    Joi.assert(settings, internals.schema, 'Invalid state definition: ' + name);

    this.cookies[name] = settings;
    this.names.push(name);
};


internals.empty = new internals.Definitions();


// Header format

//                      1: name                2: quoted  3: value
internals.parseRx = /\s*([^=\s]*)\s*=\s*(?:(?:"([^\"]*)")|([^\;]*))(?:(?:;\s*)|$)/g;

internals.validateRx = {
    nameRx: {
        strict: /^[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+$/,
        loose: /^[^=\s]*$/
    },
    valueRx: {
        strict: /^[^\x00-\x20\"\,\;\\\x7F]*$/,
        loose: /^(?:"([^\"]*)")|(?:[^\;]*)$/
    },
    domainRx: /^\.?[a-z\d]+(?:(?:[a-z\d]*)|(?:[a-z\d\-]*[a-z\d]))(?:\.[a-z\d]+(?:(?:[a-z\d]*)|(?:[a-z\d\-]*[a-z\d])))*$/,
    domainLabelLenRx: /^\.?[a-z\d\-]{1,63}(?:\.[a-z\d\-]{1,63})*$/,
    pathRx: /^\/[^\x00-\x1F\;]*$/
};

//                      1: name         2: value
internals.pairsRx = /\s*([^=\s]*)\s*=\s*([^\;]*)(?:(?:;\s*)|$)/g;


internals.Definitions.prototype.parse = function (cookies, next) {

    const state = {};
    const names = [];
    const verify = cookies.replace(internals.parseRx, ($0, $1, $2, $3) => {

        const name = $1;
        const value = $2 || $3 || '';

        if (state[name]) {
            if (!Array.isArray(state[name])) {
                state[name] = [state[name]];
            }

            state[name].push(value);
        }
        else {
            state[name] = value;
            names.push(name);
        }

        return '';
    });

    // Validate cookie header syntax

    const failed = [];                                                // All errors

    if (verify !== '') {
        if (!this.settings.ignoreErrors) {
            return next(Boom.badRequest('Invalid cookie header'), null, []);
        }

        failed.push({ settings: this.settings, reason: `Header contains unexpected syntax: ${verify}` });
    }

    // Collect errors

    const errored = [];                                               // Unignored errors
    const record = (reason, name, value, definition) => {

        const details = {
            name,
            value,
            settings: definition,
            reason: typeof reason === 'string' ? reason : reason.message
        };

        failed.push(details);
        if (!definition.ignoreErrors) {
            errored.push(details);
        }
    };

    // Parse cookies

    const parsed = {};
    Items.serial(names, (name, nextName) => {

        const value = state[name];
        const definition = this.cookies[name] || this.settings;

        // Validate cookie

        if (definition.strictHeader) {
            if (!name.match(internals.validateRx.nameRx.strict)) {
                record('Invalid cookie name', name, value, definition);
                return nextName();
            }

            const values = [].concat(state[name]);
            for (let i = 0; i < values.length; ++i) {
                if (!values[i].match(internals.validateRx.valueRx.strict)) {
                    record('Invalid cookie value', name, value, definition);
                    return nextName();
                }
            }
        }

        // Check cookie format

        if (definition.encoding === 'none') {
            parsed[name] = value;
            return nextName();
        }

        // Single value

        if (!Array.isArray(value)) {
            internals.unsign(name, value, definition, (err, unsigned) => {

                if (err) {
                    record(err, name, value, definition);
                    return nextName();
                }

                internals.decode(unsigned, definition, (err, result) => {

                    if (err) {
                        record(err, name, value, definition);
                        return nextName();
                    }

                    parsed[name] = result;
                    return nextName();
                });
            });

            return;
        }

        // Array

        const arrayResult = [];
        Items.serial(value, (arrayValue, nextArray) => {

            internals.unsign(name, arrayValue, definition, (err, unsigned) => {

                if (err) {
                    record(err, name, value, definition);
                    return nextName();
                }

                internals.decode(unsigned, definition, (err, result) => {

                    if (err) {
                        record(err, name, value, definition);
                        return nextArray();
                    }

                    arrayResult.push(result);
                    nextArray();
                });
            });
        },
        (ignoreErr) => {                // Error not possible

            parsed[name] = arrayResult;
            return nextName();
        });
    },
    (ignoreErr) => {                    // Error not possible

        return next(errored.length ? Boom.badRequest('Invalid cookie value', errored) : null, parsed, failed);
    });
};


internals.macPrefix = 'hapi.signed.cookie.1';


internals.unsign = function (name, value, definition, next) {

    if (!definition.sign) {
        return next(null, value);
    }

    const pos = value.lastIndexOf('.');
    if (pos === -1) {
        return next(Boom.badRequest('Missing signature separator'));
    }

    const unsigned = value.slice(0, pos);
    const sig = value.slice(pos + 1);

    if (!sig) {
        return next(Boom.badRequest('Missing signature'));
    }

    const sigParts = sig.split('*');
    if (sigParts.length !== 2) {
        return next(Boom.badRequest('Invalid signature format'));
    }

    const hmacSalt = sigParts[0];
    const hmac = sigParts[1];

    const macOptions = Hoek.clone(definition.sign.integrity || Iron.defaults.integrity);
    macOptions.salt = hmacSalt;
    Iron.hmacWithPassword(definition.sign.password, macOptions, [internals.macPrefix, name, unsigned].join('\n'), (err, mac) => {

        if (err) {
            return next(err);
        }

        if (!Cryptiles.fixedTimeComparison(mac.digest, hmac)) {
            return next(Boom.badRequest('Invalid hmac value'));
        }

        return next(null, unsigned);
    });
};


internals.decode = function (value, definition, next) {

    if (!value &&
        definition.encoding === 'form') {

        return next(null, {});
    }

    Hoek.assert(typeof value === 'string', 'Invalid string');

    // Encodings: 'base64json', 'base64', 'form', 'iron', 'none'

    if (definition.encoding === 'iron') {
        Iron.unseal(value, definition.password, definition.iron || Iron.defaults, (err, unsealed) => {

            if (err) {
                return next(err);
            }

            return next(null, unsealed);
        });

        return;
    }

    let result = value;

    try {
        if (definition.encoding === 'base64json') {
            const decoded = (new Buffer(value, 'base64')).toString('binary');
            result = JSON.parse(decoded);
        }
        else if (definition.encoding === 'base64') {
            result = (new Buffer(value, 'base64')).toString('binary');
        }
        else {                                                                  // encoding: 'form'
            result = Querystring.parse(value);
        }
    }
    catch (err) {
        return next(err);
    }

    return next(null, result);
};


internals.Definitions.prototype.format = function (cookies, callback) {

    if (!cookies ||
        (Array.isArray(cookies) && !cookies.length)) {

        return Hoek.nextTick(callback)(null, []);
    }

    if (!Array.isArray(cookies)) {
        cookies = [cookies];
    }

    const header = [];
    Items.serial(cookies, (cookie, next) => {

        // Apply definition to local configuration

        const base = this.cookies[cookie.name] || this.settings;
        const definition = cookie.options ? Hoek.applyToDefaults(base, cookie.options, true) : base;

        // Validate name

        const nameRx = (definition.strictHeader ? internals.validateRx.nameRx.strict : internals.validateRx.nameRx.loose);
        if (!nameRx.test(cookie.name)) {
            return callback(Boom.badImplementation('Invalid cookie name: ' + cookie.name));
        }

        // Prepare value (encode, sign)

        exports.prepareValue(cookie.name, cookie.value, definition, (err, value) => {

            if (err) {
                return callback(err);
            }

            // Validate prepared value

            const valueRx = (definition.strictHeader ? internals.validateRx.valueRx.strict : internals.validateRx.valueRx.loose);
            if (value &&
                (typeof value !== 'string' || !value.match(valueRx))) {

                return callback(Boom.badImplementation('Invalid cookie value: ' + cookie.value));
            }

            // Construct cookie

            let segment = cookie.name + '=' + (value || '');

            if (definition.ttl !== null &&
                definition.ttl !== undefined) {            // Can be zero

                const expires = new Date(definition.ttl ? Date.now() + definition.ttl : 0);
                segment = segment + '; Max-Age=' + Math.floor(definition.ttl / 1000) + '; Expires=' + expires.toUTCString();
            }

            if (definition.isSecure) {
                segment = segment + '; Secure';
            }

            if (definition.isHttpOnly) {
                segment = segment + '; HttpOnly';
            }

            if (definition.isSameSite) {
                segment = segment + `; SameSite=${definition.isSameSite}`;
            }

            if (definition.domain) {
                const domain = definition.domain.toLowerCase();
                if (!domain.match(internals.validateRx.domainLabelLenRx)) {
                    return callback(Boom.badImplementation('Cookie domain too long: ' + definition.domain));
                }

                if (!domain.match(internals.validateRx.domainRx)) {
                    return callback(Boom.badImplementation('Invalid cookie domain: ' + definition.domain));
                }

                segment = segment + '; Domain=' + domain;
            }

            if (definition.path) {
                if (!definition.path.match(internals.validateRx.pathRx)) {
                    return callback(Boom.badImplementation('Invalid cookie path: ' + definition.path));
                }

                segment = segment + '; Path=' + definition.path;
            }

            header.push(segment);
            return next();
        });
    },
    (ignoreErr) => {                // Error not possible

        return callback(null, header);
    });
};


exports.prepareValue = function (name, value, options, callback) {

    Hoek.assert(options && typeof options === 'object', 'Missing or invalid options');

    // Encode value

    internals.encode(value, options, (err, encoded) => {

        if (err) {
            return callback(Boom.badImplementation('Failed to encode cookie (' + name + ') value: ' + err.message));
        }

        // Sign cookie

        internals.sign(name, encoded, options.sign, (err, signed) => {

            if (err) {
                return callback(Boom.badImplementation('Failed to sign cookie (' + name + ') value: ' + err.message));
            }

            return callback(null, signed);
        });
    });
};


internals.encode = function (value, options, callback) {

    callback = Hoek.nextTick(callback);

    // Encodings: 'base64json', 'base64', 'form', 'iron', 'none'

    if (value === undefined) {
        return callback(null, value);
    }

    if (options.encoding === 'none') {
        return callback(null, value);
    }

    if (options.encoding === 'iron') {
        Iron.seal(value, options.password, options.iron || Iron.defaults, (err, sealed) => {

            if (err) {
                return callback(err);
            }

            return callback(null, sealed);
        });

        return;
    }

    let result = value;

    try {
        if (options.encoding === 'base64') {
            result = (new Buffer(value, 'binary')).toString('base64');
        }
        else if (options.encoding === 'base64json') {
            const stringified = JSON.stringify(value);
            result = (new Buffer(stringified, 'binary')).toString('base64');
        }
        else {                                                                  // encoding: 'form'
            result = Querystring.stringify(value);
        }
    }
    catch (err) {
        return callback(err);
    }

    return callback(null, result);
};


internals.sign = function (name, value, options, callback) {

    if (value === undefined ||
        !options) {

        return Hoek.nextTick(callback)(null, value);
    }

    Iron.hmacWithPassword(options.password, options.integrity || Iron.defaults.integrity, [internals.macPrefix, name, value].join('\n'), (err, mac) => {

        if (err) {
            return callback(err);
        }

        const signed = value + '.' + mac.salt + '*' + mac.digest;
        return callback(null, signed);
    });
};


internals.Definitions.prototype.passThrough = function (header, fallback) {

    if (!this.names.length) {
        return header;
    }

    const exclude = [];
    for (let i = 0; i < this.names.length; ++i) {
        const name = this.names[i];
        const definition = this.cookies[name];
        const passCookie = definition.passThrough !== undefined ? definition.passThrough : fallback;
        if (!passCookie) {
            exclude.push(name);
        }
    }

    return exports.exclude(header, exclude);
};


exports.exclude = function (cookies, excludes) {

    let result = '';
    const verify = cookies.replace(internals.pairsRx, ($0, $1, $2) => {

        if (excludes.indexOf($1) === -1) {
            result = result + (result ? ';' : '') + $1 + '=' + $2;
        }

        return '';
    });

    return verify === '' ? result : Boom.badRequest('Invalid cookie header');
};
