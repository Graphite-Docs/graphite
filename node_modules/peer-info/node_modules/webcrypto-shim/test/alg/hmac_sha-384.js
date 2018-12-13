describe( 'HMAC_SHA-384', function () {
    var alg = { name: 'HMAC', hash: 'SHA-384' },
        jwkAlg = 'HS384',
        bs = 1024;

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
            { comment: "512-bit key",
              key: "0123456789abcdefghijklmnopqrstuv0123456789abcdefghijklmnopqrstuv",
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
            { comment: "512-bit key",
              key: "0123456789abcdefghijklmnopqrstuv0123456789abcdefghijklmnopqrstuv",
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
              mac: "bda08a334994873233c844d24f0e7cf8c76c6e9feeb9c25ce97b9446e8efe3e06c261741ca21580360f20f1fd2190e0a" },
            { key: "test",
              text: "hmac",
              mac: "f7ec591d04d764c4b1acad2bbfc171e82e60009bccf05ec3209d8b26854caafc66e40937d710efecdb0984084916d69f" },
            { key: "test",
              text: "Hmac",
              mac: "4fe9f3ce02dc5543403c292e7e2664dd1f384716e5172c17c8eecfe86d992ebdd31fb516ff2b7474b01a0f063355e0b4" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!",
              text: "TestTestTest",
              mac: "5515a024ef5fabd241378c6431f5b71e5740abe1f1394f73ce4b44c0b47b96346423957c7b202d4ab500abd87525e855" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!\0",
              text: "TestTestTest",
              mac: "5515a024ef5fabd241378c6431f5b71e5740abe1f1394f73ce4b44c0b47b96346423957c7b202d4ab500abd87525e855" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!\0\0",
              text: "TestTestTest",
              mac: "8a5a5653192634bc14fb4e4ad1046d4dc038d936dd551b0f9c26aa221e062e36a79315a0ca722436b2bcb54763a51257" },
        ];

        vectors.forEach( function ( v ) {
            var keyBytes = s2b( v.key ),
                textBytes = s2b( v.text );

            it( "'" + v.text + "' as ArrayBuffer w/ key '" + v.key + "'" + ( v.comment ? ", " + v.comment : "" ), function ( done ) {
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

            it( "'" + v.text + "' as Uint8Array w/ key '" + v.key + "'" + ( v.comment ? ", " + v.comment : "" ), function ( done ) {
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
              mac: "bda08a334994873233c844d24f0e7cf8c76c6e9feeb9c25ce97b9446e8efe3e06c261741ca21580360f20f1fd2190e0a" },
            { key: "test",
              text: "hmac",
              mac: "f7ec591d04d764c4b1acad2bbfc171e82e60009bccf05ec3209d8b26854caafc66e40937d710efecdb0984084916d69f" },
            { key: "test",
              text: "Hmac",
              mac: "4fe9f3ce02dc5543403c292e7e2664dd1f384716e5172c17c8eecfe86d992ebdd31fb516ff2b7474b01a0f063355e0b4" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!",
              text: "TestTestTest",
              mac: "5515a024ef5fabd241378c6431f5b71e5740abe1f1394f73ce4b44c0b47b96346423957c7b202d4ab500abd87525e855" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!\0",
              text: "TestTestTest",
              mac: "5515a024ef5fabd241378c6431f5b71e5740abe1f1394f73ce4b44c0b47b96346423957c7b202d4ab500abd87525e855" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!\0\0",
              text: "TestTestTest",
              mac: "8a5a5653192634bc14fb4e4ad1046d4dc038d936dd551b0f9c26aa221e062e36a79315a0ca722436b2bcb54763a51257" },
        ];

        vectors.forEach( function ( v ) {
            var keyBytes = s2b( v.key ),
                textBytes = s2b( v.text ),
                macBytes = x2b( v.mac );

            it( "'" + v.text + "' w/ key '" + v.key + "' to match '" + v.mac + "' as ArrayBuffer" + ( v.comment ? ", " + v.comment : "" ), function ( done ) {
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

            it( "'" + v.text + "' w/ key '" + v.key + "' to match '" + v.mac + "' as Uint8Array" + ( v.comment ? ", " + v.comment : "" ), function ( done ) {
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
