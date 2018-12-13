describe( "SHA-256", function () {
    var alg = 'SHA-256';

    describe( "digest", function () {
        var vectors = [
            { text: "",             digest: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
            { text: "Hello World!", digest: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069" },
        ];

        vectors.forEach( function ( v ) {
            var bytes = s2b( v.text );

            it( "of '" + v.text + "' as ArrayBuffer", function ( done ) {
                crypto.subtle.digest( alg, bytes.buffer )
                    .then( function ( hash ) {
                        expect( b2x(hash) ).toBe( v.digest );
                    })
                    .catch(fail)
                    .then(done);
            });

            it( "of '" + v.text + "' as Uint8Array", function ( done ) {
                crypto.subtle.digest( alg, bytes )
                    .then( function ( hash ) {
                        expect( b2x(hash) ).toBe( v.digest );
                    })
                    .catch(fail)
                    .then(done);
            });
        });
    });
});
