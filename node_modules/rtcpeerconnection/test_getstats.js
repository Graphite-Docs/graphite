/* testing basic session establishment */
var test = require('tape');
var PeerConnection = require('../rtcpeerconnection');

test('basic connection establishment', function (t) {
    var pc1, pc2;
    pc1 = new PeerConnection();
    pc2 = new PeerConnection();

    pc1.on('ice', function (candidate) {
        pc2.processIce(candidate);
    });
    pc2.on('ice', function (candidate) {
        pc1.processIce(candidate);
    });

    pc1.on('iceConnectionStateChange', function () {
        //console.log('pc1 iceConnectionStateChange', pc1.iceConnectionState);
        if (pc1.iceConnectionState == 'connected') {
            t.pass('P2P connection established');
            window.setTimeout(function () {
                pc1.getStats(function (err, res) {
                    t.pass('got stats');
                    console.log('gotStats', err, res);
                    window.thestats = res;
                    //t.end();
                });
            }, 1000);
        }
        // FIXME: also look for https://code.google.com/p/webrtc/issues/detail?id=1414
    });
    pc2.on('iceConnectionStateChange', function () {
        //console.log('pc2 iceConnectionStateChange', pc2.iceConnectionState);
    });

    pc1.offer(function (err, offer) {
        if (err) {
            t.fail('failed to create offer');
            return;
        }
        t.pass('created offer');
        pc2.handleOffer(offer, function (err) {
            if (err) {
                // handle error
                t.fail('error handling offer');
                return;
            }
            t.pass('handled offer');

            pc2.answer(function (err, answer) {
                if (err) {
                    t.fail('error handling answer');
                    return;
                }
                t.pass('created answer');
                pc1.handleAnswer(answer, function (err) {
                    if (err) {
                        t.fail('failed to handle answer');
                        return;
                    }
                    t.pass('handled answer');
                });
            });
        });
    });
});
