var util = require('util');
var hark = require('hark');
var webrtcSupport = require('webrtcsupport');
var getUserMedia = require('getusermedia');
var getScreenMedia = require('getscreenmedia');
var WildEmitter = require('wildemitter');
var GainController = require('mediastream-gain');
var mockconsole = require('mockconsole');


function LocalMedia(opts) {
    WildEmitter.call(this);

    var config = this.config = {
        autoAdjustMic: false,
        detectSpeakingEvents: false,
        audioFallback: false,
        media: {
            audio: true,
            video: true
        },
        logger: mockconsole
    };

    var item;
    for (item in opts) {
        this.config[item] = opts[item];
    }

    this.logger = config.logger;
    this._log = this.logger.log.bind(this.logger, 'LocalMedia:');
    this._logerror = this.logger.error.bind(this.logger, 'LocalMedia:');

    this.screenSharingSupport = webrtcSupport.screenSharing;

    this.localStreams = [];
    this.localScreens = [];

    if (!webrtcSupport.supportGetUserMedia) {
        this._logerror('Your browser does not support local media capture.');
    }
}

util.inherits(LocalMedia, WildEmitter);


LocalMedia.prototype.start = function (mediaConstraints, cb) {
    var self = this;
    var constraints = mediaConstraints || this.config.media;

    getUserMedia(constraints, function (err, stream) {

        if (!err) {
            if (constraints.audio && self.config.detectSpeakingEvents) {
                self.setupAudioMonitor(stream, self.config.harkOptions);
            }
            self.localStreams.push(stream);

            if (self.config.autoAdjustMic) {
                self.gainController = new GainController(stream);
                // start out somewhat muted if we can track audio
                self.setMicIfEnabled(0.5);
            }

            // TODO: might need to migrate to the video tracks onended
            // FIXME: firefox does not seem to trigger this...
            stream.onended = function () {
                /*
                var idx = self.localStreams.indexOf(stream);
                if (idx > -1) {
                    self.localScreens.splice(idx, 1);
                }
                self.emit('localStreamStopped', stream);
                */
            };

            self.emit('localStream', stream);
        } else {
            // Fallback for users without a camera
            if (self.config.audioFallback && err.name === 'DevicesNotFoundError' && constraints.video !== false) {
                constraints.video = false;
                self.start(constraints, cb);
                return;
            }
        }
        if (cb) {
            return cb(err, stream);
        }
    });
};

LocalMedia.prototype.stop = function (stream) {
    var self = this;
    // FIXME: duplicates cleanup code until fixed in FF
    if (stream) {
        stream.getTracks().forEach(function (track) { track.stop(); });
        var idx = self.localStreams.indexOf(stream);
        if (idx > -1) {
            self.emit('localStreamStopped', stream);
            self.localStreams = self.localStreams.splice(idx, 1);
        } else {
            idx = self.localScreens.indexOf(stream);
            if (idx > -1) {
                self.emit('localScreenStopped', stream);
                self.localScreens = self.localScreens.splice(idx, 1);
            }
        }
    } else {
        this.stopStreams();
        this.stopScreenShare();
    }
};

LocalMedia.prototype.stopStreams = function () {
    var self = this;
    if (this.audioMonitor) {
        this.audioMonitor.stop();
        delete this.audioMonitor;
    }
    this.localStreams.forEach(function (stream) {
        stream.getTracks().forEach(function (track) { track.stop(); });
        self.emit('localStreamStopped', stream);
    });
    this.localStreams = [];
};

LocalMedia.prototype.startScreenShare = function (cb) {
    var self = this;
    getScreenMedia(function (err, stream) {
        if (!err) {
            self.localScreens.push(stream);

            // TODO: might need to migrate to the video tracks onended
            // Firefox does not support .onended but it does not support
            // screensharing either
            stream.onended = function () {
                var idx = self.localScreens.indexOf(stream);
                if (idx > -1) {
                    self.localScreens.splice(idx, 1);
                }
                self.emit('localScreenStopped', stream);
            };
            self.emit('localScreen', stream);
        }

        // enable the callback
        if (cb) {
            return cb(err, stream);
        }
    });
};

