var crypto = require('crypto');
var hashes = require('../');
var test = require('tape');


function testHash(t, ianaName, cryptoName) {
    var avail = hashes.getHashes();
    if (avail.indexOf(ianaName) >= 0) {
        t.equal(crypto.createHash(cryptoName).update('test').digest('hex'),
                hashes.createHash(ianaName).update('test').digest('hex'));
    } else {
        t.skip('The ' + ianaName + ' algorithm is not supported in this environment');
    }
    t.end();
}

function testHMAC(t, ianaName, cryptoName) {
    var avail = hashes.getHashes();
    if (avail.indexOf(ianaName) >= 0) {
        t.equal(crypto.createHmac(cryptoName, 'key').update('test').digest('hex'),
                hashes.createHmac(ianaName, 'key').update('test').digest('hex'));
    } else {
        t.skip('The ' + ianaName + ' algorithm is not supported in this environment');
    }
    t.end();
}


test('Hash MD5', function (t) {
    testHash(t, 'md5', 'md5');
});

test('Hash SHA-1', function (t) {
    testHash(t, 'sha-1', 'sha1');
});

test('Hash SHA-224', function (t) {
    testHash(t, 'sha-224', 'sha224');
});

test('Hash SHA-256', function (t) {
    testHash(t, 'sha-256', 'sha256');
});

test('Hash SHA-384', function (t) {
    testHash(t, 'sha-384', 'sha384');
});

test('Hash SHA-512', function (t) {
    testHash(t, 'sha-512', 'sha512');
});

test('HMAC MD5', function (t) {
    testHMAC(t, 'md5', 'md5');
});

test('HMAC SHA-1', function (t) {
    testHMAC(t, 'sha-1', 'sha1');
});

test('HMAC SHA-224', function (t) {
    testHMAC(t, 'sha-224', 'sha224');
});

test('HMAC SHA-256', function (t) {
    testHMAC(t, 'sha-256', 'sha256');
});

test('HMAC SHA-384', function (t) {
    testHMAC(t, 'sha-384', 'sha384');
});

test('HMAC SHA-512', function (t) {
    testHMAC(t, 'sha-512', 'sha512');
});
