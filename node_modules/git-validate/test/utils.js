var ChildProcess = require('child_process');
var Utils = require('../lib/utils');
var Fs = require('fs');
var Path = require('path');
var Mkdirp = require('mkdirp');
var Rimraf = require('rimraf');

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var afterEach = lab.afterEach;

var internals = {};
internals.fixturePath = Path.join(__dirname, 'fixtures');

internals.mkdir = function (path) {

    var args = [internals.fixturePath];
    for (var i = 0, l = arguments.length; i < l; ++i) {
        args.push(arguments[i]);
    }

    Mkdirp.sync(Path.join.apply(null, args));
};

internals.createFile = function (path) {

    var args = [internals.fixturePath];
    for (var i = 0, l = arguments.length; i < l; ++i) {
        args.push(arguments[i]);
    }

    Fs.writeFileSync(Path.join.apply(null, args), '{}', { encoding: 'utf8' });
};

internals.createFixture = function (done) {

    internals.mkdir('project1', 'not_a_project');
    internals.createFile('project1', 'package.json');
    internals.mkdir('project2', '.git', 'hooks');
    internals.createFile('project2', 'package.json');
    internals.mkdir('project3', 'actual_project');
    internals.createFile('project3', 'actual_project', 'package.json');
    internals.mkdir('project4', 'this', 'is', 'too', 'deep', 'to', 'find');
    internals.createFile('project4', 'this', 'is', 'too', 'deep', 'to', 'find', 'package.json');
    internals.mkdir('project5', '.git');
    internals.createFile('project5', 'package.json');
    internals.mkdir('project6', '.git');
    internals.createFile('project6', 'package.json');
    done();
};

internals.cleanupFixture = function (done) {

    Rimraf(internals.fixturePath, done);
};

describe('isDir()', function () {

    it('returns true for a directory', function (done) {

        expect(Utils.isDir(__dirname)).to.be.true();
        done();
    });

    it('returns false for a file', function (done) {

        expect(Utils.isDir(__filename)).to.be.false();
        done();
    });

    it('returns false when the path does not exist', function (done) {

        expect(Utils.isDir('nothere')).to.be.false();
        done();
    });
});

describe('copy()', function () {

    beforeEach(internals.createFixture);

    it('can copy an entire directory', function (done) {

        Utils.copy(internals.fixturePath, Path.join(__dirname, 'fixtures2'));
        expect(Utils.isDir(Path.join(__dirname, 'fixtures2'))).to.be.true();
        expect(Utils.isDir(Path.join(__dirname, 'fixtures2', 'project1'))).to.be.true();
        expect(Fs.existsSync(Path.join(__dirname, 'fixtures2', 'project1', 'package.json'))).to.be.true();
        expect(Utils.isDir(Path.join(__dirname, 'fixtures2', 'project1', 'not_a_project'))).to.be.true();
        expect(Utils.isDir(Path.join(__dirname, 'fixtures2', 'project2'))).to.be.true();
        expect(Utils.isDir(Path.join(__dirname, 'fixtures2', 'project3', 'actual_project'))).to.be.true();
        expect(Fs.existsSync(Path.join(__dirname, 'fixtures2', 'project3', 'actual_project', 'package.json'))).to.be.true();
        expect(Utils.isDir(Path.join(__dirname, 'fixtures2', 'project4', 'this', 'is', 'too', 'deep', 'to', 'find'))).to.be.true();
        expect(Fs.existsSync(Path.join(__dirname, 'fixtures2', 'project4', 'this', 'is', 'too', 'deep', 'to', 'find', 'package.json'))).to.be.true();
        done();
    });

    it('throws when trying to overwrite a file by default', function (done) {

        Utils.copy(Path.join(internals.fixturePath, 'project1', 'package.json'), Path.join(__dirname, 'fixtures2', 'project1', 'package.json'));
        var err = Utils.copy(Path.join(internals.fixturePath, 'project1', 'package.json'), Path.join(__dirname, 'fixtures2', 'project1', 'package.json'));
        expect(err).to.not.be.undefined();
        expect(err.message).to.contain('already exists');
        done();
    });

    it('allows overwriting a file when setting overwrite to true', function (done) {

        Utils.copy(Path.join(internals.fixturePath, 'project1', 'package.json'), Path.join(__dirname, 'fixtures2', 'project1', 'package.json'));
        var err = Utils.copy(Path.join(internals.fixturePath, 'project1', 'package.json'), Path.join(__dirname, 'fixtures2', 'project1', 'package.json'), { overwrite: true });
        expect(err).to.be.undefined();
        done();
    });

    it('can copy a file without specifying a target', function (done) {

        Utils.copy(Path.join(internals.fixturePath, 'project1', 'package.json'));
        var err = Utils.copy(Path.join(internals.fixturePath, 'project1', 'package.json'), { overwrite: true });
        expect(err).to.be.undefined();
        done();
    });

    it('throws when trying to write outside of the project root', function (done) {

        expect(function () {

            Utils.copy(Path.join(internals.fixturePath, 'project1', 'package.json'), Path.join(__dirname, '..', '..'));
        }).to.throw(Error, /within project root/);
        done();
    });

    it('throws when trying to copy a directory over a file', function (done) {

        Utils.copy(Path.join(internals.fixturePath, 'project1', 'package.json'), Path.join(__dirname, 'fixtures2', 'project1', 'package.json'));
        expect(function () {

            Utils.copy(Path.join(internals.fixturePath, 'project1'), Path.join(__dirname, 'fixtures2', 'project1', 'package.json'));
        }).to.throw();
        done();
    });

    afterEach(function (done) {

        internals.cleanupFixture(function () {

            Rimraf(Path.join(__dirname, 'fixtures2'), done);
        });
    });
});