LocalMedia.prototype.stopScreenShare = function (stream) {
    var self = this;
    if (stream) {
        stream.getTracks().forEach(function (track) { track.stop(); });
        this.emit('localScreenStopped', stream);
    } else {
        this.localScreens.forEach(function (stream) {
            stream.getTracks().forEach(function (track) { track.stop(); });
            self.emit('localScreenStopped', stream);
        });
        this.localScreens = [];
    }
};

// Audio controls
LocalMedia.prototype.mute = function () {
    this._audioEnabled(false);
    this.hardMuted = true;
    this.emit('audioOff');
};

LocalMedia.prototype.unmute = function () {
    this._audioEnabled(true);
    this.hardMuted = false;
    this.emit('audioOn');
};

LocalMedia.prototype.setupAudioMonitor = function (stream, harkOptions) {
    this._log('Setup audio');
    var audio = this.audioMonitor = hark(stream, harkOptions);
    var self = this;
    var timeout;

    audio.on('speaking', function () {
        self.emit('speaking');
        if (self.hardMuted) {
            return;
        }
        self.setMicIfEnabled(1);
    });

    audio.on('stopped_speaking', function () {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(function () {
            self.emit('stoppedSpeaking');
            if (self.hardMuted) {
                return;
            }
            self.setMicIfEnabled(0.5);
        }, 1000);
    });
    audio.on('volume_change', function (volume, treshold) {
        self.emit('volumeChange', volume, treshold);
    });
};

// We do this as a seperate method in order to
// still leave the "setMicVolume" as a working
// method.
LocalMedia.prototype.setMicIfEnabled = function (volume) {
    if (!this.config.autoAdjustMic) {
        return;
    }
    this.gainController.setGain(volume);
};

// Video controls
LocalMedia.prototype.pauseVideo = function () {
    this._videoEnabled(false);
    this.emit('videoOff');
};
LocalMedia.prototype.resumeVideo = function () {
    this._videoEnabled(true);
    this.emit('videoOn');
};

// Combined controls
LocalMedia.prototype.pause = function () {
    this.mute();
    this.pauseVideo();
};
LocalMedia.prototype.resume = function () {
    this.unmute();
    this.resumeVideo();
};

// Internal methods for enabling/disabling audio/video
LocalMedia.prototype._audioEnabled = function (bool) {
    // work around for chrome 27 bug where disabling tracks
    // doesn't seem to work (works in canary, remove when working)
    this.setMicIfEnabled(bool ? 1 : 0);
    this.localStreams.forEach(function (stream) {
        stream.getAudioTracks().forEach(function (track) {
            track.enabled = !!bool;
        });
    });
};
LocalMedia.prototype._videoEnabled = function (bool) {
    this.localStreams.forEach(function (stream) {
        stream.getVideoTracks().forEach(function (track) {
            track.enabled = !!bool;
        });
    });
};

// check if all audio streams are enabled
LocalMedia.prototype.isAudioEnabled = function () {
    var enabled = true;
    this.localStreams.forEach(function (stream) {
        stream.getAudioTracks().forEach(function (track) {
            enabled = enabled && track.enabled;
        });
    });
    return enabled;
};

// check if all video streams are enabled
LocalMedia.prototype.isVideoEnabled = function () {
    var enabled = true;
    this.localStreams.forEach(function (stream) {
        stream.getVideoTracks().forEach(function (track) {
            enabled = enabled && track.enabled;
        });
    });
    return enabled;
};

// Backwards Compat
LocalMedia.prototype.startLocalMedia = LocalMedia.prototype.start;
LocalMedia.prototype.stopLocalMedia = LocalMedia.prototype.stop;

// fallback for old .localStream behaviour
Object.defineProperty(LocalMedia.prototype, 'localStream', {
    get: function () {
        return this.localStreams.length > 0 ? this.localStreams[0] : null;
    }
});
// fallback for old .localScreen behaviour
Object.defineProperty(LocalMedia.prototype, 'localScreen', {
    get: function () {
        return this.localScreens.length > 0 ? this.localScreens[0] : null;
    }
});

module.exports = LocalMedia;
