'use strict';

// Load modules

const Fs = require('fs');
const Os = require('os');
const Querystring = require('querystring');
const Stream = require('stream');
const Zlib = require('zlib');
const Boom = require('boom');
const Content = require('content');
const Hoek = require('hoek');
const Pez = require('pez');
const Wreck = require('wreck');


// Declare internals

const internals = {
    decoders: {
        gzip: (options) => Zlib.createGunzip(options),
        deflate: (options) => Zlib.createInflate(options)
    }
};


exports.parse = function (req, tap, options, next) {

    Hoek.assert(options, 'Missing options');
    Hoek.assert(options.parse !== undefined, 'Missing parse option setting');
    Hoek.assert(options.output !== undefined, 'Missing output option setting');

    const parser = new internals.Parser(req, tap, options, next);
    return parser.read();
};


internals.Parser = function (req, tap, options, next) {

    this.req = req;
    this.settings = options;
    this.tap = tap;

    this.result = {};
    this.next = (err) => next(err, this.result);
};


internals.Parser.prototype.read = function () {

    const next = this.next;

    // Content size

    const req = this.req;
    const contentLength = req.headers['content-length'];
    if (this.settings.maxBytes !== undefined &&
        contentLength &&
        parseInt(contentLength, 10) > this.settings.maxBytes) {

        return next(Boom.entityTooLarge('Payload content length greater than maximum allowed: ' + this.settings.maxBytes));
    }

    // Content type

    const contentType = Content.type(this.settings.override || req.headers['content-type'] || this.settings.defaultContentType || 'application/octet-stream');
    if (contentType.isBoom) {
        return next(contentType);
    }

    this.result.contentType = contentType;
    this.result.mime = contentType.mime;

    if (this.settings.allow &&
        this.settings.allow.indexOf(contentType.mime) === -1) {

        return next(Boom.unsupportedMediaType());
    }

    // Parse: true

    if (this.settings.parse === true) {
        return this.parse(contentType);
    }

    // Parse: false, 'gunzip'

    return this.raw();
};


internals.Parser.prototype.parse = function (contentType) {

    let next = this.next;

    const output = this.settings.output;        // Output: 'data', 'stream', 'file'
    let source = this.req;

    // Content-encoding

    const contentEncoding = source.headers['content-encoding'];
    const decoder = (this.settings.decoders || internals.decoders)[contentEncoding];
    if (decoder) {
        const decoderOptions = (this.settings.compression && this.settings.compression[contentEncoding]) || null;
        const stream = decoder(decoderOptions);
        next = Hoek.once(next);                 // Modify next() for async events
        this.next = next;
        stream.once('error', (err) => {

            return next(Boom.badRequest('Invalid compressed payload', err));
        });

        source = source.pipe(stream);
    }

    // Tap request

    if (this.tap) {
        source = source.pipe(this.tap);
    }

    // Multipart

    if (this.result.contentType.mime === 'multipart/form-data') {
        if (this.settings.multipart === false) {                            // Defaults to true
            return next(Boom.unsupportedMediaType());
        }

        return this.multipart(source, contentType);
    }

    // Output: 'stream'

    if (output === 'stream') {
        this.result.payload = source;
        return next();
    }

    // Output: 'file'

    if (output === 'file') {
        this.writeFile(source, (err, path, bytes) => {

            if (err) {
                return next(err);
            }

            this.result.payload = { path, bytes };
            return next();
        });

        return;
    }

    // Output: 'data'

    return Wreck.read(source, { timeout: this.settings.timeout, maxBytes: this.settings.maxBytes }, (err, payload) => {

        if (err) {
            return next(err);
        }

        this.object(payload, this.result.contentType.mime, (err, result) => {

            if (err) {
                this.result.payload = null;
                err.raw = payload;
                return next(err);
            }

            this.result.payload = result;
            return next();
        });
    });
};


internals.Parser.prototype.raw = function () {

    let next = this.next;

    const output = this.settings.output;      // Output: 'data', 'stream', 'file'
    let source = this.req;

    // Content-encoding

    if (this.settings.parse === 'gunzip') {
        const contentEncoding = source.headers['content-encoding'];
        const decoder = (this.settings.decoders || internals.decoders)[contentEncoding];
        if (decoder) {
            const decoderOptions = (this.settings.compression && this.settings.compression[contentEncoding]) || null;
            const stream = decoder(decoderOptions);
            next = Hoek.once(next);                                                                     // Modify next() for async events

            stream.once('error', (err) => {

                return next(Boom.badRequest('Invalid compressed payload', err));
            });

            source = source.pipe(stream);
        }
    }

    // Setup source

    if (this.tap) {
        source = source.pipe(this.tap);
    }

    // Output: 'stream'

    if (output === 'stream') {
        this.result.payload = source;
        return next();
    }

    // Output: 'file'

    if (output === 'file') {
        this.writeFile(source, (err, path, bytes) => {

            if (err) {
                return next(err);
            }

            this.result.payload = { path, bytes };
            return next();
        });

        return;
    }

    // Output: 'data'

    return Wreck.read(source, { timeout: this.settings.timeout, maxBytes: this.settings.maxBytes }, (err, payload) => {

        if (err) {
            return next(err);
        }

        this.result.payload = payload;
        return next();
    });
};


