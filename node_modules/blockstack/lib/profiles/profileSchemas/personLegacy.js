'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPersonFromLegacyFormat = getPersonFromLegacyFormat;

var _hasprop = require('hasprop');

var _hasprop2 = _interopRequireDefault(_hasprop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function formatAccount(serviceName, data) {
  var proofUrl = void 0;
  if ((0, _hasprop2.default)(data, 'proof.url')) {
    proofUrl = data.proof.url;
  }
  return {
    '@type': 'Account',
    service: serviceName,
    identifier: data.username,
    proofType: 'http',
    proofUrl: proofUrl
  };
}

function getPersonFromLegacyFormat(profile) {
  var profileData = {
    '@type': 'Person'
  };

  if ((0, _hasprop2.default)(profile, 'name.formatted')) {
    profileData.name = profile.name.formatted;
  }

  if ((0, _hasprop2.default)(profile, 'bio')) {
    profileData.description = profile.bio;
  }

  if ((0, _hasprop2.default)(profile, 'location.formatted')) {
    profileData.address = {
      '@type': 'PostalAddress',
      addressLocality: profile.location.formatted
    };
  }

  var images = [];
  if ((0, _hasprop2.default)(profile, 'avatar.url')) {
    images.push({
      '@type': 'ImageObject',
      name: 'avatar',
      contentUrl: profile.avatar.url
    });
  }
  if ((0, _hasprop2.default)(profile, 'cover.url')) {
    images.push({
      '@type': 'ImageObject',
      name: 'cover',
      contentUrl: profile.cover.url
    });
  }
  if (images.length) {
    profileData.image = images;
  }

  if ((0, _hasprop2.default)(profile, 'website')) {
    profileData.website = [{
      '@type': 'WebSite',
      url: profile.website
    }];
  }

  var accounts = [];
  if ((0, _hasprop2.default)(profile, 'bitcoin.address')) {
    accounts.push({
      '@type': 'Account',
      role: 'payment',
      service: 'bitcoin',
      identifier: profile.bitcoin.address
    });
  }
  if ((0, _hasprop2.default)(profile, 'twitter.username')) {
    accounts.push(formatAccount('twitter', profile.twitter));
  }
  if ((0, _hasprop2.default)(profile, 'facebook.username')) {
    accounts.push(formatAccount('facebook', profile.facebook));
  }
  if ((0, _hasprop2.default)(profile, 'github.username')) {
    accounts.push(formatAccount('github', profile.github));
  }

  if ((0, _hasprop2.default)(profile, 'auth')) {
    if (profile.auth.length > 0) {
      if ((0, _hasprop2.default)(profile.auth[0], 'publicKeychain')) {
        accounts.push({
          '@type': 'Account',
          role: 'key',
          service: 'bip32',
          identifier: profile.auth[0].publicKeychain
        });
      }
    }
  }
  if ((0, _hasprop2.default)(profile, 'pgp.url')) {
    accounts.push({
      '@type': 'Account',
      role: 'key',
      service: 'pgp',
      identifier: profile.pgp.fingerprint,
      contentUrl: profile.pgp.url
    });
  }

  profileData.account = accounts;

  return profileData;
}