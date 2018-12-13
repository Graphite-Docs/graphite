import "core-js"; // polyfill
import expect from 'expect';
import Joi from '../'; // joi-browser

describe('Joi', () => {

  describe('basic schema', () => {
    let schema;

    beforeEach(() => {
      schema = Joi.object().keys({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
        access_token: [Joi.string(), Joi.number()],
        birthyear: Joi.number().integer().min(1900).max(2013),
        email: Joi.string().email()
      }).with('username', 'birthyear').without('password', 'access_token');
    });

    it('should validate a valid object', (done) => {

      const obj = {
        username: 'abc',
        email: 'test@iana.org',
        birthyear: 1994
      };

      schema.validate(obj, (err, value) => {

        expect(err).toNotExist();
        expect(value.username).toBe('abc');
        expect(value.email).toBe('test@iana.org');
        expect(value.birthyear).toBe(1994);
        done();
      });
    });

    it('should error with missing username', () => {

      const obj = {
        // missing username
        email: 'test@iana.org',
        birthyear: 1994
      };

      schema.validate(obj, (err, value) => {

        expect(value.email).toBe('test@iana.org');
        expect(value.birthyear).toBe(1994);
        // check that error message
        expect(err.toString()).toMatch('username');
      });
    });

    it('should error with invalid email', () => {

      const obj = {
        username: 'abc',
        // invalid email
        email: 'foobar.com',
        birthyear: 1994
      };

      schema.validate(obj, (err, value) => {

        expect(value.username).toBe('abc');
        expect(value.birthyear).toBe(1994);
        // check that error message
        expect(err.toString()).toMatch('ValidationError: child "email" fails because ["email" must be a valid email]');
      });
    });

    it('should error with invalid year', () => {

      const obj = {
        username: 'abc',
        email: 'test@iana.org',
        // invalid year
        birthyear: 2021
      };

      schema.validate(obj, (err, value) => {

        expect(value.username).toBe('abc');
        expect(value.email).toBe('test@iana.org');
        // check that error message
        expect(err.toString()).toMatch('ValidationError: child "birthyear" fails because ["birthyear" must be less than or equal to 2013]');
      });
    });

  });

});
