'use strict';

// Load modules

const Hoek = require('hoek');
const Items = require('items');
const Joi = require('joi');


// Declare internals

const internals = {
    schema: {
        base: Joi.object({
            name: Joi.string().required(),
            clone: Joi.boolean(),
            tags: Joi.boolean(),
            spread: Joi.boolean(),
            channels: Joi.array().items(Joi.string()).single().unique().min(1)
        })
    }
};


internals.schema.event = internals.schema.base.keys({
    shared: Joi.boolean()
});


internals.schema.listener = internals.schema.event.keys({
    listener: Joi.func().required(),
    block: Joi.number().integer().min(1).allow(true),
    count: Joi.number().integer().min(1),
    filter: {
        tags: Joi.array().items(Joi.string()).single().unique().min(1).required(),
        all: Joi.boolean()
    }
});


exports = module.exports = internals.Podium = function (events) {

    // Use descriptive names to avoid conflict when inherited

    this._eventListeners = Object.create(null);
    this._notificationsQueue = [];
    this._eventsProcessing = false;
    this._sourcePodiums = [];

    this.onPodiumError = null;

    if (events) {
        this.registerEvent(events);
    }
};


internals.Podium.decorate = function (target, source) {

    internals.Podium.call(target, null);

    Object.keys(source._eventListeners).forEach((name) => {

        target._eventListeners[name] = {
            handlers: null,
            flags: source._eventListeners[name].flags
        };
    });
};


internals.Podium.prototype.registerEvent = function (events) {

    events = Hoek.flatten([].concat(events));
    events.forEach((event) => {

        if (!event) {
            return;
        }

        if (event instanceof internals.Podium) {
            return this.registerPodium(event);
        }

        if (typeof event === 'string') {
            event = { name: event };
        }

        event = Joi.attempt(event, internals.schema.event, 'Invalid event options');

        const name = event.name;
        if (this._eventListeners[name]) {
            Hoek.assert(event.shared, `Event ${name} exists`);
            return;
        }

        this._eventListeners[name] = { handlers: null, flags: event };
        this._sourcePodiums.forEach((podium) => {

            if (!podium._eventListeners[name]) {
                podium._eventListeners[name] = { handlers: null, flags: event };
            }
        });
    });
};


internals.Podium.prototype.registerPodium = function (podiums) {

    [].concat(podiums).forEach((podium) => {

        if (podium._sourcePodiums.indexOf(this) !== -1) {
            return;
        }

        podium._sourcePodiums.push(this);
        Object.keys(podium._eventListeners).forEach((name) => {

            if (!this._eventListeners[name]) {
                this._eventListeners[name] = { handlers: null, flags: podium._eventListeners[name].flags };
            }
        });
    });
};


internals.Podium.prototype.emit = function (criteria, data, callback) {

    return this._emit(criteria, data, false, callback);
};


internals.Podium.prototype._emit = function (criteria, data, generated, callback) {

    criteria = internals.criteria(criteria);

    const name = criteria.name;
    Hoek.assert(name, 'Criteria missing event name');

    const event = this._eventListeners[name];
    Hoek.assert(event, `Unknown event ${name}`);
    Hoek.assert(!event.flags.spread || Array.isArray(data) || typeof data === 'function', 'Data must be an array for spread event');
    Hoek.assert(!criteria.channel || typeof criteria.channel === 'string', 'Invalid channel name');
    Hoek.assert(!criteria.channel || !event.flags.channels || event.flags.channels.indexOf(criteria.channel) !== -1, `Unknown ${criteria.channel} channel`);

    if (typeof criteria.tags === 'string') {
        criteria.tags = [criteria.tags];
    }

    if (criteria.tags &&
        Array.isArray(criteria.tags)) {

        criteria.tags = Hoek.mapToObject(criteria.tags);
    }

    internals.emit(this, { criteria, data, callback, generated });
};


