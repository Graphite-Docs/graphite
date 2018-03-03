'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveZoneFileToPerson = resolveZoneFileToPerson;

var _zoneFile = require('zone-file');

var _person = require('./person');

var _profileZoneFiles = require('../profileZoneFiles');

var _profileTokens = require('../profileTokens');

function resolveZoneFileToPerson(zoneFile, publicKeyOrAddress, callback) {
  var zoneFileJson = null;
  try {
    zoneFileJson = (0, _zoneFile.parseZoneFile)(zoneFile);
    if (!zoneFileJson.hasOwnProperty('$origin')) {
      zoneFileJson = null;
      throw new Error('zone file is missing an origin');
    }
  } catch (e) {
    console.error(e);
  }

  var tokenFileUrl = null;
  if (zoneFileJson && Object.keys(zoneFileJson).length > 0) {
    tokenFileUrl = (0, _profileZoneFiles.getTokenFileUrl)(zoneFileJson);
  } else {
    var profile = null;
    try {
      profile = JSON.parse(zoneFile);
      var person = _person.Person.fromLegacyFormat(profile);
      profile = person.profile();
    } catch (error) {
      console.warn(error);
    }
    callback(profile);
    return;
  }

  if (tokenFileUrl) {
    fetch(tokenFileUrl).then(function (response) {
      return response.text();
    }).then(function (responseText) {
      return JSON.parse(responseText);
    }).then(function (responseJson) {
      var tokenRecords = responseJson;
      var token = tokenRecords[0].token;
      var profile = (0, _profileTokens.extractProfile)(token, publicKeyOrAddress);

      callback(profile);
      return;
    }).catch(function (error) {
      console.warn(error);
    });
  } else {
    console.warn('Token file url not found');
    callback({});
    return;
  }
}