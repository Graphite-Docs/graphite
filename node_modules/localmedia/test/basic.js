var test = require('tape');
var LocalMedia = require('../index');

/* tests are BROKEN in Firefox
 * since the tests rely on .onended
 * which is not called by Firefox
 * (and neither is .onended on any track called)
 */


test('test localStream and ended event', function (t) {
    var media = new LocalMedia();
    media.on('localStream', function (stream) {
        t.pass('got local stream', stream);
    });
    media.on('localStreamStopped', function(stream) {
        t.pass('local stream stopped', stream);
        t.end();
    });
    media.startLocalMedia(null, function (err, stream) {
        if (err) {
            t.fail('startLocalMedia failed', err);
            return;
        }
        stream.stop();
    });
});

// check constraints are working as intended
test('test audioonly stream', function (t) {
    var media = new LocalMedia();
    media.on('localStream', function (stream) {
        t.pass('got local stream');
        if (stream.getAudioTracks().length > 0) {
            t.pass('got audio track');
        } else {
            t.fail('got no audio track');
        }
        if (stream.getVideoTracks().length === 0) {
            t.pass('got no video track');
        } else {
            t.fail('got video track');
        }
    });
    media.on('localStreamStopped', function(stream) {
        t.pass('local stream stopped', stream);
        t.end();
    });
    media.startLocalMedia({audio: true, video: false}, function (err, stream) {
        if (err) {
            t.fail('startLocalMedia failed', err);
            return;
        }
        stream.stop();
    });
});
test('test videoonly stream', function (t) {
    var media = new LocalMedia();
    media.on('localStream', function (stream) {
        t.pass('got local stream');
        if (stream.getAudioTracks().length === 0) {
            t.pass('got no audio track');
        } else {
            t.fail('got audio track');
        }
        if (stream.getVideoTracks().length > 0) {
            t.pass('got no video track');
        } else {
            t.fail('got no video track');
        }
    });
    media.on('localStreamStopped', function(stream) {
        t.pass('local stream stopped', stream);
        t.end();
    });
    media.startLocalMedia({audio: false, video: true}, function (err, stream) {
        if (err) {
            t.fail('startLocalMedia failed', err);
            return;
        }
        stream.stop();
    });
});