internals.emit = function (emitter, notification) {

    if (notification) {
        emitter._notificationsQueue.push(notification);
    }

    if (emitter._eventsProcessing ||
        !emitter._notificationsQueue.length) {

        return;
    }

    emitter._eventsProcessing = true;
    const item = emitter._notificationsQueue.shift();

    const event = emitter._eventListeners[item.criteria.name];
    const handlers = event.handlers;

    const finalize = () => {

        if (item.callback) {
            process.nextTick(internals.itemCallback, item);
        }

        emitter._eventsProcessing = false;
        process.nextTick(internals.emitEmitter, emitter);
    };

    let data = item.data;
    let generated = item.generated;

    const relay = () => {

        if (!emitter._sourcePodiums.length) {
            return finalize();
        }

        const each = (podium, next) => podium._emit(item.criteria, data, generated, next);        // User _emit() in case emit() was modified
        Items.parallel(emitter._sourcePodiums.slice(), each, finalize);
    };

    if (!handlers) {
        return relay();
    }

    const each = (handler, next) => {

        if (handler.count) {
            --handler.count;
            if (handler.count < 1) {
                internals.removeHandler(emitter, item.criteria.name, handler);
            }
        }

        const invoke = (func) => {

            if (handler.channels &&
                (!item.criteria.channel || handler.channels.indexOf(item.criteria.channel) === -1)) {

                return;
            }

            if (handler.filter) {
                if (!item.criteria.tags) {
                    return;
                }

                const match = Hoek.intersect(item.criteria.tags, handler.filter.tags, !handler.filter.all);
                if (!match ||
                    (handler.filter.all && match.length !== handler.filter.tags.length)) {

                    return;
                }
            }

            if (!generated &&
                typeof data === 'function') {

                data = item.data();
                generated = true;
            }

            const update = (internals.flag('clone', handler, event) ? Hoek.clone(data) : data);
            const args = (internals.flag('spread', handler, event) && Array.isArray(update) ? update : [update]);

            if (internals.flag('tags', handler, event) &&
                item.criteria.tags) {

                args.push(item.criteria.tags);
            }

            if (func) {
                args.push(func);
            }

            internals.handler(handler, args, emitter);
        };

        if (!handler.block) {
            invoke();
            return next();
        }

        let timer = null;
        if (handler.block !== true) {
            next = Hoek.once(next);
            timer = setTimeout(next, handler.block);
        }

        invoke(() => {

            clearTimeout(timer);
            return next();
        });
    };

    return Items.parallel(handlers.slice(), each, relay);        // Clone in case handlers are changed by listeners
};


internals.handler = function (handler, args, emitter) {

    if (!emitter.onPodiumError) {
        return handler.listener.apply(null, args);
    }

    try {
        handler.listener.apply(null, args);
    }
    catch (err) {
        emitter.onPodiumError(err);
    }
};


internals.itemCallback = function (item) {

    item.callback();
};


internals.emitEmitter = function (emitter) {

    internals.emit(emitter);
};


internals.Podium.prototype.on = internals.Podium.prototype.addListener = function (criteria, listener) {

    criteria = internals.criteria(criteria);
    criteria.listener = listener;

    if (criteria.filter &&
        (typeof criteria.filter === 'string' || Array.isArray(criteria.filter))) {

        criteria.filter = { tags: criteria.filter };
    }

    criteria = Joi.attempt(criteria, internals.schema.listener, 'Invalid event listener options');

    const name = criteria.name;
    const event = this._eventListeners[name];
    Hoek.assert(event, `Unknown event ${name}`);
    Hoek.assert(!criteria.channels || !event.flags.channels || Hoek.intersect(event.flags.channels, criteria.channels).length === criteria.channels.length, `Unknown event channels ${criteria.channels && criteria.channels.join(', ')}`);

    this._eventListeners[name].handlers = this._eventListeners[name].handlers || [];
    this._eventListeners[name].handlers.push(criteria);

    return this;
};


internals.Podium.prototype.once = function (criteria, listener) {

    criteria = internals.criteria(criteria);
    return this.on(Object.assign(criteria, { count: 1 }), listener);
};


internals.Podium.prototype.removeListener = function (name, listener) {

    Hoek.assert(this._eventListeners[name], `Unknown event ${name}`);
    Hoek.assert(typeof listener === 'function', 'Listener must be a function');

    const handlers = this._eventListeners[name].handlers;
    if (!handlers) {
        return this;
    }

    const filtered = handlers.filter((handler) => handler.listener !== listener);
    this._eventListeners[name].handlers = (filtered.length ? filtered : null);
    return this;
};


internals.Podium.prototype.removeAllListeners = function (name) {

    Hoek.assert(this._eventListeners[name], `Unknown event ${name}`);
    this._eventListeners[name].handlers = null;
    return this;
};


internals.Podium.prototype.hasListeners = function (name) {

    Hoek.assert(this._eventListeners[name], `Unknown event ${name}`);
    return !!this._eventListeners[name].handlers;
};


internals.removeHandler = function (emitter, name, handler) {

    const handlers = emitter._eventListeners[name].handlers;
    const filtered = handlers.filter((item) => item !== handler);
    emitter._eventListeners[name].handlers = (filtered.length ? filtered : null);
};


internals.criteria = function (criteria) {

    return (typeof criteria === 'string' ? { name: criteria } : criteria);
};


internals.flag = function (name, handler, event) {

    return (handler[name] !== undefined ? handler[name] : event.flags[name]) || false;
};
