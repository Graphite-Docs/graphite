'use strict';

// Load modules

const Crypto = require('crypto');
const Boom = require('boom');
const Hoek = require('hoek');
const LruCache = require('lru-cache');


// Declare internals

const internals = {
    pendings: Object.create(null)
};


internals.computeHashed = function (response, stat, next) {

    const etags = response.request.server.plugins.inert._etags;
    if (!etags) {
        return next(null, null);
    }

    // Use stat info for an LRU cache key.

    const path = response.source.path;
    const cachekey = [path, stat.ino, stat.size, stat.mtime.getTime()].join('-');

    // The etag hashes the file contents in order to be consistent across distributed deployments

    const cachedEtag = etags.get(cachekey);
    if (cachedEtag) {
        return next(null, cachedEtag);
    }

    let nexts = internals.pendings[cachekey];
    if (nexts) {
        return nexts.push(next);
    }

    // Start hashing

    nexts = [next];
    internals.pendings[cachekey] = nexts;

    internals.hashFile(response, (err, hash) => {

        if (!err) {
            etags.set(cachekey, hash);
        }

        // Call pending callbacks

        delete internals.pendings[cachekey];
        for (let i = 0; i < nexts.length; ++i) {
            Hoek.nextTick(nexts[i])(err, hash);
        }
    });
};


internals.hashFile = function (response, callback) {

    const hash = Crypto.createHash('sha1');
    hash.setEncoding('hex');

    const fileStream = response.source.file.createReadStream({ autoClose: false });
    fileStream.pipe(hash);

    let done = function (err) {

        if (err) {
            return callback(Boom.boomify(err, { message: 'Failed to hash file' }));
        }

        return callback(null, hash.read());
    };

    done = Hoek.once(done);

    fileStream.on('end', done);
    fileStream.on('error', done);
};


internals.computeSimple = function (response, stat, next) {

    const size = stat.size.toString(16);
    const mtime = stat.mtime.getTime().toString(16);

    return next(null, size + '-' + mtime);
};


exports.apply = function (response, stat, next) {

    const etagMethod = response.source.settings.etagMethod;
    if (etagMethod === false) {
        return next();
    }

    const applyEtag = (err, etag) => {

        if (err) {
            return next(err);
        }

        if (etag !== null) {
            response.etag(etag, { vary: true });
        }

        return next();
    };

    if (etagMethod === 'simple') {
        return internals.computeSimple(response, stat, applyEtag);
    }

    return internals.computeHashed(response, stat, applyEtag);
};


exports.Cache = LruCache;
