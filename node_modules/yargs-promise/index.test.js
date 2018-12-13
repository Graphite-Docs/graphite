const yargs = require('yargs');
const YargsPromise = require('./index');

describe('YargsPromise', () => {
  let parser;
  let customContextMethod;

  beforeEach(() => {
    customContextMethod = jest.fn();
    parser = new YargsPromise(yargs, {customContextMethod, foo: 'bar'});
  });

  afterEach(() => {
    yargs.reset();
  });

  it('resolves built in data from commands without handler like help', done => {
    parser.command('hello <name>', 'hello world parser').help();

    return parser
      .parse('hello --help')
      .then(({argv, data}) => {
        expect(argv['_']).toEqual(['hello']);
        expect(data).toContain('Show help');
        done();
      })
      .catch(err => {
        done.fail(err);
      });
  });

  it('can resolve returned promises from command handler argv.resolve', done => {
    parser.command(
      'hello <name>',
      'hello world parser',
      () => {},
      argv => {
        argv.resolve(
          new Promise((resolve, reject) => {
            resolve('response data');
          })
        );
      }
    );

    return parser
      .parse('hello world')
      .then(({argv, data}) => {
        expect(argv['_']).toEqual(['hello']);
        expect(data).toContain('response data');
        return done();
      })
      .catch(err => done.fail(err));
  });

  it('can reject returned promises from command handler argv.reject', done => {
    parser.command(
      'hello <name>',
      'hello world parser',
      () => {},
      argv => {
        argv.reject(
          new Promise((resolve, reject) => {
            resolve('response data');
          })
        );
      }
    );

    return parser
      .parse('hello world')
      .then(() => done.fail('Should not be reached'))
      .catch(data => {
        expect(data.argv['_']).toEqual(['hello']);
        expect(data.error).toEqual('response data');
        return done();
      });
  });

  it('resolves parsed argv from commands without handlers', done => {
    parser.command('hello <name>');

    return parser
      .parse('hello world')
      .then(({argv, data}) => {
        expect(argv['_']).toEqual(['hello']);
        expect(argv.name).toEqual('world');
        return done();
      })
      .catch(err => done.fail(err));
  });

  it('rejects errors from built in validation errors', done => {
    parser.command('hello <name>');

    return parser
      .parse('hello')
      .then(() => done.fail('Should not be reached'))
      .catch(({error, argv}) => {
        expect(argv['_']).toEqual(['hello']);
        expect(error.message).toEqual(
          'Not enough non-option arguments: got 0, need at least 1'
        );
        return done();
      })
      .catch(error => done.fail(error));
  });

  it('resolves custom data via context.reject in command handler', done => {
    parser.command(
      'hello <name>',
      'hello world command',
      () => {},
      argv => {
        return argv.resolve('custom handler', argv);
      }
    );

    return parser
      .parse('hello world')
      .then(({data, argv}) => {
        expect(data).toEqual('custom handler');
        expect(argv['_']).toEqual(['hello']);
        expect(argv.name).toEqual('world');
        return done();
      })
      .catch(error => done.fail(error));
  });

  it('rejects custom data via context.reject in command handler', done => {
    parser.command(
      'hello <name>',
      'hello world command',
      () => {},
      argv => {
        if (argv._[1]) {
          return argv.reject('Custom too many arguments');
        }
        return argv.resolve('hello', argv);
      }
    );

    return parser
      .parse('hello world 123')
      .then(() => done.fail('Should not be reached'))
      .catch(({error, argv}) => {
        expect(argv['_'][1]).toEqual(123);
        expect(error).toEqual('Custom too many arguments');
        return done();
      })
      .catch(err => done.fail(err));
  });

  it('supports merging custom context', done => {
    parser.command(
      'hello <name>',
      'hello world command',
      () => {},
      argv => {
        argv.customContextMethod('yargs!!!');
        return argv.resolve('custom handler', argv);
      }
    );

    return parser
      .parse('hello world')
      .then(({data, argv}) => {
        expect(data).toEqual('custom handler');
        expect(argv['_']).toEqual(['hello']);
        expect(argv.name).toEqual('world');
        // custom prop foo
        expect(argv.foo).toEqual('bar');
        // custom method
        expect(customContextMethod.mock.calls.length).toEqual(1);
        expect(customContextMethod.mock.calls[0]).toEqual(['yargs!!!']);
        return done();
      })
      .catch(error => done.fail(error));
  });
});
