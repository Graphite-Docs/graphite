'use strict';

/**
 * Imports
 */
const assert = require('assert');
const setHeader = require('../');

/**
 * Constants
 */
const NOOP = () => {}; // eslint-disable-line
const KEY = 'TestKey';
const VALUE = 'TestValue';

describe('setHeader(server, key, value)', () => {
  it('should export a function', () => {
    assert.strictEqual(typeof setHeader === 'function', true);
  });

  it('should throw an error if the Hapi server is invalid', () => {
    const values = [true, false, '', 'test', 123, new Date(), {}, [], null, undefined, /test/i];
    values.forEach((value) => {
      let error;
      try {
        setHeader({ ext: value }, KEY, VALUE);
      } catch (e) {
        error = e;
      }
      assert.strictEqual(error instanceof TypeError, true);
      assert.strictEqual(error.message, 'server.ext is not a function');
    });
    values.push(NOOP);
    values.forEach((value) => {
      let error;
      try {
        setHeader(value, KEY, VALUE);
      } catch (e) {
        error = e;
      }
      assert.strictEqual(error instanceof TypeError, true);
      assert.strictEqual(error.message, 'server.ext is not a function');
    });
  });

  it('should throw an error if the key is not a valid string', () => {
    [true, false, '', 123, new Date(), {}, [], null, undefined, /test/i, NOOP].forEach((value) => {
      let error;
      try {
        setHeader({ ext: NOOP }, value, VALUE);
      } catch (e) {
        error = e;
      }
      assert.strictEqual(error instanceof TypeError, true);
      assert.strictEqual(error.message, 'Invalid header key');
    });
  });

  it('should register an onPreResponse extension', () => {
    const server = {
      ext(type, method) {
        assert.strictEqual(type, 'onPreResponse');
        assert.strictEqual(typeof method === 'function', true);
      },
    };
    setHeader(server, KEY, VALUE);
  });

  it('should set the response header', (done) => {
    const request = {
      response: {
        header(key, value) {
          assert.strictEqual(key, KEY);
          assert.strictEqual(value, VALUE);
        },
      },
    };
    const reply = {
      continue: done,
    };
    const server = {
      ext(type, method) {
        method(request, reply);
      },
    };
    setHeader(server, KEY, VALUE);
  });


  it('should set the response header on a Boom response', (done) => {
    const request = {
      response: {
        isBoom: true,
        output: {
          headers: {},
        },
      },
    };
    const reply = {
      continue() {
        assert.strictEqual(request.response.output.headers[KEY], VALUE);
        done();
      },
    };
    const server = {
      ext(type, method) {
        method(request, reply);
      },
    };
    setHeader(server, KEY, VALUE);
  });
});
