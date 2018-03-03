'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.containsValidAddressProofStatement = exports.containsValidProofStatement = exports.profileServices = undefined;

var _serviceUtils = require('./serviceUtils');

Object.defineProperty(exports, 'containsValidProofStatement', {
  enumerable: true,
  get: function get() {
    return _serviceUtils.containsValidProofStatement;
  }
});
Object.defineProperty(exports, 'containsValidAddressProofStatement', {
  enumerable: true,
  get: function get() {
    return _serviceUtils.containsValidAddressProofStatement;
  }
});

var _facebook = require('./facebook');

var _github = require('./github');

var _twitter = require('./twitter');

var _instagram = require('./instagram');

var _hackerNews = require('./hackerNews');

var _linkedIn = require('./linkedIn');

var profileServices = exports.profileServices = {
  facebook: _facebook.Facebook,
  github: _github.Github,
  twitter: _twitter.Twitter,
  instagram: _instagram.Instagram,
  hackerNews: _hackerNews.HackerNews,
  linkedIn: _linkedIn.LinkedIn
};