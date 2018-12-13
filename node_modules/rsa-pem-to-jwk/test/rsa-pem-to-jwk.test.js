/*
 * Copyright 2014 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global describe, it */
/*jshint expr:true */
'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var objectAssign = require('object-assign');

var rsaPemToJwk = require('../rsa-pem-to-jwk');

describe('rsa-pem-to-jwk', function() {
  var privatePem = fs.readFileSync(path.join(__dirname, 'data', 'private.pem'));
  var publicPem = fs.readFileSync(path.join(__dirname, 'data', 'public.pem'));
  var expectedPublic = require('./data/expectedPublic.json');
  var expectedPrivate = require('./data/expectedPrivate.json');

  it('should fail for an invalid PEM', function() {
    var jwk = rsaPemToJwk('INVALID');

    expect(jwk).to.be.undefined;
  });

  it('should return a public JWK by default', function() {
    var jwk = rsaPemToJwk(publicPem);

    expect(jwk).to.eql(expectedPublic);
  });

  it('should return a private JWK by default', function() {
    var jwk = rsaPemToJwk(privatePem);

    expect(jwk).to.eql(expectedPrivate);
  });

  it('should return a public JWK with extra keys', function() {
    var jwk = rsaPemToJwk(publicPem, {use: 'sig'});

    expect(jwk).to.eql(objectAssign({}, expectedPublic, {use: 'sig'}));
  });

  it('should return a private JWK with extra keys', function() {
    var jwk = rsaPemToJwk(privatePem, {use: 'sig'});

    expect(jwk).to.eql(objectAssign({}, expectedPrivate, {use: 'sig'}));
  });

  it('should return a public JWK from a private PEM', function() {
    var jwk = rsaPemToJwk(privatePem, 'public');

    expect(jwk).to.eql(expectedPublic);
  });

  it('should return a public JWK with extra keys from a private PEM',
      function() {
    var jwk = rsaPemToJwk(privatePem, {use: 'sig'}, 'public');

    expect(jwk).to.eql(objectAssign({}, expectedPublic, {use: 'sig'}));
  });

  it('should fail to return a private JWK from a public PEM', function() {
    var jwk = rsaPemToJwk(publicPem, 'private');

    expect(jwk).to.be.undefined;
  });

  it('should fail to return a private JWK with extra keys from public PEM',
      function() {
    var jwk = rsaPemToJwk(publicPem, {use: 'sig'}, 'private');

    expect(jwk).to.be.undefined;
  });
});
