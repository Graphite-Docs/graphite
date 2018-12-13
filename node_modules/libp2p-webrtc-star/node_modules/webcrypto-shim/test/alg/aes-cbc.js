describe( 'AES-CBC' , function () {
    var alg = { name: 'AES-CBC', length: 256 };
    var key;

    var genKeyComplete = crypto.subtle.generateKey( alg, true, [ 'encrypt', 'decrypt' ] )
            .then( function ( res ) {
                key = res;
            });

    it( "generateKey", function ( done ) {
        genKeyComplete
            .then( function () {
                expect(key).toBeDefined();
                expect(key instanceof CryptoKey).toBe(true);
                expect(key.type).toBe('secret');
                expect(key.extractable).toBe(true);
                expect(key.algorithm).toEqual( normalizeAlg(alg) );
            })
            .catch(fail)
            .then(done);
    });

    it( "encrypt / decrypt", function ( done ) {
        genKeyComplete
            .then( function () {
                return crypto.subtle.encrypt( extend( alg, { iv: new Uint8Array(16) } ), key, new Uint8Array(16) )
            })
            .then( function ( res ) {
                expect(res).toEqual(jasmine.any(ArrayBuffer));
                expect(res.byteLength).toBe(32);

                return crypto.subtle.decrypt( extend( alg, { iv: new Uint8Array(16) } ), key, res )
            })
            .then( function ( res ) {
                expect(res).toEqual(jasmine.any(ArrayBuffer));
                expect(res.byteLength).toBe(16);
            })
            .catch(fail)
            .then(done);
    });

    it( 'wrapKey / unwrapKey', function ( done ) {
        var keyAlg = { name: 'AES-CBC', length: 128 };
            wrapAlg = { name: 'AES-CBC', length: 128 };

        var wrapParam = extend( wrapAlg, { iv: new Uint8Array(16) } );

        Promise.all([
            crypto.subtle.generateKey( keyAlg, true, [ 'encrypt' ] ),
            crypto.subtle.generateKey( wrapAlg, false, [ 'decrypt', 'wrapKey', 'unwrapKey' ] )
        ])
        .then( function ( keys ) {
            return crypto.subtle
                .wrapKey( 'raw', keys[0], keys[1], wrapParam )
                .then( function ( wrap ) {
                    return Promise.all([
                        crypto.subtle.exportKey( 'raw', keys[0] ),
                        crypto.subtle.decrypt( wrapParam, keys[1], wrap ),
                        crypto.subtle.unwrapKey( 'raw', wrap, keys[1], wrapParam, keyAlg, true, [ 'encrypt' ] )
                            .then( function ( res ) {
                                return crypto.subtle.exportKey( 'raw', res );
                            }),
                    ]);
                })
        })
        .then( function ( res ) {
            expect( new Uint8Array( res[0] ) ).toEqual( new Uint8Array( res[1] ) );
            expect( new Uint8Array( res[0] ) ).toEqual( new Uint8Array( res[2] ) );
        })
        .catch(fail)
        .then(done);
    });
});
