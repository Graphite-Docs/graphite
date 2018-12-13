var WildEmitter = require('wildemitter');
var util = require('util');
var hashes = require('iana-hashes');
var base = require('./filetransfer');

// drop-in replacement for filetransfer which also calculates hashes
function Sender(opts) {
    WildEmitter.call(this);
    var self = this;
    this.base = new base.Sender(opts);

    var options = opts || {};
    if (!options.hash) {
        options.hash = 'sha-1';
    }
    this.hash = hashes.createHash(options.hash);

    this.base.on('progress', function (start, size, data) {
        self.emit('progress', start, size, data);
        if (data) {
            self.hash.update(new Uint8Array(data));
        }
    });
    this.base.on('sentFile', function () {
        self.emit('sentFile', {hash: self.hash.digest('hex'), algo: options.hash });
    });
}
util.inherits(Sender, WildEmitter);
Sender.prototype.send = function () {
    this.base.send.apply(this.base, arguments);
};

function Receiver(opts) {
    WildEmitter.call(this);
    var self = this;
    this.base = new base.Receiver(opts);

    var options = opts || {};
    if (!options.hash) {
        options.hash = 'sha-1';
    }
    this.hash = hashes.createHash(options.hash);

    this.base.on('progress', function (start, size, data) {
        self.emit('progress', start, size, data);
        if (data) {
            self.hash.update(new Uint8Array(data));
        }
    });
    this.base.on('receivedFile', function (file, metadata) {
        metadata.actualhash = self.hash.digest('hex');
        self.emit('receivedFile', file, metadata);
    });
}
util.inherits(Receiver, WildEmitter);
Receiver.prototype.receive = function () {
    this.base.receive.apply(this.base, arguments);
};
Object.defineProperty(Receiver.prototype, 'metadata', {
    get: function () {
        return this.base.metadata;
    },
    set: function (value) {
        this.base.metadata = value;
    }
});

module.exports = {};
module.exports.support = base.support;
module.exports.Sender = Sender;
module.exports.Receiver = Receiver;
