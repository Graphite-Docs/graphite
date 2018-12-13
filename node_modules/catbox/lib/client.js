'use strict';

// Load modules

const Hoek = require('hoek');
const Boom = require('boom');


// Declare internals

const internals = {};


internals.defaults = {
    partition: 'catbox'
};


module.exports = internals.Client = function (engine, options) {

    Hoek.assert(this instanceof internals.Client, 'Cache client must be instantiated using new');
    Hoek.assert(engine, 'Missing catbox client engine');
    Hoek.assert(typeof engine === 'object' || typeof engine === 'function', 'engine must be an engine object or engine prototype (function)');
    Hoek.assert(typeof engine === 'function' || !options, 'Can only specify options with function engine config');

    const settings = Hoek.applyToDefaults(internals.defaults, options || {});
    Hoek.assert(settings.partition.match(/^[\w\-]+$/), 'Invalid partition name:' + settings.partition);

    this.connection = (typeof engine === 'object' ? engine : new engine(settings));
};


internals.Client.prototype.stop = function () {

    this.connection.stop();
};


internals.Client.prototype.start = function (callback) {

    this.connection.start(callback);
};


internals.Client.prototype.isReady = function () {

    return this.connection.isReady();
};


internals.Client.prototype.validateSegmentName = function (name) {

    return this.connection.validateSegmentName(name);
};


internals.Client.prototype.get = function (key, callback) {

    if (!this.connection.isReady()) {
        // Disconnected
        return callback(Boom.internal('Disconnected'));
    }

    if (!key) {
        // Not found on null
        return callback(null, null);
    }

    if (!internals.validateKey(key)) {
        return callback(Boom.internal('Invalid key'));
    }

    this.connection.get(key, (err, result) => {

        if (err) {
            // Connection error
            return callback(err);
        }

        if (!result ||
            result.item === undefined ||
            result.item === null) {

            // Not found
            return callback(null, null);
        }

        const now = Date.now();
        const expires = result.stored + result.ttl;
        const ttl = expires - now;
        if (ttl <= 0) {
            // Expired
            return callback(null, null);
        }

        // Valid

        const cached = {
            item: result.item,
            stored: result.stored,
            ttl
        };

        return callback(null, cached);
    });
};


internals.Client.prototype.set = function (key, value, ttl, callback) {

    if (!this.connection.isReady()) {
        // Disconnected
        return callback(Boom.internal('Disconnected'));
    }

    if (!internals.validateKey(key)) {
        return callback(Boom.internal('Invalid key'));
    }

    if (ttl <= 0) {
        // Not cachable (or bad rules)
        return callback();
    }

    this.connection.set(key, value, ttl, callback);
};


internals.Client.prototype.drop = function (key, callback) {

    if (!this.connection.isReady()) {
        // Disconnected
        return callback(Boom.internal('Disconnected'));
    }

    if (!internals.validateKey(key)) {
        return callback(Boom.internal('Invalid key'));
    }

    this.connection.drop(key, callback);           // Always drop, regardless of caching rules
};


internals.validateKey = function (key) {

    return (key && typeof key.id === 'string' && key.segment && typeof key.segment === 'string');
};
