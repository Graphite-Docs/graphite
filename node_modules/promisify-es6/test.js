// Require the dependencies
var assert = require("assert");
var promisify = require(".");

// Start the tests
describe('Test without arguments', function() {
    var asyncMethod = function(callback) {
        callback(null, "Hello world!");
    };

    var fn = promisify(asyncMethod);

    it("should assert the string to match the original (callback version)", function(done) {
        fn(function(err, str) {
            assert.equal(null, err);
            assert.equal("Hello world!", str);
            done();
        });
    });

    it("should assert the string to match the original (promise version)", function(done) {
        fn()
        .then(function(str) {
            assert.equal("Hello world!", str);
        })
        .catch(function(err) {
            assert.equal(null, str);
        })
        .then(done);
    });
});

describe('Sum two arguments, using the err and value args', function() {
    var asyncMethod = function(num1, num2, callback) {
        callback(num1, num2);
    };

    var fn = promisify(asyncMethod);

    it("should assert the num to be equally to 15", function(done) {
        fn(3, 12, function(err, value) {
            assert.equal(15, err + value);
            done();
        });
    });

    it("should assert the promise to the exact numbers", function(done) {
        fn(3, 12)
        .then(function(value) {
            assert.equal(12, value);
        })
        .catch(function(err) {
            assert.equal(3, err);
        })
        .then(done);
    });
});

describe('Promisify a native Node module', function() {
    var fs = promisify(require("fs"));
    var crypto = require("crypto");

    it("should assert the hashed content of the given string", function() {
        return fs.readFile("./LICENSE")
        .then(function(content) {
            var hash = crypto
            .createHash("sha1")
            .update(content)
            .digest("hex");

            assert.equal("4fe3cbcca15cfa585857288d29d42c0973fc850a", hash);
        });
    });
});

describe('callback handling', function() {
    it('should throw error if using a callback', function(done) {
        var failMe = promisify(function(msg, cb) {
            throw new Error(msg);
        });

        try {
            failMe('fail', function () {});
        } catch (err) {
            assert.equal(err.message, 'fail')
            done();
        }
    });
});
