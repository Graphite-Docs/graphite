describe( "SHA-512", function () {
    var alg = 'SHA-512';

    describe( "digest", function () {
        var vectors = [
            { text: "",             digest: "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e" },
            { text: "Hello World!", digest: "861844d6704e8573fec34d967e20bcfef3d424cf48be04e6dc08f2bd58c729743371015ead891cc3cf1c9d34b49264b510751b1ff9e537937bc46b5d6ff4ecc8" },
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
