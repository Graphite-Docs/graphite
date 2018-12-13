describe( 'HMAC_SHA-1', function () {
    var alg = { name: 'HMAC', hash: 'SHA-1' },
        jwkAlg = 'HS1',
        bs = 512;

    describe( "generateKey", function () {
        it( "extractable", function ( done ) {
            var keyAlg = extend( normalizeAlg(alg), { length: 128 } ),
                keyExt = true,
                keyUse = [ 'sign', 'verify' ];

            crypto.subtle.generateKey( keyAlg, keyExt, keyUse )
                .then( function ( key ) {
                    expect(key).toEqual(jasmine.any(CryptoKey));
                    expect(key.type).toBe('secret');
                    expect(key.extractable).toBe(keyExt);
                    expect(key.algorithm).toEqual(keyAlg);
                    expect(key.usages).toEqual(keyUse);
                })
                .catch(fail)
                .then(done);
        });

        it( "non-extractable", function ( done ) {
            var keyAlg = extend( normalizeAlg(alg), { length: 128 } ),
                keyExt = false,
                keyUse = [ 'sign', 'verify' ];

            crypto.subtle.generateKey( keyAlg, keyExt, keyUse )
                .then( function ( key ) {
                    expect(key).toEqual(jasmine.any(CryptoKey));
                    expect(key.type).toBe('secret');
                    expect(key.extractable).toBe(keyExt);
                    expect(key.algorithm).toEqual(keyAlg);
                    expect(key.usages).toEqual(keyUse);
                })
                .catch(fail)
                .then(done);
        });

        it( "non-extractable, w/ omited 'length' parameter", function ( done ) {
            var keyAlg = extend( normalizeAlg(alg), { length: bs } ),
                keyExt = false,
                keyUse = [ 'sign', 'verify' ];

            crypto.subtle.generateKey( alg, keyExt, keyUse )
                .then( function ( key ) {
                    expect(key).toEqual(jasmine.any(CryptoKey));
                    expect(key.type).toBe('secret');
                    expect(key.extractable).toBe(keyExt);
                    expect(key.algorithm).toEqual(keyAlg);
                    expect(key.usages).toEqual(keyUse);
                })
                .catch(fail)
                .then(done);
        });

        it( "non-extractable, w/ 'length' parameter not a multiple of 8", function ( done ) {
            var keyAlg = extend( normalizeAlg(alg), { length: 137 } ),
                keyExt = false,
                keyUse = [ 'sign', 'verify' ];

            crypto.subtle.generateKey( keyAlg, keyExt, keyUse )
                .then( function ( key ) {
                    expect(key).toEqual(jasmine.any(CryptoKey));
                    expect(key.type).toBe('secret');
                    expect(key.extractable).toBe(keyExt);
                    expect(key.algorithm).toEqual(keyAlg);
                    expect(key.usages).toEqual(keyUse);
                })
                .catch(fail)
                .then(done);
        });

        it( "w/ sign-only key usage", function ( done ) {
            var keyAlg = extend( normalizeAlg(alg), { length: bs } ),
                keyExt = false,
                keyUse = [ 'sign' ];

            crypto.subtle.generateKey( keyAlg, keyExt, keyUse )
                .then( function ( key ) {
                    expect(key).toEqual(jasmine.any(CryptoKey));
                    expect(key.type).toBe('secret');
                    expect(key.extractable).toBe(keyExt);
                    expect(key.algorithm).toEqual(keyAlg);
                    expect(key.usages).toEqual(keyUse);
                })
                .catch(fail)
                .then(done);
        });

        it( "w/ verify-only key usage", function ( done ) {
            var keyAlg = extend( normalizeAlg(alg), { length: bs } ),
                keyExt = false,
                keyUse = [ 'sign' ];

            crypto.subtle.generateKey( keyAlg, keyExt, keyUse )
                .then( function ( key ) {
                    expect(key).toEqual(jasmine.any(CryptoKey));
                    expect(key.type).toBe('secret');
                    expect(key.extractable).toBe(keyExt);
                    expect(key.algorithm).toEqual(keyAlg);
                    expect(key.usages).toEqual(keyUse);
                })
                .catch(fail)
                .then(done);
        });
    });

    describe( "importKey", function () {
        var vectors = [
            { key: "test",
              use: [ 'sign', 'verify' ] },
            { comment: "non-extractable",
              key: "test",
              use: [ 'sign', 'verify' ] },
            { comment: "key length is't a multiple of 8",
              key: "bits",
              len: 31 },
            { comment: "sign-only",
              key: "qwerty",
              use: [ 'sign' ] },
            { comment: "verify-only",
              key: "verify-only",
              use: [ 'verify' ] },
            { comment: "160-bit key",
              key: "0123456789abcdefghij",
              use: [ 'verify' ] },
        ];

        vectors.forEach( function ( v ) {
            var keyAlg = extend( normalizeAlg(alg), { length: v.len || 8 * v.key.length } ),
                keyBytes = s2b(v.key),
                keyJwk = { kty: 'oct', alg: jwkAlg, ext: v.ext || true, key_ops: v.use || [ 'sign', 'verify' ],
                           k: btoa(v.key).replace(/\=+$/, '').replace(/\+/g, '-').replace(/\//g, '_') };

            it( "'" + v.key + "' as 'raw' ArrayBuffer" + ( v.comment ? ", " + v.comment : "" ), function ( done ) {
                crypto.subtle.importKey( 'raw', keyBytes.buffer, keyAlg, v.ext || true, v.use || [ 'sign', 'verify' ] )
                    .then( function ( key ) {
                        expect(key).toEqual(jasmine.any(CryptoKey));
                        expect(key.type).toBe('secret');
                        expect(key.algorithm).toEqual(keyAlg);
                        expect(key.extractable).toBe(v.ext || true);
                        expect(key.usages).toEqual(v.use || [ 'sign', 'verify' ] );
                    })
                    .catch(fail)
                    .then(done);
            });

            it( "'" + v.key + "' as 'raw' Uint8Array" + ( v.comment ? ", " + v.comment : "" ), function ( done ) {
                crypto.subtle.importKey( 'raw', keyBytes, keyAlg, v.ext || true, v.use || [ 'sign', 'verify' ] )
                    .then( function ( key ) {
                        expect(key).toEqual(jasmine.any(CryptoKey));
                        expect(key.type).toBe('secret');
                        expect(key.algorithm).toEqual(keyAlg);
                        expect(key.extractable).toBe(v.ext || true);
                        expect(key.usages).toEqual(v.use || [ 'sign', 'verify' ] );
                    })
                    .catch(fail)
                    .then(done);
            });

            it( "'" + v.key + "' as 'jwk' JsonWebKey" + ( v.comment ? ", " + v.comment : "" ), function ( done ) {
                crypto.subtle.importKey( 'jwk', keyJwk, keyAlg, v.ext || true, v.use || [ 'sign', 'verify' ] )
                    .then( function ( key ) {
                        expect(key).toEqual(jasmine.any(CryptoKey));
                        expect(key.type).toBe('secret');
                        expect(key.algorithm).toEqual(keyAlg);
                        expect(key.extractable).toBe(v.ext || true);
                        expect(key.usages).toEqual(v.use || [ 'sign', 'verify' ] );
                    })
                    .catch(fail)
                    .then(done);
            });
        });
    });

    describe( "exportKey", function () {
        var vectors = [
            { key: "test",
              use: [ 'sign', 'verify' ] },
            { comment: "key length is't a multiple of 8",
              key: "bits",
              len: 31 },
            { comment: "sign-only",
              key: "qwerty",
              use: [ 'sign' ] },
            { comment: "verify-only",
              key: "verify-only",
              use: [ 'verify' ] },
            { comment: "160-bit key",
              key: "0123456789abcdefghij",
              use: [ 'verify' ] },
        ];

        vectors.forEach( function ( v ) {
            var keyBytes = s2b(v.key),
                keyJwk = { kty: 'oct', alg: jwkAlg, ext: true, key_ops: v.use || [ 'sign', 'verify' ],
                           k: btoa(v.key).replace(/\=+$/, '').replace(/\+/g, '-').replace(/\//g, '_') };

            it( "'" + v.key + "' as 'raw' ArrayBuffer" + ( v.comment ? ", " + v.comment : "" ), function ( done ) {
                crypto.subtle.importKey( 'raw', keyBytes, alg, true, v.use || [ 'sign', 'verify' ] )
                    .then( function ( key ) {
                        return crypto.subtle.exportKey( 'raw', key )
                    })
                    .then( function ( keyData ) {
                        expect(keyData).toEqual(jasmine.any(ArrayBuffer));
                        expect( b2s(keyData) ).toEqual(v.key);
                    })
                    .catch(fail)
                    .then(done);
            });

            it( "'" + v.key + "' as 'jwk' JsonWebKey" + ( v.comment ? ", " + v.comment : "" ), function ( done ) {
                crypto.subtle.importKey( 'raw', keyBytes, alg, true, v.use || [ 'sign', 'verify' ] )
                    .then( function ( key ) {
                        return crypto.subtle.exportKey( 'jwk', key )
                    })
                    .then( function ( jwk ) {
                        expect(jwk).toEqual(jasmine.any(Object));
                        expect(jwk).toEqual(keyJwk);
                    })
                    .catch(fail)
                    .then(done);
            });
        });
    });

    describe( "sign", function () {
        var vectors = [
            { key: "test",
              text: "",
              mac: "fc85087452696e5bcbe3b7a71fde00e320af2cca" },
            { key: "test",
              text: "hmac",
              mac: "2642b744d69b90c320b6d929f16f10408c5ebb13" },
            { key: "test",
              text: "Hmac",
              mac: "8404861d13420ae01368f4f63cc8b45c1e35d9eb" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!",
              text: "TestTestTest",
              mac: "eac8bc37de470cbeb980fea9cebfa729dccbae46" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!\0",
              text: "TestTestTest",
              mac: "eac8bc37de470cbeb980fea9cebfa729dccbae46" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!\0\0",
              text: "TestTestTest",
              mac: "32534228e53ff25a0c475acee93577afaf21e544" },
        ];

        vectors.forEach( function ( v ) {
            var keyBytes = s2b( v.key ),
                textBytes = s2b( v.text );

            it( "'" + v.text + "' as ArrayBuffer w/ key '" + v.key + "'", function ( done ) {
                crypto.subtle.importKey( 'raw', keyBytes, alg, false, [ 'sign', 'verify' ] )
                    .then( function ( key ) {
                        return crypto.subtle.sign( alg, key, textBytes.buffer )
                    })
                    .then( function ( mac ) {
                        expect(mac).toEqual(jasmine.any(ArrayBuffer));
                        expect( b2x(mac) ).toEqual(v.mac);
                    })
                    .catch(fail)
                    .then(done);
            });

            it( "'" + v.text + "' as Uint8Array w/ key '" + v.key + "'", function ( done ) {
                crypto.subtle.importKey( 'raw', keyBytes, alg, false, [ 'sign', 'verify' ] )
                    .then( function ( key ) {
                        return crypto.subtle.sign( alg, key, textBytes )
                    })
                    .then( function ( mac ) {
                        expect(mac).toEqual(jasmine.any(ArrayBuffer));
                        expect( b2x(mac) ).toEqual(v.mac);
                    })
                    .catch(fail)
                    .then(done);
            });
        });
    });

    describe( "verify", function () {
        var vectors = [
            { key: "test",
              text: "",
              mac: "fc85087452696e5bcbe3b7a71fde00e320af2cca" },
            { key: "test",
              text: "hmac",
              mac: "2642b744d69b90c320b6d929f16f10408c5ebb13" },
            { key: "test",
              text: "Hmac",
              mac: "8404861d13420ae01368f4f63cc8b45c1e35d9eb" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!",
              text: "TestTestTest",
              mac: "eac8bc37de470cbeb980fea9cebfa729dccbae46" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!\0",
              text: "TestTestTest",
              mac: "eac8bc37de470cbeb980fea9cebfa729dccbae46" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!\0\0",
              text: "TestTestTest",
              mac: "32534228e53ff25a0c475acee93577afaf21e544" },
        ];

        vectors.forEach( function ( v ) {
            var keyBytes = s2b( v.key ),
                textBytes = s2b( v.text ),
                macBytes = x2b( v.mac );

            it( "'" + v.text + "' w/ key '" + v.key + "' to match '" + v.mac + "' as ArrayBuffer", function ( done ) {
                crypto.subtle.importKey( 'raw', keyBytes, alg, false, [ 'sign', 'verify' ] )
                    .then( function ( key ) {
                        return crypto.subtle.verify( alg, key, macBytes.buffer, textBytes )
                    })
                    .then( function ( valid ) {
                        expect(valid).toBe(true);
                    })
                    .catch(fail)
                    .then(done);
            });

            it( "'" + v.text + "' w/ key '" + v.key + "' to match '" + v.mac + "' as Uint8Array", function ( done ) {
                crypto.subtle.importKey( 'raw', keyBytes, alg, false, [ 'sign', 'verify' ] )
                    .then( function ( key ) {
                        return crypto.subtle.verify( alg, key, macBytes, textBytes )
                    })
                    .then( function ( valid ) {
                        expect(valid).toBe(true);
                    })
                    .catch(fail)
                    .then(done);
            });
        });
    });
});
