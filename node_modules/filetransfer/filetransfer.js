var WildEmitter = require('wildemitter');
var util = require('util');

function Sender(opts) {
    WildEmitter.call(this);
    var options = opts || {};
    this.config = {
        chunksize: 16384,
        pacing: 0
    };
    // set our config from options
    var item;
    for (item in options) {
        this.config[item] = options[item];
    }

    this.file = null;
    this.channel = null;
}
util.inherits(Sender, WildEmitter);

Sender.prototype.send = function (file, channel) {
    var self = this;
    this.file = file;
    this.channel = channel;
    var usePoll = typeof channel.bufferedAmountLowThreshold !== 'number';
    var offset = 0;
    var sliceFile = function() {
        var reader = new window.FileReader();
        reader.onload = (function() {
            return function(e) {
                self.channel.send(e.target.result);
                self.emit('progress', offset, file.size, e.target.result);

                if (file.size > offset + e.target.result.byteLength) {
                    if (usePoll) {
                        window.setTimeout(sliceFile, self.config.pacing);
                    } else if (channel.bufferedAmount <= channel.bufferedAmountLowThreshold) {
                        window.setTimeout(sliceFile, 0);
                    } else {
                        // wait for bufferedAmountLow to fire
                    }
                } else {
                    self.emit('progress', file.size, file.size, null);
                    self.emit('sentFile');
                }
                offset = offset + self.config.chunksize;
            };
        })(file);
        var slice = file.slice(offset, offset + self.config.chunksize);
        reader.readAsArrayBuffer(slice);
    };
    if (!usePoll) {
        channel.bufferedAmountLowThreshold = 8 * this.config.chunksize;
        channel.addEventListener('bufferedamountlow', sliceFile);
    }
    window.setTimeout(sliceFile, 0);
};

function Receiver() {
    WildEmitter.call(this);

    this.receiveBuffer = [];
    this.received = 0;
    this.metadata = {};
    this.channel = null;
}
util.inherits(Receiver, WildEmitter);

Receiver.prototype.receive = function (metadata, channel) {
    var self = this;

    if (metadata) {
        this.metadata = metadata;
    }
    this.channel = channel;
    // chrome only supports arraybuffers and those make it easier to calc the hash
    channel.binaryType = 'arraybuffer';
    this.channel.onmessage = function (event) {
        var len = event.data.byteLength;
        self.received += len;
        self.receiveBuffer.push(event.data);

        self.emit('progress', self.received, self.metadata.size, event.data);
        if (self.received === self.metadata.size) {
            self.emit('receivedFile', new window.Blob(self.receiveBuffer), self.metadata);
            self.receiveBuffer = []; // discard receivebuffer
        } else if (self.received > self.metadata.size) {
            // FIXME
            console.error('received more than expected, discarding...');
            self.receiveBuffer = []; // just discard...

        }
    };
};

module.exports = {};
module.exports.support = typeof window !== 'undefined' && window && window.File && window.FileReader && window.Blob;
module.exports.Sender = Sender;
module.exports.Receiver = Receiver;