internals.Parser.prototype.object = function (payload, mime, next) {

    // Binary

    if (mime === 'application/octet-stream') {
        return next(null, payload.length ? payload : null);
    }

    // Text

    if (mime.match(/^text\/.+$/)) {
        return next(null, payload.toString('utf8'));
    }

    // JSON

    if (/^application\/(?:.+\+)?json$/.test(mime)) {
        return internals.jsonParse(payload, next);                      // Isolate try...catch for V8 optimization
    }

    // Form-encoded

    if (mime === 'application/x-www-form-urlencoded') {
        const parse = (this.settings.querystring || Querystring.parse);
        return next(null, payload.length ? parse(payload.toString('utf8')) : {});
    }

    return next(Boom.unsupportedMediaType());
};


internals.jsonParse = function (payload, next) {

    if (!payload.length) {
        return next(null, null);
    }

    let parsed;
    try {
        parsed = JSON.parse(payload.toString('utf8'));
    }
    catch (err) {
        return next(Boom.badRequest('Invalid request payload JSON format', err));
    }

    return next(null, parsed);
};


internals.Parser.prototype.multipart = function (source, contentType) {

    let next = this.next;
    next = Hoek.once(next);                                            // Modify next() for async events
    this.next = next;

    // Set stream timeout

    const clientTimeout = this.settings.timeout;
    let clientTimeoutId = null;

    const dispenserOptions = Hoek.applyToDefaults(contentType, { maxBytes: this.settings.maxBytes });
    const dispenser = new Pez.Dispenser(dispenserOptions);

    const onError = (err) => {

        return next(Boom.badRequest('Invalid multipart payload format', err));
    };

    dispenser.once('error', onError);

    const data = {};
    const finalize = () => {

        clearTimeout(clientTimeoutId);
        dispenser.removeListener('error', onError);
        dispenser.removeListener('part', onPart);
        dispenser.removeListener('field', onField);
        dispenser.removeListener('close', onClose);

        this.result.payload = data;
        return next();
    };

    if (clientTimeout &&
        clientTimeout > 0) {

        clientTimeoutId = setTimeout(() => {

            return next(Boom.clientTimeout());
        }, clientTimeout);
    }

    const set = (name, value) => {

        if (!data.hasOwnProperty(name)) {
            data[name] = value;
        }
        else if (Array.isArray(data[name])) {
            data[name].push(value);
        }
        else {
            data[name] = [data[name], value];
        }
    };

    const pendingFiles = {};
    let nextId = 0;
    let closed = false;

    const output = (this.settings.multipart ? this.settings.multipart.output : this.settings.output);

    const onPart = (part) => {

        if (output === 'file') {                                                                // Output: 'file'
            const id = nextId++;
            pendingFiles[id] = true;
            this.writeFile(part, (err, path, bytes) => {

                delete pendingFiles[id];

                if (err) {
                    return next(err);
                }

                const item = {
                    filename: part.filename,
                    path,
                    headers: part.headers,
                    bytes
                };

                set(part.name, item);

                if (closed &&
                    !Object.keys(pendingFiles).length) {

                    return finalize(data);
                }
            });
        }
        else {                                                                                  // Output: 'data'
            Wreck.read(part, {}, (ignoreErr, payload) => {

                // Error handled by dispenser.once('error')

                if (output === 'stream') {                                                      // Output: 'stream'
                    const item = Wreck.toReadableStream(payload);

                    item.hapi = {
                        filename: part.filename,
                        headers: part.headers
                    };

                    return set(part.name, item);
                }

                const ct = part.headers['content-type'] || '';
                const mime = ct.split(';')[0].trim().toLowerCase();
                const annotate = (value) => set(part.name, output === 'annotated' ? { filename: part.filename, headers: part.headers, payload: value } : value);

                if (!mime) {
                    return annotate(payload);
                }

                if (!payload.length) {
                    return annotate({});
                }

                this.object(payload, mime, (err, result) => annotate(err ? payload : result));
            });
        }
    };

    dispenser.on('part', onPart);

    const onField = (name, value) => set(name, value);

    dispenser.on('field', onField);

    const onClose = () => {

        if (Object.keys(pendingFiles).length) {
            closed = true;
            return;
        }

        return finalize(data);
    };

    dispenser.once('close', onClose);

    source.pipe(dispenser);
};


internals.Parser.prototype.writeFile = function (stream, callback) {

    const path = Hoek.uniqueFilename(this.settings.uploads || Os.tmpdir());
    const file = Fs.createWriteStream(path, { flags: 'wx' });
    const counter = new internals.Counter();

    const finalize = Hoek.once((err) => {

        this.req.removeListener('aborted', onAbort);
        file.removeListener('close', finalize);
        file.removeListener('error', finalize);

        if (!err) {
            return callback(null, path, counter.bytes);
        }

        file.destroy();
        Fs.unlink(path, (/* fsErr */) => {      // Ignore unlink errors

            return callback(err);
        });
    });

    file.once('close', finalize);
    file.once('error', finalize);

    const onAbort = () => {

        return finalize(Boom.badRequest('Client connection aborted'));
    };

    this.req.once('aborted', onAbort);

    stream.pipe(counter).pipe(file);
};


internals.Counter = function () {

    Stream.Transform.call(this);
    this.bytes = 0;
};

Hoek.inherits(internals.Counter, Stream.Transform);


internals.Counter.prototype._transform = function (chunk, encoding, next) {

    this.bytes = this.bytes + chunk.length;
    return next(null, chunk);
};
