describe( "SHA-1", function () {
    var alg = 'SHA-1';

    describe( "digest", function () {
        var vectors = [
            { text: "",             digest: "da39a3ee5e6b4b0d3255bfef95601890afd80709" },
            { text: "Hello World!", digest: "2ef7bde608ce5404e97d5f042f95f89f1c232871" },
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
