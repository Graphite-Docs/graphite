describe( 'HMAC_SHA-512', function () {
    var alg = { name: 'HMAC', hash: 'SHA-512' },
        jwkAlg = 'HS512',
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
              mac: "01917bf85be0c998598a2332f75c2fe6f662c0900d4391123ca2bc61f073ede360af8f3afd6e5d3f28dff4b57cc22890aa7b7498cf441f32a6f6e78aca3cafe8" },
            { key: "test",
              text: "hmac",
              mac: "64e6603dc2784ceecad217072e66deebe7293b1184e99124239ddbed2004dfae81829d52ccc16f0c3074a24e4bf838890f73abc357ee1a63f9914572d248d9c6" },
            { key: "test",
              text: "Hmac",
              mac: "37be70d3db5ced641c5a2356d85811d204af8490bc96ed34b22205f01ab029f0752c3dfb8af89cf59f75bfa6ac894f9348b0ba46ea6f1383d1b9bff82f2f604e" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!",
              text: "TestTestTest",
              mac: "0b3a5ac27e3d9baf7ae009a40d2c72109c6cfcc124c669fc0a44dfc6f2c521532f3ad83a3a67ecafb7c035f7f24099bed67beb3f843ad2bf708a08bdced7b84f" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!\0",
              text: "TestTestTest",
              mac: "0b3a5ac27e3d9baf7ae009a40d2c72109c6cfcc124c669fc0a44dfc6f2c521532f3ad83a3a67ecafb7c035f7f24099bed67beb3f843ad2bf708a08bdced7b84f" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!\0\0",
              text: "TestTestTest",
              mac: "e1d54be191b2d73d995a0f107625dc47292ea70e24712343f2ddc0724e415155abcc3564c4971d32801e9edb6123dc8296d8e35b4047165f2145258a2a781e12" },
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
              mac: "01917bf85be0c998598a2332f75c2fe6f662c0900d4391123ca2bc61f073ede360af8f3afd6e5d3f28dff4b57cc22890aa7b7498cf441f32a6f6e78aca3cafe8" },
            { key: "test",
              text: "hmac",
              mac: "64e6603dc2784ceecad217072e66deebe7293b1184e99124239ddbed2004dfae81829d52ccc16f0c3074a24e4bf838890f73abc357ee1a63f9914572d248d9c6" },
            { key: "test",
              text: "Hmac",
              mac: "37be70d3db5ced641c5a2356d85811d204af8490bc96ed34b22205f01ab029f0752c3dfb8af89cf59f75bfa6ac894f9348b0ba46ea6f1383d1b9bff82f2f604e" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!",
              text: "TestTestTest",
              mac: "0b3a5ac27e3d9baf7ae009a40d2c72109c6cfcc124c669fc0a44dfc6f2c521532f3ad83a3a67ecafb7c035f7f24099bed67beb3f843ad2bf708a08bdced7b84f" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!\0",
              text: "TestTestTest",
              mac: "0b3a5ac27e3d9baf7ae009a40d2c72109c6cfcc124c669fc0a44dfc6f2c521532f3ad83a3a67ecafb7c035f7f24099bed67beb3f843ad2bf708a08bdced7b84f" },
            { key: "53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3tpw53cr3t!!!\0\0",
              text: "TestTestTest",
              mac: "e1d54be191b2d73d995a0f107625dc47292ea70e24712343f2ddc0724e415155abcc3564c4971d32801e9edb6123dc8296d8e35b4047165f2145258a2a781e12" },
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
