describe( 'AES-GCM' , function () {
    var alg = { name: 'AES-GCM', length: 256 };
    var key;

    var genKeyComplete = crypto.subtle.generateKey( alg, true, [ 'encrypt', 'decrypt' ] )
            .then( function ( res ) {
                key = res;
            });

    it( "generateKey", function ( done ) {
        genKeyComplete
            .then( function () {
                expect(key).toBeDefined();
                expect(key.type).toBe('secret');
                expect(key.extractable).toBe(true);
                expect(key.algorithm).toEqual( normalizeAlg(alg) );
            })
            .catch(fail)
            .then(done);
    });

    it( "encrypt and then decrypt", function ( done ) {
        genKeyComplete
            .then( function () {
                return crypto.subtle.encrypt( extend( alg, { iv: new Uint8Array(12), tagLength: 128 } ), key, new Uint8Array(16) )
            })
            .then( function ( res ) {
                expect(res).toEqual(jasmine.any(ArrayBuffer));
                expect(res.byteLength).toBe(32);

                return crypto.subtle.decrypt( extend( alg, { iv: new Uint8Array(12), tagLength: 128 } ), key, res )
            })
            .then( function ( res ) {
                expect(res).toEqual(jasmine.any(ArrayBuffer));
                expect(res.byteLength).toBe(16);
            })
            .catch(fail)
            .then(done);
    });
});