describe('findGitRoot()', function () {

    it('can find a git root', function (done) {

        var root = Path.resolve(__dirname, '..');
        expect(Utils.findGitRoot()).to.equal(root);
        done();
    });

    it('logs an error and exits cleanly when no git root is found', function (done) {

        ChildProcess.exec('node -e \'var path = require("path"); var utils = require("./lib/utils"); utils.findGitRoot(path.resolve(__dirname, "..", ".."));\'', function (err, stdout, stderr) {

            expect(err).to.not.exist();
            expect(stderr).to.equal('WARNING: Unable to find a .git directory for this project, installation aborted.\n');
            done();
        });
    });
});

describe('findProjectRoot()', function () {

    before(internals.createFixture);

    it('can find a project root', function (done) {

        var root = Path.resolve(__dirname, '..');
        expect(Utils.findProjectRoot()).to.equal(root);
        done();
    });

    it('can find a project root from a child directory', function (done) {

        var root = Path.join(internals.fixturePath, 'project1', 'not_a_project');
        expect(Utils.findProjectRoot(root)).to.equal(Path.join(internals.fixturePath, 'project1'));
        done();
    });

    it('can return an error when no project is found', function (done) {

        ChildProcess.exec('node -e \'var path = require("path"); var utils = require("./lib/utils"); utils.findProjectRoot(path.resolve(__dirname, "..", ".."));\'', function (err, stdout, stderr) {

            expect(err).to.not.exist();
            expect(stderr).to.equal('WARNING: Unable to find a package.json for this project, installation aborted.\n');
            done();
        });
    });

    after(internals.cleanupFixture);
});

describe('findProjects()', function () {

    before(internals.createFixture);

    it('can find projects', function (done) {

        var projects = Utils.findProjects();
        expect(projects).to.be.an.array();
        expect(projects).to.have.length(6);
        expect(projects).to.contain(Path.dirname(__dirname));
        expect(projects).to.contain(Path.join(internals.fixturePath, 'project1'));
        expect(projects).to.contain(Path.join(internals.fixturePath, 'project2'));
        expect(projects).to.contain(Path.join(internals.fixturePath, 'project3', 'actual_project'));
        expect(projects).to.contain(Path.join(internals.fixturePath, 'project6'));
        done();
    });

    after(internals.cleanupFixture);
});

describe('installHooks()', function () {

    beforeEach(internals.createFixture);

    it('can install a hook', function (done) {

        Utils.installHooks('pre-commit', Path.join(internals.fixturePath, 'project2'));
        expect(Fs.existsSync(Path.join(internals.fixturePath, 'project2', '.git', 'hooks', 'pre-commit'))).to.be.true();
        done();
    });

    it('can install a hook to a .git directory without hooks subdir', function (done) {

        Utils.installHooks('pre-commit', Path.join(internals.fixturePath, 'project5'));
        expect(Fs.existsSync(Path.join(internals.fixturePath, 'project5', '.git', 'hooks', 'pre-commit'))).to.be.true();
        done();
    });

    it('can install multiple hooks at once', function (done) {

        Utils.installHooks(['pre-commit', 'pre-push'], Path.join(internals.fixturePath, 'project2'));
        expect(Fs.existsSync(Path.join(internals.fixturePath, 'project2', '.git', 'hooks', 'pre-commit'))).to.be.true();
        expect(Fs.existsSync(Path.join(internals.fixturePath, 'project2', '.git', 'hooks', 'pre-push'))).to.be.true();
        done();
    });

    it('backs up an existing hook when installing', function (done) {

        Utils.installHooks('pre-commit', Path.join(internals.fixturePath, 'project2'));
        expect(Fs.existsSync(Path.join(internals.fixturePath, 'project2', '.git', 'hooks', 'pre-commit'))).to.be.true();
        Utils.installHooks('pre-commit', Path.join(internals.fixturePath, 'project2'));
        expect(Fs.existsSync(Path.join(internals.fixturePath, 'project2', '.git', 'hooks', 'pre-commit'))).to.be.true();
        expect(Fs.existsSync(Path.join(internals.fixturePath, 'project2', '.git', 'hooks', 'pre-commit.backup'))).to.be.true();
        done();
    });

    afterEach(internals.cleanupFixture);
});

