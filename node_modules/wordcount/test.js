require('mocha');
var assert = require('assert');
var wordcount = require('./');

describe('count words', function () {
  it('should count the words in a string.', function () {
    assert.strictEqual(wordcount('Count the words in string.'), 5);
    assert.strictEqual(wordcount('Count the words in string, again.'), 6);
  });

  it('should count the words in a cyrillic string.', function () {
    assert.strictEqual(wordcount('Тест стринг кирилица.'), 3)
  });

  it('should count the words in mixed latin and cyrillic string', function () {
    assert.strictEqual(wordcount('Тест mixed стринг кирилица and latin string.'), 7)
  });

  it('should count the words in mixed chinese (traditional) and latin string', function () {
    assert.strictEqual(wordcount('We are 我們是 朋友 from Bulgaria'), 6);
  });

  it('should count the words in korean-latin-cyrillic string', function () {
    assert.strictEqual(wordcount('I am from България, and speak 한국어 언어'), 8);
  });
});
