"use strict";

var fs = require('fs');
var test = require('tape');
var SJJ = require('../index');
var tojson = require('../lib/tojson');

var jsonData = require('./data/json');
var sdpData = require('./data/sdp');

var noSourceSdpData = require('./data/no-source-sdp');
var noSourceJsonData = require('./data/no-source-json');

// Data that is typically unique or time dependent
var sid = '1382398245712';
var time = '1385147470924';

test('to json', function (t) {
    tojson._setIdCounter(0);
    var json = SJJ.toSessionJSON(sdpData, {
        creator: 'initiator',
        role: 'initiator',
        direction: 'outgoing'
    });

    t.deepEqual(json, jsonData);
    t.end();
});

test('to sdp', function (t) {
    var sdp = SJJ.toSessionSDP(jsonData, {
        role: 'initiator',
        direction: 'outgoing',
        sid: sid,
        time: time
    });

    t.deepEqual(sdp, sdpData);
    t.end();
});

test('no source to json', function (t) {
    tojson._setIdCounter(0);
    var json = SJJ.toSessionJSON(noSourceSdpData, {
        creator: 'initiator',
        role: 'initiator',
        direction: 'outgoing'
    });

    t.deepEqual(json, noSourceJsonData);
    t.end();
});

test('no source to sdp', function (t) {
    t.plan(2);
    var sdp = SJJ.toSessionSDP(noSourceJsonData, {
        role: 'initiator',
        direction: 'outgoing',
        sid: sid,
        time: time
    });

    t.ok(sdp.indexOf('msid-semantic') === -1);
    t.deepEqual(sdp, noSourceSdpData);
    t.end();
});

test('multiple pases', function (t) {
    t.plan(2);

    tojson._setIdCounter(0);
    var json1 = SJJ.toSessionJSON(sdpData, {
        creator: 'initiator',
        role: 'initiator',
        direction: 'outgoing'
    });
    var sdp1 = SJJ.toSessionSDP(json1, {
        role: 'initiator',
        direction: 'outgoing',
        sid: sid,
        time: time
    });

    tojson._setIdCounter(0);
    var json2 = SJJ.toSessionJSON(sdp1, {
        creator: 'initiator',
        role: 'initiator',
        direction: 'outgoing'
    });
    var sdp2 = SJJ.toSessionSDP(json2, {
        role: 'initiator',
        direction: 'outgoing',
        sid: sid,
        time: time
    });

    t.deepEqual(json2, jsonData);
    t.deepEqual(sdp2, sdpData);
    t.end();
});
