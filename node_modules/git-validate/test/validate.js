var Spawn = require('child_process').spawn;
var Path = require('path');
var Writable = require('stream').Writable;

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;

describe('validate', function () {

    it('runs', function (done) {

        var validate = Spawn(Path.resolve(__dirname, '..', 'bin', 'validate.sh'), [], { stdio: 'pipe' });

        validate.on('close', function (code) {

            expect(code).to.equal(0);
            done();
        });
    });
});
