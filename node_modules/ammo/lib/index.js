'use strict';

// Load modules

const Stream = require('stream');
const Hoek = require('hoek');


// Declare internals

const internals = {};


exports.header = function (header, length) {

    // Parse header

    const parts = header.split('=');
    if (parts.length !== 2 ||
        parts[0] !== 'bytes') {

        return null;
    }

    const lastPos = length - 1;

    const result = [];
    const ranges = parts[1].match(/\d*\-\d*/g);

    // Handle headers with multiple ranges

    for (let i = 0; i < ranges.length; ++i) {
        let range = ranges[i];
        if (range.length === 1) {               // '-'
            return null;
        }

        const set = {};
        range = range.split('-');
        if (range[0]) {
            set.from = parseInt(range[0], 10);
        }

        if (range[1]) {
            set.to = parseInt(range[1], 10);
            if (set.from !== undefined) {      // Can be 0
                // From-To
                if (set.to > lastPos) {
                    set.to = lastPos;
                }
            }
            else {
                // -To
                set.from = length - set.to;
                set.to = lastPos;
            }
        }
        else {
            // From-
            set.to = lastPos;
        }

        if (set.from > set.to) {
            return null;
        }

        result.push(set);
    }

    if (result.length === 1) {
        return result;
    }

    // Sort and consolidate ranges

    result.sort((a, b) => a.from - b.from);

    const consolidated = [];
    for (let i = result.length - 1; i > 0; --i) {
        const current = result[i];
        const before = result[i - 1];
        if (current.from <= before.to + 1) {
            before.to = current.to;
        }
        else {
            consolidated.unshift(current);
        }
    }

    consolidated.unshift(result[0]);

    return consolidated;
};


exports.Stream = internals.Stream = function (range) {

    Stream.Transform.call(this);

    this._range = range;
    this._next = 0;
};

Hoek.inherits(internals.Stream, Stream.Transform);


internals.Stream.prototype._transform = function (chunk, encoding, done) {

    // Read desired range from a stream

    const pos = this._next;
    this._next = this._next + chunk.length;

    if (this._next <= this._range.from ||       // Before range
        pos > this._range.to) {                 // After range

        return done();
    }

    // Calc bounds of chunk to read

    const from = Math.max(0, this._range.from - pos);
    const to = Math.min(chunk.length, this._range.to - pos + 1);

    this.push(chunk.slice(from, to));
    return done();
};
