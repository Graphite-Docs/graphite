/* Copyright 2014 Open Ag Data Alliance
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
'use strict';

var rsaUnpack = require('rsa-unpack');
var objectAssign = require('object-assign');

/*
 *  Parameters:
 *   pem - string of PEM encoded RSA key
 *   extraKeys - custom keys to be included in JWK
 *   type - 'public' for JWK of only the public portion of the key and
 *          'private' for a JWK of both the public and private portions
 *
 * Prototypes:
 *  - rsaPemToJwk('...', {...}, 'public');
 *  - rsaPemToJwk('...', 'private');
 *  - rsaPemToJwk('...', {...});
 */
module.exports = function rsaPemToJwk(pem, extraKeys, type) {
  // Unpack the PEM
  var key = rsaUnpack(pem);
  if (key === undefined) {
    return undefined;
  }

  // Process parameters
  if (typeof extraKeys === 'string') {
    type = extraKeys;
    extraKeys = {};
  }
  type = type || (key.privateExponent !== undefined ? 'private' : 'public');

  // Requested private JWK but gave a public PEM
  if (type == 'private' && key.privateExponent === undefined) {
    return undefined;
  }

  // Make the public exponent into a buffer of minimal size
  var expSize = Math.ceil(Math.log(key.publicExponent) / Math.log(256));
  var exp = new Buffer(expSize);
  var v = key.publicExponent;

  for (var i = expSize - 1; i >= 0; i--) {
    exp.writeUInt8(v % 256, i);
    v = Math.floor(v / 256);
  }

  // The public portion is always present
  var r = objectAssign({kty: 'RSA'}, extraKeys, {
    n: base64url(key.modulus),
    e: base64url(exp),
  });

  // Add private
  if (type === 'private') {
    objectAssign(r, {
      d: base64url(key.privateExponent),
      p: base64url(key.prime1),
      q: base64url(key.prime2),
      dp: base64url(key.exponent1),
      dq: base64url(key.exponent2),
      qi: base64url(key.coefficient),
    });
  }

  return r;
};

function base64url(b) {
  return b.toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
}
