describe( "SHA-384", function () {
    var alg = 'SHA-384';

    describe( "digest", function () {
        var vectors = [
            { text: "",             digest: "38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b" },
            { text: "Hello World!", digest: "bfd76c0ebbd006fee583410547c1887b0292be76d582d96c242d2a792723e3fd6fd061f9d5cfd13b8f961358e6adba4a" },
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