describe('configureHook()', function () {

    beforeEach(internals.createFixture);

    it('can install a hook with defaults as a string', function (done) {

        Utils.installHooks('pre-commit', Path.join(internals.fixturePath, 'project2'));
        Utils.configureHook('pre-commit', 'test', false, Path.join(internals.fixturePath, 'project2'));
        expect(Fs.existsSync(Path.join(internals.fixturePath, 'project2', '.git', 'hooks', 'pre-commit'))).to.be.true();
        var fixturePackage = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project2', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackage['pre-commit']).to.deep.equal(['test']);
        done();
    });

    it('can install a hook with defaults as an array', function (done) {

        Utils.installHooks('pre-commit', Path.join(internals.fixturePath, 'project2'));
        Utils.configureHook('pre-commit', ['lint', 'test'], false, Path.join(internals.fixturePath, 'project2'));
        expect(Fs.existsSync(Path.join(internals.fixturePath, 'project2', '.git', 'hooks', 'pre-commit'))).to.be.true();
        var fixturePackage = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project2', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackage['pre-commit']).to.deep.equal(['lint', 'test']);
        done();
    });

    it('won\'t overwrite existing hook settings', function (done) {

        Utils.installHooks('pre-commit', Path.join(internals.fixturePath, 'project2'));
        Utils.configureHook('pre-commit', 'test', false, Path.join(internals.fixturePath, 'project2'));
        expect(Fs.existsSync(Path.join(internals.fixturePath, 'project2', '.git', 'hooks', 'pre-commit'))).to.be.true();
        var fixturePackageOne = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project2', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackageOne['pre-commit']).to.deep.equal(['test']);
        Utils.configureHook('pre-commit', ['lint', 'test'], false, Path.join(internals.fixturePath, 'project2'));
        var fixturePackageTwo = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project2', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackageTwo['pre-commit']).to.deep.equal(['test']);
        done();
    });

    it('will overwrite existing hook settings if we say so', function (done) {

        Utils.installHooks('pre-commit', Path.join(internals.fixturePath, 'project6'));
        Utils.configureHook('pre-commit', 'test', true, Path.join(internals.fixturePath, 'project6'));
        expect(Fs.existsSync(Path.join(internals.fixturePath, 'project6', '.git', 'hooks', 'pre-commit'))).to.be.true();
        var fixturePackageOne = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project6', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackageOne['pre-commit']).to.deep.equal(['test']);
        Utils.configureHook('pre-commit', ['lint', 'bla'], true, Path.join(internals.fixturePath, 'project6'));
        var fixturePackageTwo = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project6', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackageTwo['pre-commit']).to.deep.equal(['lint', 'bla']);
        done();
    });

    afterEach(internals.cleanupFixture);
});

describe('installScript()', function () {

    beforeEach(internals.createFixture);

    it('can install a script', function (done) {

        Utils.installScript('test', 'lab -a code -L', Path.join(internals.fixturePath, 'project2'));
        var fixturePackage = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project2', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackage).to.deep.equal({ scripts: { test: 'lab -a code -L' } });
        done();
    });

    it('can install a script to an existing scripts object', function (done) {

        var packagePath = Path.join(internals.fixturePath, 'project2', 'package.json');
        Fs.writeFileSync(packagePath, '{"scripts":{}}', { encoding: 'utf8' });
        Utils.installScript('test', 'lab -a code -L', Path.join(internals.fixturePath, 'project2'));
        var fixturePackage = JSON.parse(Fs.readFileSync(packagePath, { encoding: 'utf8' }));
        expect(fixturePackage).to.deep.equal({ scripts: { test: 'lab -a code -L' } });
        done();
    });

    it('does not overwrite an existing script', function (done) {

        Utils.installScript('test', 'lab -a code -L', Path.join(internals.fixturePath, 'project2'));
        var fixturePackageOne = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project2', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackageOne).to.deep.equal({ scripts: { test: 'lab -a code -L' } });
        Utils.installScript('test', 'mocha', Path.join(internals.fixturePath, 'project2'));
        var fixturePackage = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project2', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackage).to.deep.equal({ scripts: { test: 'lab -a code -L' } });
        done();
    });

    it('overwrite an existing script when option is specified', function (done) {

        Utils.installScript('test', 'lab -a code -L', {}, Path.join(internals.fixturePath, 'project2'));
        var fixturePackageOne = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project2', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackageOne).to.deep.equal({ scripts: { test: 'lab -a code -L' } });

        Utils.installScript('test', 'mocha', {}, Path.join(internals.fixturePath, 'project2'));
        var fixturePackageTwo = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project2', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackageTwo).to.deep.equal({ scripts: { test: 'lab -a code -L' } });

        Utils.installScript('test', 'mocha', { overwrite: true }, Path.join(internals.fixturePath, 'project2'));
        var fixturePackage = JSON.parse(Fs.readFileSync(Path.join(internals.fixturePath, 'project2', 'package.json'), { encoding: 'utf8' }));
        expect(fixturePackage).to.deep.equal({ scripts: { test: 'mocha' } });

        done();
    });

    afterEach(internals.cleanupFixture);
});
