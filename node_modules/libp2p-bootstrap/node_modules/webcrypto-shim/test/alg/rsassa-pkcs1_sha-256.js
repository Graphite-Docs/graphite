describe( 'RSASSA-PKCS1-v1.5_SHA-256', function () {
    var alg = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        pubUse = 'verify',
        prvUse = 'sign',
        jwkAlg = 'RS256';

    function skipModLen ( modLen ) {
        return modLen > 2048;
    }

    describe( "generateKey", function () {
        [ 1024, 2048, 3072, 4096 ].forEach( function ( modLen ) {
            (skipModLen(modLen) ? xdescribe : describe)( modLen + " bits", function ( done ) {
                var keyAlg = extend( normalizeAlg(alg), { modulusLength: modLen, publicExponent: x2b('10001') } );

                var generateKeyComplete = new Promise( function ( res, rej ) {
                        skipModLen(modLen) ? rej( new Error("Skipping large RSA moduli") )
                                           : res( crypto.subtle.generateKey( keyAlg, true, [ prvUse, pubUse ] ) );
                    });

                var vectors = [
                    { text: "" },
                    { text: "Hello World!" },
                ];

                it( "generateKey", function ( done ) {
                    generateKeyComplete
                        .then( function ( keyPair ) {
                            expect(keyPair).toBeDefined();

                            expect(keyPair.publicKey).toEqual(jasmine.any(CryptoKey));
                            expect(keyPair.publicKey.type).toBe('public');
                            expect(keyPair.publicKey.algorithm).toEqual(keyAlg);
                            expect(keyPair.publicKey.extractable).toBe(true);
                            expect(keyPair.publicKey.usages).toEqual([pubUse]);

                            expect(keyPair.privateKey).toEqual(jasmine.any(CryptoKey));
                            expect(keyPair.privateKey.type).toBe('private');
                            expect(keyPair.privateKey.algorithm).toEqual(keyAlg);
                            expect(keyPair.privateKey.extractable).toBe(true);
                            expect(keyPair.privateKey.usages).toEqual([prvUse]);
                        })
                        .catch(fail)
                        .then(done);
                }, 30000 );

                describe( "exportKey", function () {
                    it( "spki", function ( done ) {
                        generateKeyComplete
                            .then( function ( keyPair ) {
                                return crypto.subtle.exportKey( 'spki', keyPair.publicKey );
                            })
                            .then( function ( spkiData ) {
                                expect(spkiData).toEqual(jasmine.any(ArrayBuffer));
                            })
                            .catch(fail)
                            .then(done);
                    }, 30000 );

                    it( "pkcs8", function ( done ) {
                        generateKeyComplete
                            .then( function ( keyPair ) {
                                return crypto.subtle.exportKey( 'pkcs8', keyPair.privateKey );
                            })
                            .then( function ( pkcs8Data ) {
                                expect(pkcs8Data).toEqual(jasmine.any(ArrayBuffer));
                            })
                            .catch(fail)
                            .then(done);
                    }, 30000 );

                    it( "jwk publicKey", function ( done ) {
                        generateKeyComplete
                            .then( function ( keyPair ) {
                                return crypto.subtle.exportKey( 'jwk', keyPair.publicKey );
                            })
                            .then( function ( jwkPubKey ) {
                                expect(jwkPubKey).toEqual(jasmine.objectContaining( { 'kty': 'RSA', 'alg': jwkAlg, 'ext': true, 'key_ops': [pubUse] } ));
                            })
                            .catch(fail)
                            .then(done);
                    }, 30000 );

                    it( "jwk privateKey", function ( done ) {
                        generateKeyComplete
                            .then( function ( keyPair ) {
                                return crypto.subtle.exportKey( 'jwk', keyPair.privateKey );
                            })
                            .then( function ( jwkPrvKey ) {
                                expect(jwkPrvKey).toEqual(jasmine.objectContaining( { 'kty': 'RSA', 'alg': jwkAlg, 'ext': true, 'key_ops': [prvUse] } ));
                            })
                            .catch(fail)
                            .then(done);
                    }, 30000 );
                });

                describe( "sign", function () {
                    vectors.forEach( function ( v ) {
                        it( "'" + v.text + "' as ArrayBuffer", function ( done ) {
                            generateKeyComplete
                                .then( function ( keyPair ) {
                                    return crypto.subtle.sign( alg, keyPair.privateKey, s2b(v.text).buffer );
                                })
                                .then( function ( signature ) {
                                    expect(signature).toEqual( jasmine.any(ArrayBuffer) );
                                    expect(signature.byteLength).toBe(modLen>>3);
                                })
                                .catch(fail)
                                .then(done);
                        });

                        it( "'" + v.text + "' as Uint8Array", function ( done ) {
                            generateKeyComplete
                                .then( function ( keyPair ) {
                                    return crypto.subtle.sign( alg, keyPair.privateKey, s2b(v.text) );
                                })
                                .then( function ( signature ) {
                                    expect(signature).toEqual( jasmine.any(ArrayBuffer) );
                                    expect(signature.byteLength).toBe(modLen>>3);
                                })
                                .catch(fail)
                                .then(done);
                        });
                    });
                });

                describe( "verify", function () {
                    vectors.forEach( function ( v ) {
                        it( "'" + v.text + "'", function ( done ) {
                            generateKeyComplete
                                .then( function ( keyPair ) {
                                    return crypto.subtle.sign( alg, keyPair.privateKey, s2b(v.text) )
                                        .then( function ( signature ) {
                                            return crypto.subtle.verify( alg, keyPair.publicKey, signature, s2b(v.text) );
                                        });
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
        });
    });

    describe( "importKey", function () {
        var vectors = [
            { modLen: 1024,
              spkiPubKey: "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLByONu1gLtN2X0I3b9DDZjxCAS7cP9gh89oosQV0A1ZLd8Ec7K906E12l9I8RGrTgy9Xdj0+UwUAsN+sjlSg6oOydpt98jPJdLMvfftK813kdwgHhK90reGV6og5xtGvvnc3qKv/8b/ETSCyrExZYod0ap//0Z+QEanex72jGEwIDAQAB",
              pkcsPrvKey: "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAMsHI427WAu03ZfQjdv0MNmPEIBLtw/2CHz2iixBXQDVkt3wRzsr3ToTXaX0jxEatODL1d2PT5TBQCw36yOVKDqg7J2m33yM8l0sy99+0rzXeR3CAeEr3St4ZXqiDnG0a++dzeoq//xv8RNILKsTFlih3Rqn//Rn5ARqd7HvaMYTAgMBAAECgYEAwlEJ2Uw2n7Wy5Oup6pwT6RZBf9l302Hyi8/XPTYuEm9XSu3+7wYzjbMdTYn9KCy8c+8DuTPBwikYB3pZpkvLHGRPLGDBHdzW6tGrCZDihfR/o0QJoa/V3fU+llH3xJwqek7Yem3IXVefHYRf+vMy5TVU/9etb9s2uNePeePPvKkCQQD2fhOOJ61bmTrzztVmveaaChsDfRg8P5yP8YJc68ET42NLbh1taSIy4A0tRMUVGRUCkpIgbNsHna0xGjc8qkAvAkEA0tviDZgsMIp9hez9o2NnFu2cGLliy5h9dsxyN54r75aEOis6MjODUam5s3aND0plJjTBN1fXJ3oYdej48r2bXQJBANQSGr8GcgdJ6UeUX1Qa9Ej5gs5YlT5YuFm7vp41k5OJ4ocmQRk+B9dfntagwTNqtgHVmvVc0oFV7ok9deKy068CQGuMUYFjk25yxNFRbpEuuz8blJmbvQNhVOUKJFuv5nL+j5TnxXgjhCBb9GbP2eTpqivRjpd+yzPMd7t0R73v7dUCQQC6JjHf49JKmINQe0H9Nx7toeDyvJAfLKPrm1hwWspWJIzyINQXeZWwrXMQ79O4Rbl0CYwh8AoRN81KPVr4JUGL",
              jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"ywcjjbtYC7Tdl9CN2_Qw2Y8QgEu3D_YIfPaKLEFdANWS3fBHOyvdOhNdpfSPERq04MvV3Y9PlMFALDfrI5UoOqDsnabffIzyXSzL337SvNd5HcIB4SvdK3hleqIOcbRr753N6ir__G_xE0gsqxMWWKHdGqf_9GfkBGp3se9oxhM"},
              jwkPrvKey: {"alg":"RS256","d":"wlEJ2Uw2n7Wy5Oup6pwT6RZBf9l302Hyi8_XPTYuEm9XSu3-7wYzjbMdTYn9KCy8c-8DuTPBwikYB3pZpkvLHGRPLGDBHdzW6tGrCZDihfR_o0QJoa_V3fU-llH3xJwqek7Yem3IXVefHYRf-vMy5TVU_9etb9s2uNePeePPvKk","dp":"1BIavwZyB0npR5RfVBr0SPmCzliVPli4Wbu-njWTk4nihyZBGT4H11-e1qDBM2q2AdWa9VzSgVXuiT114rLTrw","dq":"a4xRgWOTbnLE0VFukS67PxuUmZu9A2FU5QokW6_mcv6PlOfFeCOEIFv0Zs_Z5OmqK9GOl37LM8x3u3RHve_t1Q","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"ywcjjbtYC7Tdl9CN2_Qw2Y8QgEu3D_YIfPaKLEFdANWS3fBHOyvdOhNdpfSPERq04MvV3Y9PlMFALDfrI5UoOqDsnabffIzyXSzL337SvNd5HcIB4SvdK3hleqIOcbRr753N6ir__G_xE0gsqxMWWKHdGqf_9GfkBGp3se9oxhM","p":"9n4TjietW5k6887VZr3mmgobA30YPD-cj_GCXOvBE-NjS24dbWkiMuANLUTFFRkVApKSIGzbB52tMRo3PKpALw","q":"0tviDZgsMIp9hez9o2NnFu2cGLliy5h9dsxyN54r75aEOis6MjODUam5s3aND0plJjTBN1fXJ3oYdej48r2bXQ","qi":"uiYx3-PSSpiDUHtB_Tce7aHg8ryQHyyj65tYcFrKViSM8iDUF3mVsK1zEO_TuEW5dAmMIfAKETfNSj1a-CVBiw"} },
            { modLen: 2048,
              spkiPubKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu5vPT6lEwGjoybfS2Soe9LhkpeXUq0jfmSoUXvjCqFgclo2QLRs4SK4pfluZl6HFFt+Yp/OiM7hDXAeAgz7Aze5yRjYPu63uIo4drSQmSiUe8rg9LNIQd83n+XJw0X/UNa2SGWGeFA+nuMAp4EpLCzc9T5/y3sBJHhGfV/aYg0O9hRgJyqRm5dMu3GmQpn0CY7keConQkcPW4osAIeoAIgRnJZKObDyIt5dRGQ5i8hitBVlMcV9jBeFf9/8LruA26g1mKvp9fQrhzt+1zhC3se46nqDhC2aF7gaos0pYVidqQvjQcsfvIcbPBNJvE3kIPsxc8YP22zPxQT95wS5JUQIDAQAB",
              pkcsPrvKey: "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC7m89PqUTAaOjJt9LZKh70uGSl5dSrSN+ZKhRe+MKoWByWjZAtGzhIril+W5mXocUW35in86IzuENcB4CDPsDN7nJGNg+7re4ijh2tJCZKJR7yuD0s0hB3zef5cnDRf9Q1rZIZYZ4UD6e4wCngSksLNz1Pn/LewEkeEZ9X9piDQ72FGAnKpGbl0y7caZCmfQJjuR4KidCRw9biiwAh6gAiBGclko5sPIi3l1EZDmLyGK0FWUxxX2MF4V/3/wuu4DbqDWYq+n19CuHO37XOELex7jqeoOELZoXuBqizSlhWJ2pC+NByx+8hxs8E0m8TeQg+zFzxg/bbM/FBP3nBLklRAgMBAAECggEAXUgpmkhlwO3o4XOfSQ9iePe+Q6a1Sb1gQD3mBxrVXvMAs/MLfwILyEegpg1Rn012O9tNgiTnv6OdCoNIaPmo0DwBYdu7kuv2fgP/yXkx+KfgbXsiH8kLGyascyFt6x0OHOqCvFAHU549HOWfbMBD8/2xZIf5MLyXHnZQrmIUjx8jgOG96lATc6MOSdAHKLuwuxQcJVF+pdzVyRXoDU5PG7W8+1TrNiWXajekuuziUsjNwCJ+SYkmo46D+Wx3/pTsrCIOIOYbGHezqx7voDPjceX+wiPGJZr1UBFRqunqWWUfdC+ZdoxMrk7I//GvifkhM7LWMb/sGLqvnaj1w/YpYQKBgQDfasogbe5MPS/98Eu0wCCzM06q4vHzUpaSWwwC2aKU9qSVPMDD/5qRnGczxhjrYa1ne3M9SriMuS1iqtuwFkP0l3aKDPrj7lmWcjxZxYZebydcrYYuQlsDrffHsmdQGVxiXFzPuVDD2bO5JdRXJzQ5OPmRxjDV1ZeCExF7iEph9QKBgQDW+B7Qza7ArUTCzc4gloEQhcYjEt8eoW4BSAlfxeVO1w48hkXeYuJ/vdlH9nKzIcez5O8DCV5S2GBHNloSjqhE5CBXEutg0N3KW5Cf5sNK7tSgMQiIYf7GTsaKra2Nq+YQpGvI3b87SZ5ZRV5Ju8aFGxDruG+JuS4xviGFo5fEbQKBgAG2GbJB5U9kMJfrXUkXJ6j3vaSFdID+ovSgCemDrUEi2oPiIT/fF1oCLrAw1kQHTYK7aViQ1/UL/hMBaAljQkX/WwMXslxImRsT6O5vGuZiR5ToJ1z3WScgEAPRlAUDDLgcKQHWU44MftnuNkAsprPBgffh4sHgjvaKGtotYxR5AoGAYkdpfziprjkI+K6ykD9+nhkqrppQG2beLgPLFVgaL+MuBQm2I6e9uX0IO1g2tCK7dEkz5IWB9AosaiI1J8rEr0pEZsqlhcu3um4GPrR3kGiEGQCR0BhNLEiTiI9Ci0SNmAozpM+MQAS2OkX2h2srpWrsX3ggtixNLDyqgrh6CDkCgYAnoURdEOlehr7rFYMcc0dBAXudHaYJco4PYI/c9cCbnwRaXodJJbVsECHiIiuxJEgxsdQbxEAkAWGOQ6rZlc/+UYtLsGW3wo24H5SnRcwCDIkyq7evmOcYnkRkzd4Z7Mot49Q5/N6Im4vruvsxpajqxdOCsR7Nxtckiut+qk32Kg==",
              jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"u5vPT6lEwGjoybfS2Soe9LhkpeXUq0jfmSoUXvjCqFgclo2QLRs4SK4pfluZl6HFFt-Yp_OiM7hDXAeAgz7Aze5yRjYPu63uIo4drSQmSiUe8rg9LNIQd83n-XJw0X_UNa2SGWGeFA-nuMAp4EpLCzc9T5_y3sBJHhGfV_aYg0O9hRgJyqRm5dMu3GmQpn0CY7keConQkcPW4osAIeoAIgRnJZKObDyIt5dRGQ5i8hitBVlMcV9jBeFf9_8LruA26g1mKvp9fQrhzt-1zhC3se46nqDhC2aF7gaos0pYVidqQvjQcsfvIcbPBNJvE3kIPsxc8YP22zPxQT95wS5JUQ"},
              jwkPrvKey: {"alg":"RS256","d":"XUgpmkhlwO3o4XOfSQ9iePe-Q6a1Sb1gQD3mBxrVXvMAs_MLfwILyEegpg1Rn012O9tNgiTnv6OdCoNIaPmo0DwBYdu7kuv2fgP_yXkx-KfgbXsiH8kLGyascyFt6x0OHOqCvFAHU549HOWfbMBD8_2xZIf5MLyXHnZQrmIUjx8jgOG96lATc6MOSdAHKLuwuxQcJVF-pdzVyRXoDU5PG7W8-1TrNiWXajekuuziUsjNwCJ-SYkmo46D-Wx3_pTsrCIOIOYbGHezqx7voDPjceX-wiPGJZr1UBFRqunqWWUfdC-ZdoxMrk7I__GvifkhM7LWMb_sGLqvnaj1w_YpYQ","dp":"AbYZskHlT2Qwl-tdSRcnqPe9pIV0gP6i9KAJ6YOtQSLag-IhP98XWgIusDDWRAdNgrtpWJDX9Qv-EwFoCWNCRf9bAxeyXEiZGxPo7m8a5mJHlOgnXPdZJyAQA9GUBQMMuBwpAdZTjgx-2e42QCyms8GB9-HiweCO9ooa2i1jFHk","dq":"YkdpfziprjkI-K6ykD9-nhkqrppQG2beLgPLFVgaL-MuBQm2I6e9uX0IO1g2tCK7dEkz5IWB9AosaiI1J8rEr0pEZsqlhcu3um4GPrR3kGiEGQCR0BhNLEiTiI9Ci0SNmAozpM-MQAS2OkX2h2srpWrsX3ggtixNLDyqgrh6CDk","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"u5vPT6lEwGjoybfS2Soe9LhkpeXUq0jfmSoUXvjCqFgclo2QLRs4SK4pfluZl6HFFt-Yp_OiM7hDXAeAgz7Aze5yRjYPu63uIo4drSQmSiUe8rg9LNIQd83n-XJw0X_UNa2SGWGeFA-nuMAp4EpLCzc9T5_y3sBJHhGfV_aYg0O9hRgJyqRm5dMu3GmQpn0CY7keConQkcPW4osAIeoAIgRnJZKObDyIt5dRGQ5i8hitBVlMcV9jBeFf9_8LruA26g1mKvp9fQrhzt-1zhC3se46nqDhC2aF7gaos0pYVidqQvjQcsfvIcbPBNJvE3kIPsxc8YP22zPxQT95wS5JUQ","p":"32rKIG3uTD0v_fBLtMAgszNOquLx81KWklsMAtmilPaklTzAw_-akZxnM8YY62GtZ3tzPUq4jLktYqrbsBZD9Jd2igz64-5ZlnI8WcWGXm8nXK2GLkJbA633x7JnUBlcYlxcz7lQw9mzuSXUVyc0OTj5kcYw1dWXghMRe4hKYfU","q":"1vge0M2uwK1Ews3OIJaBEIXGIxLfHqFuAUgJX8XlTtcOPIZF3mLif73ZR_ZysyHHs-TvAwleUthgRzZaEo6oROQgVxLrYNDdyluQn-bDSu7UoDEIiGH-xk7Giq2tjavmEKRryN2_O0meWUVeSbvGhRsQ67hvibkuMb4hhaOXxG0","qi":"J6FEXRDpXoa-6xWDHHNHQQF7nR2mCXKOD2CP3PXAm58EWl6HSSW1bBAh4iIrsSRIMbHUG8RAJAFhjkOq2ZXP_lGLS7Blt8KNuB-Up0XMAgyJMqu3r5jnGJ5EZM3eGezKLePUOfzeiJuL67r7MaWo6sXTgrEezcbXJIrrfqpN9io"} },
            { modLen: 3072,
              spkiPubKey: "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAvD1cuexe9e6Z40nYbRigAee0t2GPAWAknsDjPKPKtcflTLkFkSPr3bIj9Tgvgk8ZhdcQ5KGpi8x2ndIQ9ZwznPAOYp066KhxcQYZdASKI1FeYn32hegXLqSUE/ScnSVS62Za9PR8aB7J8HDMEGO6XNmjSzc7oCatHgM+EmX2Ko8lVsOSAeGCsR//RwQ8Wposmzj0LBM3TSalZnng0wIjnT5AlRM12Iv2ujN0pC9fPEcUMTAJ3tGViH1nu6pU7pGh+k3nyfq9sUfXOUrFcnDwISFH4+6XQbBIVbzsjbYUQCaTohKpBQQ/6HFivZtldiNRza0ikC0pC/8ErUSrD/fZdTnSjKmG5JQIx7dsYUOt1COpW9RZ3pLhRRr3xHWrXsLLQJiDVUSj5zzBXCNfm3amfsUSOZLjp4t2ywa14Nr1iHfnjLkFx9StLZsctCuD8a5rDXUcrnW8ssbR6PSE3tFovciPA3w1G7EFg5/mHVLc5Uckwqz+ORIDO6FDDemi3OExAgMBAAE=",
              pkcsPrvKey: "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",
              jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"vD1cuexe9e6Z40nYbRigAee0t2GPAWAknsDjPKPKtcflTLkFkSPr3bIj9Tgvgk8ZhdcQ5KGpi8x2ndIQ9ZwznPAOYp066KhxcQYZdASKI1FeYn32hegXLqSUE_ScnSVS62Za9PR8aB7J8HDMEGO6XNmjSzc7oCatHgM-EmX2Ko8lVsOSAeGCsR__RwQ8Wposmzj0LBM3TSalZnng0wIjnT5AlRM12Iv2ujN0pC9fPEcUMTAJ3tGViH1nu6pU7pGh-k3nyfq9sUfXOUrFcnDwISFH4-6XQbBIVbzsjbYUQCaTohKpBQQ_6HFivZtldiNRza0ikC0pC_8ErUSrD_fZdTnSjKmG5JQIx7dsYUOt1COpW9RZ3pLhRRr3xHWrXsLLQJiDVUSj5zzBXCNfm3amfsUSOZLjp4t2ywa14Nr1iHfnjLkFx9StLZsctCuD8a5rDXUcrnW8ssbR6PSE3tFovciPA3w1G7EFg5_mHVLc5Uckwqz-ORIDO6FDDemi3OEx"},
              jwkPrvKey: {"alg":"RS256","d":"FMN7__Inw17vUJfrrJUDyVICqBu1x4QQZgaGykCS8pw7Gcxq5cidktW8i6cH7orFGPNRJLcEWaxTBTOPtVfmhZAhNhV70wAJi1sN4bNCfYTTMXANilXAgN-cidr4j4j3bYnbzJtPQbjrs37ts30cqHNFRN2x0QeTHvVimmruzWD-0GRALb7vSJRr9yxrb98Dvpd4r4frGLKDmhslhoD85rJgM1FsJhfCPmXAnv-utJpuisJuxEpAAU876wJt3eboU2SmcKW91nS4Ixt6Yi8eIlqIHRZ2_GeD2GqTqiu9JWxWJF6fLtlrveJMhrEKKwHCpZhhog1iLBakraKWwz9tk5KY_d9VfGQJiW5WlrSf8BONkYRl324cEQiV8w2euLOqZ_S3PHaUAgT4OMMYZOox5YTfsm7VATSWJrWKpAiKY39NymEzj4eUYWyO3YooJzO_4442c84kXLryAZe7JuCzDcg_lP4ao6UAdq3nzZDk1HsRBud_kq6gS3062PTtsUpB","dp":"4o-mKSV8iPYnlQSHSdIUlobvOvqwvytQUeuE4fXbMflAur1JO98CSo9w19Tv2TRzezdHiSoSFkmDirS6MNpzNdVCLc4ukW4z3bjl3rS8bcgVcqsKhHJyo9EdMzf9wi-_Om-sMP23Uk_j183_Omie48bUXiovkI2AYcamCfTzABa62aMpAedU8dkud6nteizQF3bT2PUUx7xyaxTBg8w0cuypensHh6H9Lxs7dZ1Ulg07n7d9wMIZu8zNVQMsndgB","dq":"SU_UljbaaWpTdDyCOnXzWExGBhcxp63wmYLH3qhyn44ROf1XM6fQdTZiIe4mDMiIZhWdCOU3I6KJAPIPhXNrKnC59Q1b4sg3Lul7LiJ6HYjGgcVDB7WfS6ybHCu9yDj5PR_YqdWNp63UqWkLJusfnnIKdjo7RHmf_vbegvSYhtOTLJ4a4UrJ22AcCV1qOuhISfIBICAFdQhEDMBE6FxrwprIuXueO1yYVs5jg7ok0pg2cXGYbrdL3vvPoEFLOMEh","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"vD1cuexe9e6Z40nYbRigAee0t2GPAWAknsDjPKPKtcflTLkFkSPr3bIj9Tgvgk8ZhdcQ5KGpi8x2ndIQ9ZwznPAOYp066KhxcQYZdASKI1FeYn32hegXLqSUE_ScnSVS62Za9PR8aB7J8HDMEGO6XNmjSzc7oCatHgM-EmX2Ko8lVsOSAeGCsR__RwQ8Wposmzj0LBM3TSalZnng0wIjnT5AlRM12Iv2ujN0pC9fPEcUMTAJ3tGViH1nu6pU7pGh-k3nyfq9sUfXOUrFcnDwISFH4-6XQbBIVbzsjbYUQCaTohKpBQQ_6HFivZtldiNRza0ikC0pC_8ErUSrD_fZdTnSjKmG5JQIx7dsYUOt1COpW9RZ3pLhRRr3xHWrXsLLQJiDVUSj5zzBXCNfm3amfsUSOZLjp4t2ywa14Nr1iHfnjLkFx9StLZsctCuD8a5rDXUcrnW8ssbR6PSE3tFovciPA3w1G7EFg5_mHVLc5Uckwqz-ORIDO6FDDemi3OEx","p":"8q4YVoredClxDQnCM8nEdFUtzH5O-FoKKgZBIKW-0-bF10nssOefxbKXdh3BiC9zWIwPzQ-lOSc0TVtVlHAVfaAZuE2CAbohhc-L4ZWJP8BIAvKZXshDkwc8AFtAPlDgT3W31d2f7uRgkVi7e51LTHnO4gCXz4TkFKYOzCnC5lVmw1bFx0xp4SFXGYqZUpZE1oXN_aCX0b7nh4cmILoTi2Kpq4iT07jKP0x-_9YANwlyQ21g56GVae9vifodmB6p","q":"xpJS7bYdNFEN0uKnv-2GWc0cwtEQMnFBCqiJeVZ5tyFmSmKe4jzms-_TkPPaiNnsbtwv5ELeHB5vgq1vw8QUdfKWo7DI8RqkBvKbOsJXRCAJl2wYrvZMRrepFK7Oe-chdLDLPlHtmndkKndPGP5VgU7wN5MqhNruhxOnD3rlE-RX3EtpKVKvspLDXppXL0yXs8MBa0vFeywm_Qp4iXkKGrtDdmr8DahD6z_NaArstZxNdwysgP3edqozVgxk_-tJ","qi":"f9msAV-bzDoCHRnFxYJr9k0T6BN6mUi_UhOwYDXr1GEsUjZDra1Pmc6Wp_XmhhzgrQuO9YyAe3pwGopsUnDdQmZQ86W5AsBb_Bqvo2V_DPxB47O9rza8BEBlRhEZuBFNiYJAExS-_AarnEco_d4Tbyhd0ToNggNecmkzdYmC_2ehZ73ryh47pwMdYEGWt8oFNsGBvCrFkV8V2_grtpeqN_ab7KDSPQv-7hBst_ti6uibpTJJ11QvCkj7gV2RvFrx"} },
            { modLen: 4096,
              spkiPubKey: "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvyXd6hoWnoxJTmB8ttwr3vGgVgLASpEXQVPxf4xBnM8qMptsbXup6+35DI+1HVsz88c7oUoGs9CZCsQb7M01aRM0DbCYqK8dvJyztbBX1vv5Anhxh7rw/ogqCNyI372o5qkv1tXuBcn/PKKKbJvWWwOZjYvjX4IUNtag9bWpyS3l64mp8IZDrqZFf0yPfDxr00SJ27TBtKUzzkk5m0xqCsGb7+cUB/VW35mCb1TwsHRZViSsePa2YqRtOLR/o7BCtt1bleKkuKb9MCmAQhfoLvFON0/cvxR3M46BogjSvWWZBCXMZmQWwATxt+gY2PHC9L8P0RJdjsnDOzRAkQWTjQ+klyYbp8BmJV2CUynURf48CoKcWcSuUxoxWKf9h+G2dtcm7AEiZFnMshjPMGReLyWa0OpyWPtnZbMluRDndRJ7RKZmFwzx9Ke63G9SYVvte7iV9wPaVefRFWXzrOyQDmDm6DblHbuRXT+pqdbd9UXdTxJCXR9aQl9K08fwQF3zFFRtUsfO/RDikAc9s4McxovPjHfkzQbAuy0o9/KGh5h1I+buW/NhUrxebLBltvnDMe2+NwaRb+Vlr8p5ifAmnJ2+Cjrr9uRuw9eiYkJMYVE8oYl8qbe3ZefnJG5zvRTqBhRTLOVenBMpB7p8G5oI/2Fo8alRbJUg+Q7fi/NHHeUCAwEAAQ==",
              pkcsPrvKey: "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",
              jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"vyXd6hoWnoxJTmB8ttwr3vGgVgLASpEXQVPxf4xBnM8qMptsbXup6-35DI-1HVsz88c7oUoGs9CZCsQb7M01aRM0DbCYqK8dvJyztbBX1vv5Anhxh7rw_ogqCNyI372o5qkv1tXuBcn_PKKKbJvWWwOZjYvjX4IUNtag9bWpyS3l64mp8IZDrqZFf0yPfDxr00SJ27TBtKUzzkk5m0xqCsGb7-cUB_VW35mCb1TwsHRZViSsePa2YqRtOLR_o7BCtt1bleKkuKb9MCmAQhfoLvFON0_cvxR3M46BogjSvWWZBCXMZmQWwATxt-gY2PHC9L8P0RJdjsnDOzRAkQWTjQ-klyYbp8BmJV2CUynURf48CoKcWcSuUxoxWKf9h-G2dtcm7AEiZFnMshjPMGReLyWa0OpyWPtnZbMluRDndRJ7RKZmFwzx9Ke63G9SYVvte7iV9wPaVefRFWXzrOyQDmDm6DblHbuRXT-pqdbd9UXdTxJCXR9aQl9K08fwQF3zFFRtUsfO_RDikAc9s4McxovPjHfkzQbAuy0o9_KGh5h1I-buW_NhUrxebLBltvnDMe2-NwaRb-Vlr8p5ifAmnJ2-Cjrr9uRuw9eiYkJMYVE8oYl8qbe3ZefnJG5zvRTqBhRTLOVenBMpB7p8G5oI_2Fo8alRbJUg-Q7fi_NHHeU"},
              jwkPrvKey: {"alg":"RS256","d":"q7ed61_ycA6BEHsXrsKOWuNgccRY8OP1K0f5DOd4TiHBu-LqflR46y1G7iTvxOaY_mg-RoAVE1bTFdvlZk9XqwSIX8AE9I0Uvstbml5IGycTpUeEXjXvqAm1EW7lO3LLmCPniS14fhTgSZ2Pk1BQOkU6nfFMmxFljXo08Wd4lvW3tmhelWhYxz4x8tFZmXdCOnI5EnoJBnre1nPr33q_TNhveQ5zbU7W81qZ1eBNtYdgdkXN94FTibxDLozgmbGPzW2AiF8qMYQ6shimUznc6Mb4yDHjknkVOOjNxj387A6obxRx0o4Z7fjDGb7VC5fs1ygJUn4YNF1HGRmw41dKHAK3yVIyMx0s-V_qFbcFs07rm66ynRSogcW7i8WYKohkdMbZDkKfBVgZO7xOXrSmSX0mrcM7zxD9bLSwCn_vTfmv9wPh7OXW0ZF5Zmt644N2kDwPuVkMDYimRppEoRTJffDRUQS403Ni35uVszCF_cuAwCzWFg0kOBG0jjBPUd2tESaXg_lDUT5bkKlCKmMaKCr4FrLapSI1pzGyz58KaN5BEiFDlAHLrCBiZV1A7pK3tTMa_uw9PvSybsHJQLlWt46Gegp_W-vpUOCN7YAnHYCtnGPbTtwLFW0WpEmFLaf0NKeYwpZQ-2jjgInWTFYcjtZ2fhzKAcoe8g5Bp0xZx-U","dp":"voBis8ZPYJx3B9fTEs2sGkvH9R-Q9gk2PTOXhRq1jLonms8ukjFNtRx6eBWnzZSCoqOz_xnYyVgZRtvLQT9SkBW5vpEUlaih9AWYzH13aEViGTChxrJIPEv32mD5YMcQcXqyHsKQQTN3LCt_EgCkioAQYEUhIm-mhrwdx7zRzIgAH8KOaEpRKlYsqUUbCTAgUd_uA0Axznk_DItF389uTvke3AOB1wxkpY6y8nOWfFq62mzWTiUsKxyPPHMHs4OCslm7d7jN0ORz3btKnsffp2G_NY84SMkk_X-iqIsrWHPL0hiae1Tpgzbh8aMylxueNiCCTSUIcEnrcIgQaPy4iw","dq":"n2p9wkmFVmP41DmZgz-IAVY11FR11cAaDfHJ3x7f4qL7kmr0XqawEgChP9lADaz2cqURuU_UHUkTVs9gd1ePg-j5PVxUmPdtjYySMUy0anB_ry1teCyJnYy1b_KPRVjS7gYgCAb7Euw39BMRWssbYgKdxYx0e8--XYVlw3vrLvrfCsKjh8MkLZf7xkKU6T0UaAfhlPfSYk2-TrQaIALAC-ys14772vYYyhgGtnb4yEe-XuWZtdQz9kzBm8CYWG4ckecAqgB5sMm7vU9ik79UBJ-0aBxt4MBhG_6I3pfHSE-ffeIjiaZ6sbOY8i0UFSldotwL8aekchC9-oj797KDcw","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"vyXd6hoWnoxJTmB8ttwr3vGgVgLASpEXQVPxf4xBnM8qMptsbXup6-35DI-1HVsz88c7oUoGs9CZCsQb7M01aRM0DbCYqK8dvJyztbBX1vv5Anhxh7rw_ogqCNyI372o5qkv1tXuBcn_PKKKbJvWWwOZjYvjX4IUNtag9bWpyS3l64mp8IZDrqZFf0yPfDxr00SJ27TBtKUzzkk5m0xqCsGb7-cUB_VW35mCb1TwsHRZViSsePa2YqRtOLR_o7BCtt1bleKkuKb9MCmAQhfoLvFON0_cvxR3M46BogjSvWWZBCXMZmQWwATxt-gY2PHC9L8P0RJdjsnDOzRAkQWTjQ-klyYbp8BmJV2CUynURf48CoKcWcSuUxoxWKf9h-G2dtcm7AEiZFnMshjPMGReLyWa0OpyWPtnZbMluRDndRJ7RKZmFwzx9Ke63G9SYVvte7iV9wPaVefRFWXzrOyQDmDm6DblHbuRXT-pqdbd9UXdTxJCXR9aQl9K08fwQF3zFFRtUsfO_RDikAc9s4McxovPjHfkzQbAuy0o9_KGh5h1I-buW_NhUrxebLBltvnDMe2-NwaRb-Vlr8p5ifAmnJ2-Cjrr9uRuw9eiYkJMYVE8oYl8qbe3ZefnJG5zvRTqBhRTLOVenBMpB7p8G5oI_2Fo8alRbJUg-Q7fi_NHHeU","p":"318TiQL1oU8C089Mbq3LZFQMJpl9yvZZz2BD05UcWnKyyYNhLxjwSYykRCKk2wHf0NW5KE834QrC_ecQ5qtvbbEqR-5RDeNakSAiO4_XD6dy0GIaS9tx_VXUJEwRByktRLZmNXQuUE6-gZ9FtBY3Y4aHSneFitVbvPoBxGx76MJeFb_zl3JslKtsIYRFvTnutIrs7dAkV5r33Czg5qVA4U47uLmUPXU6cowcKgoST7EIuKvjaj55n5ct-dO_OsYaWDUCmocA1jdcCiCj1Ver1MmvtM34UIH-X1Ww-XHpxB1jP1dcRHY1ivpsDH_9VfKyL6fOVxDwr3M0OtgIeA-UYw","q":"2xHNBRyafMR7ZeljmFHH-YGJ7kma-jqrg9nCF3YwseLBwZBEKMp4TFBMsu-W_5IWd8bHwH7XE2lLZDIL2y0qJrSBvmFwDQiLCJg7YP9I19DGI0XjVVVXytPSe9vQ9I_A6Q7U7yqW4U7Xx6zDL7p3HpSzOVXsiZdIvz7yBXk6A_53A83a0DwZO6d66OzkJ-IkUzmtBxk4YS5SorwxIKWWxYKOecvlaD0g0J88xcMXhgBeVrZ1Mw2z_k6_Fr6tvhsy99rIN4gUZ55fJWS01Cuxf-5xGbYYR6mmwWczykKapjzWrkLb_FbVM-oXfRlKHaC2qOTAZO-BSLblG721ko_jFw","qi":"z4w_NI50rTfYplYwwyhmMhN2vYijJINzAOeBeoYarCxMzwE2ZUWv_ZocucyEQ5t1k5mIavHZWPAkPxFJunbFXArb0G4nv09fY9cRwoLeClbFCinWBPF-G_Sd-0xdgjYSXIbHuFBdrk5fy9Fhp3b4_fs-YjIg4Bt5mP_8EXKbOA-2-tWAEJD97sR-0TpLSz89Fyu1Q0iU_RyJHqQHWhQGsy8TNoU1oMuWCULMXj08BCxD9H-O0mJbvhnbjhzaM8eJFd9vlacAJoWe0pp7AErl5NXnnqhKlZoa-NWVextvPgGPHOUjd9fkOwc29b2lTsK2dPmZ-KF-J4XjE_9JbJRLDg"} },
        ];

        vectors.forEach( function ( v ) {
            describe( v.modLen + " bits", function () {
                var keyAlg = extend( normalizeAlg(alg), { modulusLength: v.modLen, publicExponent: x2b('10001') } );

                it( "spki publicKey", function ( done ) {
                    crypto.subtle.importKey( "spki", s2b( atob(v.spkiPubKey) ), alg, true, [ pubUse ] )
                        .then( function ( key ) {
                            expect(key).toEqual(jasmine.any(CryptoKey));
                            expect(key.type).toBe('public');
                            expect(key.extractable).toBe(true);
                            expect(key.algorithm).toEqual(keyAlg);
                            expect(key.usages).toEqual([pubUse]);
                        })
                        .catch(fail)
                        .then(done);
                });

                it( "pkcs8 privateKey", function ( done ) {
                    crypto.subtle.importKey( "pkcs8", s2b( atob(v.pkcsPrvKey) ), alg, false, [ prvUse ] )
                        .then( function ( key ) {
                            expect(key).toEqual(jasmine.any(CryptoKey));
                            expect(key.type).toBe('private');
                            expect(key.extractable).toEqual(false);
                            expect(key.algorithm).toEqual(keyAlg);
                            expect(key.usages).toEqual([prvUse]);
                        })
                        .catch(fail)
                        .then(done);
                });

                it( "jwk publicKey", function ( done ) {
                    crypto.subtle.importKey( "jwk", v.jwkPubKey, alg, true, [ pubUse ] )
                        .then( function ( key ) {
                            expect(key).toEqual(jasmine.any(CryptoKey));
                            expect(key.type).toBe('public');
                            expect(key.extractable).toBe(true);
                            expect(key.algorithm).toEqual(keyAlg);
                            expect(key.usages).toEqual([pubUse]);
                        })
                        .catch(fail)
                        .then(done);
                });

                it( "jwk privateKey", function ( done ) {
                    crypto.subtle.importKey( "jwk", v.jwkPrvKey, alg, false, [ prvUse ] )
                        .then( function ( key ) {
                            expect(key).toEqual(jasmine.any(CryptoKey));
                            expect(key.type).toBe('private');
                            expect(key.extractable).toEqual(false);
                            expect(key.algorithm).toEqual(keyAlg);
                            expect(key.usages).toEqual([prvUse]);
                        })
                        .catch(fail)
                        .then(done);
                });
            });
        });
    });

    describe( "verify", function () {
        var vectors = [
            { modLen: 1024,
              jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"ywcjjbtYC7Tdl9CN2_Qw2Y8QgEu3D_YIfPaKLEFdANWS3fBHOyvdOhNdpfSPERq04MvV3Y9PlMFALDfrI5UoOqDsnabffIzyXSzL337SvNd5HcIB4SvdK3hleqIOcbRr753N6ir__G_xE0gsqxMWWKHdGqf_9GfkBGp3se9oxhM"},
              subvectors: [
                { text: "",
                  signature: "RmzrqjjmOLmX5xTg++Ph8OzCYMmn/Yx5qMnQJ0fF5xePR/Sh9XdmSe5VD88FFvssAVfzCXX7EvRlOPLFoW2AtlXUU1OSOCb5GlVRxPb8m6EU8QLvuxk/D1H26X8zLvo6ea9liTC1zpjMh5ipMxeEacNlY9ccMyp3UNJ6wq9WjA4=" },
                { text: "Hello World!",
                  signature: "Euuzs2y3H+F0vXydDVR+a9oAsyr10osSUMEg+BFQSnb4zpZSshm/f9RaFo5RAMEad9a6fCDClDw2J+Aqk7iDLNEL1iPH6jZSlqjeT1ZaanSD8kkjrzINgIi8+0In0YpaNMuj0MSlPH1xPlnRCn0sRfKORY8vYOmLQxbJ4s9/HOs=" },
              ] },
            { modLen: 2048,
              jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"u5vPT6lEwGjoybfS2Soe9LhkpeXUq0jfmSoUXvjCqFgclo2QLRs4SK4pfluZl6HFFt-Yp_OiM7hDXAeAgz7Aze5yRjYPu63uIo4drSQmSiUe8rg9LNIQd83n-XJw0X_UNa2SGWGeFA-nuMAp4EpLCzc9T5_y3sBJHhGfV_aYg0O9hRgJyqRm5dMu3GmQpn0CY7keConQkcPW4osAIeoAIgRnJZKObDyIt5dRGQ5i8hitBVlMcV9jBeFf9_8LruA26g1mKvp9fQrhzt-1zhC3se46nqDhC2aF7gaos0pYVidqQvjQcsfvIcbPBNJvE3kIPsxc8YP22zPxQT95wS5JUQ"},
              subvectors: [
                { text: "",
                  signature: "ag7NR/gIX87W3Gwlk6qSqwQfn77Wj5s9E0/np1zgi1GnXBMZOFmDagZh0naMLiICW9T0UnjNoMe1DAXNzQ1R2RzlWXmd6Fc3WbT8WNMnX1ZyjUfHbn3JzQrigwMTWnaow/0BxC9jzZyarGyDwb50cn6vG37LdWOTo752xEDXgh3jTcIXWMISV49FaHRi9JAORT4LY8s8jMIdQ8f4JZ2OGIh8cJmC0SWCBuOrgzAzHI7/XqPTnZSyCs75/s2Stg1CQsWqjfij5EaqQxw6zSTcCA+Msxwks50v0pawXGrfIANf+hOfl/Bee42of5uoDOn7N+3FYfkHGt/d5U5K1nHO3g==" },
                { text: "Hello World!",
                  signature: "iKVj6wC50oE6TBdpD6ry99v0eraUGfg2YVdsoBsfse9XSq9zkt5yMzXgmTvVp8jN3eyUO8HyTaB95M2JLJEXR+cD3wr2vKl2qdbKBcZCd2fPUr6HIiN5nSEC9WEVD6E+lzWrC7EZl34qXyQm1pzaNkMjQ9oO9j6A1wCzH3sB2HUNRX8M0p2DAG6uN880/ttcLgu7z//3U+2XvPR1+S45RQOR/F3/ar0mqncHl0DVBE4+o4kgQ9uIepJNoVgRKo7BY+ZQN7dnD/V7+7RcfeU9owAPMa6R+RJlH6CUUnSB2XSv9vDpyJZnFFmJZuYfVMHWwakSrXPxyjHjxyNninpWSA==" },
              ] },
            { modLen: 3072,
              jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"vD1cuexe9e6Z40nYbRigAee0t2GPAWAknsDjPKPKtcflTLkFkSPr3bIj9Tgvgk8ZhdcQ5KGpi8x2ndIQ9ZwznPAOYp066KhxcQYZdASKI1FeYn32hegXLqSUE_ScnSVS62Za9PR8aB7J8HDMEGO6XNmjSzc7oCatHgM-EmX2Ko8lVsOSAeGCsR__RwQ8Wposmzj0LBM3TSalZnng0wIjnT5AlRM12Iv2ujN0pC9fPEcUMTAJ3tGViH1nu6pU7pGh-k3nyfq9sUfXOUrFcnDwISFH4-6XQbBIVbzsjbYUQCaTohKpBQQ_6HFivZtldiNRza0ikC0pC_8ErUSrD_fZdTnSjKmG5JQIx7dsYUOt1COpW9RZ3pLhRRr3xHWrXsLLQJiDVUSj5zzBXCNfm3amfsUSOZLjp4t2ywa14Nr1iHfnjLkFx9StLZsctCuD8a5rDXUcrnW8ssbR6PSE3tFovciPA3w1G7EFg5_mHVLc5Uckwqz-ORIDO6FDDemi3OEx"},
              subvectors: [
                { text: "",
                  signature: "MJe2Erja9UA7TphOVDHaWeSeLhmrbOZmeLJqez4yhPHHvOFzHGzArgdXSaLQjjtzQdklPGQlSNWQXqJePwMfIwEbEnRAD96yMsjx/V45A4KsYLclbnGsxCfAWSNtUIIs6PKMollcX5FSjebTJB/IWTg6QIrTaCRUZFjtXaiGhjuieCWGG7Toz/T3x+QIj1pM5Ob8vhyQNBGMVGaimn3gbvIfSd0I7W552Cz1wnNQNgEWqk04r27g+Ub8zkO0CTCK1md3k15i9q08yrBfGoJNO4zjjEiPHs/S1Jb6srE7L0CbVw21zih/vjQ1NAd5B83RKy+H+8O7rJjuXkHJOBE4/J6oYRkO9XKU1kwpOFEHabSoauKgBWW1LmaXdc5EbD5bWmcZzbSKNth6JCPg8LVUMeVvFxlshKAbSMY7ymEsFRMu7fDmFvKU7EgKeFY+q5/pB5UuVFbOnaNFZmCJ7aWcLzP3+GmRcLNH6DHlRQmrZQAfSq+UDT7zgYBCpAjxcBDF" },
                { text: "Hello World!",
                  signature: "DZ4YtxC0EQWbqbA+BsBy90qPPWuxHu4TlfCZYU2q3swruQ8JM6oX1esYqe3974Cre2oZuFtH9MFPj2NCiC3UM8PFbNjQHWe0efMnKGXyKw+S78vem294W/QBxf8Nw9ngeTqZFVmcpzxMLTfB74hxZC1klU8A0Fxi8PV42WQj/Gswtw3UcoIxcUxsk/K1gC51bUHaYoXgn2+acimGF5ipi8KhYlbumMWb34idlr5aYxObf9nb36i3+a6V16H4f8iTvcviqRkkYQTTdBTNso3stWFVhE/dzFB7A6N/bXXUpLuMGxO3BynhJPZdXEz63L/HYJFF8X9J8NnwN6OCPzUZl5UCokvEXfpTZpxpd4xYs1uft7ftJ8XXiOoGs0RwTQ1IDgxqATDfejH7totmJINxLXGHT8G2kUhOwqIM5oEsyelnBEHG8s1bHJGe66bLfutogIllMb9TVdYxj+Y/RmGaW5xqeFw1Y1rzMBqQmrdjX0H/Lcy5yrrK5+sVPXq4s6tR" },
              ] },
            { modLen: 4096,
              jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"vyXd6hoWnoxJTmB8ttwr3vGgVgLASpEXQVPxf4xBnM8qMptsbXup6-35DI-1HVsz88c7oUoGs9CZCsQb7M01aRM0DbCYqK8dvJyztbBX1vv5Anhxh7rw_ogqCNyI372o5qkv1tXuBcn_PKKKbJvWWwOZjYvjX4IUNtag9bWpyS3l64mp8IZDrqZFf0yPfDxr00SJ27TBtKUzzkk5m0xqCsGb7-cUB_VW35mCb1TwsHRZViSsePa2YqRtOLR_o7BCtt1bleKkuKb9MCmAQhfoLvFON0_cvxR3M46BogjSvWWZBCXMZmQWwATxt-gY2PHC9L8P0RJdjsnDOzRAkQWTjQ-klyYbp8BmJV2CUynURf48CoKcWcSuUxoxWKf9h-G2dtcm7AEiZFnMshjPMGReLyWa0OpyWPtnZbMluRDndRJ7RKZmFwzx9Ke63G9SYVvte7iV9wPaVefRFWXzrOyQDmDm6DblHbuRXT-pqdbd9UXdTxJCXR9aQl9K08fwQF3zFFRtUsfO_RDikAc9s4McxovPjHfkzQbAuy0o9_KGh5h1I-buW_NhUrxebLBltvnDMe2-NwaRb-Vlr8p5ifAmnJ2-Cjrr9uRuw9eiYkJMYVE8oYl8qbe3ZefnJG5zvRTqBhRTLOVenBMpB7p8G5oI_2Fo8alRbJUg-Q7fi_NHHeU"},
              subvectors: [
                { text: "",
                  signature: "dOeehWjJmyT4Xedh6lwUCv/+ouzvsUC4BeZr7G4fd0Xhspgf8Ua+d8SN+gn8q1ujuKn+2030ffn23B+DVnarAP3443avvvL4xK6cXYZUVufalQ7XkTNnR+g1tlSdlqyi7e85BXBv11oZahm2ivWN6N0INGsV3LZ0nb2HxbXBz2xyqBIZ8kSPeQhLQrD2H5Xl84YTGFFUqd8J3Mvufd3ky2cAG3lI1tgRZt81meJcKke78IH1HRDJdJiHXL7nE+8aHHj4Ddc/0OUfjJaIS539dH//ZDpHhKsTGeSskLDCZ5uu0NHEmkGxzKJKP6tuDV1ucJq+gVCF3LMZ19m9TXmLbvmL26e49OkRP5cQ1Hhm+7WJ+DkRVJKCSqYT42Szutbtw4ww3AlEZZA0MmX90PnjdeJQ6QgARZW8vo/hLGlUoQBZjRAGOjR+S4BOrHolz1ibnUW03Y9Z054X1zG++rgKoKDZC4TGQe7Kzju5kLRpPyOejzKb9sFcY0C2ksA5QvPgBwNITP5RJAIWKaajpuSOh8WTkstQtBKJ/mtMr4kfz6D8S91JK0vip9MNmQRo2pKK+pBzwjUcnISZvOBhxSuQt5FuMrDp7Rm9oTgm8+rMoVoCxMH4RxvBTV4+ioAHGFThz83rB1se2KmiPO3fEeIaU8Me3KBiDEW1E/TDiTOD4/s=" },
                { text: "Hello World!",
                  signature: "QURUcPaJ4AXQrL56fGbX7KHS7IOvE0xnX1dOwcTvXEDxO8oTA9U9kF5TUKNDDMgNnXRXMdb3/qufsKiPfKGcJTlEsqs6/mAYWDBrVZoRLf87j5b5ONm6UFhhJ84dapLvPgpNjqvm9NPiq1gJMhXRELZtmScpC6tvX+xnUyVIeVlj2VjawCd40SEn84db7ud1ckSOE/WHBAI/bHXAu2EHbo3iCfSeNdnuKoctkYhDfPzC/OnZvwM9HX1wli1oobrXdSrpaYf53tiV8W2V1pD16mJ2SdxxmexRXSYYhFeIkU4JhVV/0ROp+swbFVUFUsMHGijdSxv+JhMF8xrHRwx2HhaEWnzRkKubxSdxKutrNMERzQXxNLPola3RR0/bob18k+4LTHf4ZpjkHVwi0jAtg1AvkAILjJ7H7Ucm0nA6Slpikmi24pdbmH66a/IS4XTA/1K875xBCOtZJ/cLtr+yN37CGMpvdpnZYB6xkPgDUjRIjLB8RuhTa+yeCdZBV2eu7wEyz2B5v1KnCpBE951wfyLxFeaSXDn+zcFk+gRF2oK35g0FfHCRN25188SVeTDLSrMsEUuxgnolTeMyrFmaDVlZbI8l7QNYiE4w6I3NBnz7MOUFHF/6VjkgrUCEVFPMeS0pvFMxUX5tlVfYFZWMs5npFVnQK1wEYIWwP/OB6Vs=" },
              ] },
        ];

        vectors.forEach( function ( v ) {
            describe( v.modLen + " bits", function ( done ) {
                v.subvectors.forEach( function ( sv ) {
                    it( "'" + sv.text + "' to match '" + sv.signature + "'", function ( done ) {
                        crypto.subtle.importKey( "jwk", v.jwkPubKey, alg, true, [ pubUse ] )
                            .then( function ( key ) {
                                return crypto.subtle.verify( alg, key, s2b( atob(sv.signature) ), s2b(sv.text) );
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
    });
});

/*

var vectors = [
    { modLen: 1024,
      spkiPubKey: "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLByONu1gLtN2X0I3b9DDZjxCAS7cP9gh89oosQV0A1ZLd8Ec7K906E12l9I8RGrTgy9Xdj0+UwUAsN+sjlSg6oOydpt98jPJdLMvfftK813kdwgHhK90reGV6og5xtGvvnc3qKv/8b/ETSCyrExZYod0ap//0Z+QEanex72jGEwIDAQAB",
      pkcsPrvKey: "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAMsHI427WAu03ZfQjdv0MNmPEIBLtw/2CHz2iixBXQDVkt3wRzsr3ToTXaX0jxEatODL1d2PT5TBQCw36yOVKDqg7J2m33yM8l0sy99+0rzXeR3CAeEr3St4ZXqiDnG0a++dzeoq//xv8RNILKsTFlih3Rqn//Rn5ARqd7HvaMYTAgMBAAECgYEAwlEJ2Uw2n7Wy5Oup6pwT6RZBf9l302Hyi8/XPTYuEm9XSu3+7wYzjbMdTYn9KCy8c+8DuTPBwikYB3pZpkvLHGRPLGDBHdzW6tGrCZDihfR/o0QJoa/V3fU+llH3xJwqek7Yem3IXVefHYRf+vMy5TVU/9etb9s2uNePeePPvKkCQQD2fhOOJ61bmTrzztVmveaaChsDfRg8P5yP8YJc68ET42NLbh1taSIy4A0tRMUVGRUCkpIgbNsHna0xGjc8qkAvAkEA0tviDZgsMIp9hez9o2NnFu2cGLliy5h9dsxyN54r75aEOis6MjODUam5s3aND0plJjTBN1fXJ3oYdej48r2bXQJBANQSGr8GcgdJ6UeUX1Qa9Ej5gs5YlT5YuFm7vp41k5OJ4ocmQRk+B9dfntagwTNqtgHVmvVc0oFV7ok9deKy068CQGuMUYFjk25yxNFRbpEuuz8blJmbvQNhVOUKJFuv5nL+j5TnxXgjhCBb9GbP2eTpqivRjpd+yzPMd7t0R73v7dUCQQC6JjHf49JKmINQe0H9Nx7toeDyvJAfLKPrm1hwWspWJIzyINQXeZWwrXMQ79O4Rbl0CYwh8AoRN81KPVr4JUGL",
      jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"ywcjjbtYC7Tdl9CN2_Qw2Y8QgEu3D_YIfPaKLEFdANWS3fBHOyvdOhNdpfSPERq04MvV3Y9PlMFALDfrI5UoOqDsnabffIzyXSzL337SvNd5HcIB4SvdK3hleqIOcbRr753N6ir__G_xE0gsqxMWWKHdGqf_9GfkBGp3se9oxhM"},
      jwkPrvKey: {"alg":"RS256","d":"wlEJ2Uw2n7Wy5Oup6pwT6RZBf9l302Hyi8_XPTYuEm9XSu3-7wYzjbMdTYn9KCy8c-8DuTPBwikYB3pZpkvLHGRPLGDBHdzW6tGrCZDihfR_o0QJoa_V3fU-llH3xJwqek7Yem3IXVefHYRf-vMy5TVU_9etb9s2uNePeePPvKk","dp":"1BIavwZyB0npR5RfVBr0SPmCzliVPli4Wbu-njWTk4nihyZBGT4H11-e1qDBM2q2AdWa9VzSgVXuiT114rLTrw","dq":"a4xRgWOTbnLE0VFukS67PxuUmZu9A2FU5QokW6_mcv6PlOfFeCOEIFv0Zs_Z5OmqK9GOl37LM8x3u3RHve_t1Q","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"ywcjjbtYC7Tdl9CN2_Qw2Y8QgEu3D_YIfPaKLEFdANWS3fBHOyvdOhNdpfSPERq04MvV3Y9PlMFALDfrI5UoOqDsnabffIzyXSzL337SvNd5HcIB4SvdK3hleqIOcbRr753N6ir__G_xE0gsqxMWWKHdGqf_9GfkBGp3se9oxhM","p":"9n4TjietW5k6887VZr3mmgobA30YPD-cj_GCXOvBE-NjS24dbWkiMuANLUTFFRkVApKSIGzbB52tMRo3PKpALw","q":"0tviDZgsMIp9hez9o2NnFu2cGLliy5h9dsxyN54r75aEOis6MjODUam5s3aND0plJjTBN1fXJ3oYdej48r2bXQ","qi":"uiYx3-PSSpiDUHtB_Tce7aHg8ryQHyyj65tYcFrKViSM8iDUF3mVsK1zEO_TuEW5dAmMIfAKETfNSj1a-CVBiw"},
      subvectors: [
        { text: "",
          signature: "RmzrqjjmOLmX5xTg++Ph8OzCYMmn/Yx5qMnQJ0fF5xePR/Sh9XdmSe5VD88FFvssAVfzCXX7EvRlOPLFoW2AtlXUU1OSOCb5GlVRxPb8m6EU8QLvuxk/D1H26X8zLvo6ea9liTC1zpjMh5ipMxeEacNlY9ccMyp3UNJ6wq9WjA4=" },
        { text: "Hello World!",
          signature: "Euuzs2y3H+F0vXydDVR+a9oAsyr10osSUMEg+BFQSnb4zpZSshm/f9RaFo5RAMEad9a6fCDClDw2J+Aqk7iDLNEL1iPH6jZSlqjeT1ZaanSD8kkjrzINgIi8+0In0YpaNMuj0MSlPH1xPlnRCn0sRfKORY8vYOmLQxbJ4s9/HOs=" },
      ] },
    { modLen: 2048,
      spkiPubKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu5vPT6lEwGjoybfS2Soe9LhkpeXUq0jfmSoUXvjCqFgclo2QLRs4SK4pfluZl6HFFt+Yp/OiM7hDXAeAgz7Aze5yRjYPu63uIo4drSQmSiUe8rg9LNIQd83n+XJw0X/UNa2SGWGeFA+nuMAp4EpLCzc9T5/y3sBJHhGfV/aYg0O9hRgJyqRm5dMu3GmQpn0CY7keConQkcPW4osAIeoAIgRnJZKObDyIt5dRGQ5i8hitBVlMcV9jBeFf9/8LruA26g1mKvp9fQrhzt+1zhC3se46nqDhC2aF7gaos0pYVidqQvjQcsfvIcbPBNJvE3kIPsxc8YP22zPxQT95wS5JUQIDAQAB",
      pkcsPrvKey: "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC7m89PqUTAaOjJt9LZKh70uGSl5dSrSN+ZKhRe+MKoWByWjZAtGzhIril+W5mXocUW35in86IzuENcB4CDPsDN7nJGNg+7re4ijh2tJCZKJR7yuD0s0hB3zef5cnDRf9Q1rZIZYZ4UD6e4wCngSksLNz1Pn/LewEkeEZ9X9piDQ72FGAnKpGbl0y7caZCmfQJjuR4KidCRw9biiwAh6gAiBGclko5sPIi3l1EZDmLyGK0FWUxxX2MF4V/3/wuu4DbqDWYq+n19CuHO37XOELex7jqeoOELZoXuBqizSlhWJ2pC+NByx+8hxs8E0m8TeQg+zFzxg/bbM/FBP3nBLklRAgMBAAECggEAXUgpmkhlwO3o4XOfSQ9iePe+Q6a1Sb1gQD3mBxrVXvMAs/MLfwILyEegpg1Rn012O9tNgiTnv6OdCoNIaPmo0DwBYdu7kuv2fgP/yXkx+KfgbXsiH8kLGyascyFt6x0OHOqCvFAHU549HOWfbMBD8/2xZIf5MLyXHnZQrmIUjx8jgOG96lATc6MOSdAHKLuwuxQcJVF+pdzVyRXoDU5PG7W8+1TrNiWXajekuuziUsjNwCJ+SYkmo46D+Wx3/pTsrCIOIOYbGHezqx7voDPjceX+wiPGJZr1UBFRqunqWWUfdC+ZdoxMrk7I//GvifkhM7LWMb/sGLqvnaj1w/YpYQKBgQDfasogbe5MPS/98Eu0wCCzM06q4vHzUpaSWwwC2aKU9qSVPMDD/5qRnGczxhjrYa1ne3M9SriMuS1iqtuwFkP0l3aKDPrj7lmWcjxZxYZebydcrYYuQlsDrffHsmdQGVxiXFzPuVDD2bO5JdRXJzQ5OPmRxjDV1ZeCExF7iEph9QKBgQDW+B7Qza7ArUTCzc4gloEQhcYjEt8eoW4BSAlfxeVO1w48hkXeYuJ/vdlH9nKzIcez5O8DCV5S2GBHNloSjqhE5CBXEutg0N3KW5Cf5sNK7tSgMQiIYf7GTsaKra2Nq+YQpGvI3b87SZ5ZRV5Ju8aFGxDruG+JuS4xviGFo5fEbQKBgAG2GbJB5U9kMJfrXUkXJ6j3vaSFdID+ovSgCemDrUEi2oPiIT/fF1oCLrAw1kQHTYK7aViQ1/UL/hMBaAljQkX/WwMXslxImRsT6O5vGuZiR5ToJ1z3WScgEAPRlAUDDLgcKQHWU44MftnuNkAsprPBgffh4sHgjvaKGtotYxR5AoGAYkdpfziprjkI+K6ykD9+nhkqrppQG2beLgPLFVgaL+MuBQm2I6e9uX0IO1g2tCK7dEkz5IWB9AosaiI1J8rEr0pEZsqlhcu3um4GPrR3kGiEGQCR0BhNLEiTiI9Ci0SNmAozpM+MQAS2OkX2h2srpWrsX3ggtixNLDyqgrh6CDkCgYAnoURdEOlehr7rFYMcc0dBAXudHaYJco4PYI/c9cCbnwRaXodJJbVsECHiIiuxJEgxsdQbxEAkAWGOQ6rZlc/+UYtLsGW3wo24H5SnRcwCDIkyq7evmOcYnkRkzd4Z7Mot49Q5/N6Im4vruvsxpajqxdOCsR7Nxtckiut+qk32Kg==",
      jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"u5vPT6lEwGjoybfS2Soe9LhkpeXUq0jfmSoUXvjCqFgclo2QLRs4SK4pfluZl6HFFt-Yp_OiM7hDXAeAgz7Aze5yRjYPu63uIo4drSQmSiUe8rg9LNIQd83n-XJw0X_UNa2SGWGeFA-nuMAp4EpLCzc9T5_y3sBJHhGfV_aYg0O9hRgJyqRm5dMu3GmQpn0CY7keConQkcPW4osAIeoAIgRnJZKObDyIt5dRGQ5i8hitBVlMcV9jBeFf9_8LruA26g1mKvp9fQrhzt-1zhC3se46nqDhC2aF7gaos0pYVidqQvjQcsfvIcbPBNJvE3kIPsxc8YP22zPxQT95wS5JUQ"},
      jwkPrvKey: {"alg":"RS256","d":"XUgpmkhlwO3o4XOfSQ9iePe-Q6a1Sb1gQD3mBxrVXvMAs_MLfwILyEegpg1Rn012O9tNgiTnv6OdCoNIaPmo0DwBYdu7kuv2fgP_yXkx-KfgbXsiH8kLGyascyFt6x0OHOqCvFAHU549HOWfbMBD8_2xZIf5MLyXHnZQrmIUjx8jgOG96lATc6MOSdAHKLuwuxQcJVF-pdzVyRXoDU5PG7W8-1TrNiWXajekuuziUsjNwCJ-SYkmo46D-Wx3_pTsrCIOIOYbGHezqx7voDPjceX-wiPGJZr1UBFRqunqWWUfdC-ZdoxMrk7I__GvifkhM7LWMb_sGLqvnaj1w_YpYQ","dp":"AbYZskHlT2Qwl-tdSRcnqPe9pIV0gP6i9KAJ6YOtQSLag-IhP98XWgIusDDWRAdNgrtpWJDX9Qv-EwFoCWNCRf9bAxeyXEiZGxPo7m8a5mJHlOgnXPdZJyAQA9GUBQMMuBwpAdZTjgx-2e42QCyms8GB9-HiweCO9ooa2i1jFHk","dq":"YkdpfziprjkI-K6ykD9-nhkqrppQG2beLgPLFVgaL-MuBQm2I6e9uX0IO1g2tCK7dEkz5IWB9AosaiI1J8rEr0pEZsqlhcu3um4GPrR3kGiEGQCR0BhNLEiTiI9Ci0SNmAozpM-MQAS2OkX2h2srpWrsX3ggtixNLDyqgrh6CDk","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"u5vPT6lEwGjoybfS2Soe9LhkpeXUq0jfmSoUXvjCqFgclo2QLRs4SK4pfluZl6HFFt-Yp_OiM7hDXAeAgz7Aze5yRjYPu63uIo4drSQmSiUe8rg9LNIQd83n-XJw0X_UNa2SGWGeFA-nuMAp4EpLCzc9T5_y3sBJHhGfV_aYg0O9hRgJyqRm5dMu3GmQpn0CY7keConQkcPW4osAIeoAIgRnJZKObDyIt5dRGQ5i8hitBVlMcV9jBeFf9_8LruA26g1mKvp9fQrhzt-1zhC3se46nqDhC2aF7gaos0pYVidqQvjQcsfvIcbPBNJvE3kIPsxc8YP22zPxQT95wS5JUQ","p":"32rKIG3uTD0v_fBLtMAgszNOquLx81KWklsMAtmilPaklTzAw_-akZxnM8YY62GtZ3tzPUq4jLktYqrbsBZD9Jd2igz64-5ZlnI8WcWGXm8nXK2GLkJbA633x7JnUBlcYlxcz7lQw9mzuSXUVyc0OTj5kcYw1dWXghMRe4hKYfU","q":"1vge0M2uwK1Ews3OIJaBEIXGIxLfHqFuAUgJX8XlTtcOPIZF3mLif73ZR_ZysyHHs-TvAwleUthgRzZaEo6oROQgVxLrYNDdyluQn-bDSu7UoDEIiGH-xk7Giq2tjavmEKRryN2_O0meWUVeSbvGhRsQ67hvibkuMb4hhaOXxG0","qi":"J6FEXRDpXoa-6xWDHHNHQQF7nR2mCXKOD2CP3PXAm58EWl6HSSW1bBAh4iIrsSRIMbHUG8RAJAFhjkOq2ZXP_lGLS7Blt8KNuB-Up0XMAgyJMqu3r5jnGJ5EZM3eGezKLePUOfzeiJuL67r7MaWo6sXTgrEezcbXJIrrfqpN9io"},
      subvectors: [
        { text: "",
          signature: "ag7NR/gIX87W3Gwlk6qSqwQfn77Wj5s9E0/np1zgi1GnXBMZOFmDagZh0naMLiICW9T0UnjNoMe1DAXNzQ1R2RzlWXmd6Fc3WbT8WNMnX1ZyjUfHbn3JzQrigwMTWnaow/0BxC9jzZyarGyDwb50cn6vG37LdWOTo752xEDXgh3jTcIXWMISV49FaHRi9JAORT4LY8s8jMIdQ8f4JZ2OGIh8cJmC0SWCBuOrgzAzHI7/XqPTnZSyCs75/s2Stg1CQsWqjfij5EaqQxw6zSTcCA+Msxwks50v0pawXGrfIANf+hOfl/Bee42of5uoDOn7N+3FYfkHGt/d5U5K1nHO3g==" },
        { text: "Hello World!",
          signature: "iKVj6wC50oE6TBdpD6ry99v0eraUGfg2YVdsoBsfse9XSq9zkt5yMzXgmTvVp8jN3eyUO8HyTaB95M2JLJEXR+cD3wr2vKl2qdbKBcZCd2fPUr6HIiN5nSEC9WEVD6E+lzWrC7EZl34qXyQm1pzaNkMjQ9oO9j6A1wCzH3sB2HUNRX8M0p2DAG6uN880/ttcLgu7z//3U+2XvPR1+S45RQOR/F3/ar0mqncHl0DVBE4+o4kgQ9uIepJNoVgRKo7BY+ZQN7dnD/V7+7RcfeU9owAPMa6R+RJlH6CUUnSB2XSv9vDpyJZnFFmJZuYfVMHWwakSrXPxyjHjxyNninpWSA==" },
      ] },
    { modLen: 3072,
      spkiPubKey: "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAvD1cuexe9e6Z40nYbRigAee0t2GPAWAknsDjPKPKtcflTLkFkSPr3bIj9Tgvgk8ZhdcQ5KGpi8x2ndIQ9ZwznPAOYp066KhxcQYZdASKI1FeYn32hegXLqSUE/ScnSVS62Za9PR8aB7J8HDMEGO6XNmjSzc7oCatHgM+EmX2Ko8lVsOSAeGCsR//RwQ8Wposmzj0LBM3TSalZnng0wIjnT5AlRM12Iv2ujN0pC9fPEcUMTAJ3tGViH1nu6pU7pGh+k3nyfq9sUfXOUrFcnDwISFH4+6XQbBIVbzsjbYUQCaTohKpBQQ/6HFivZtldiNRza0ikC0pC/8ErUSrD/fZdTnSjKmG5JQIx7dsYUOt1COpW9RZ3pLhRRr3xHWrXsLLQJiDVUSj5zzBXCNfm3amfsUSOZLjp4t2ywa14Nr1iHfnjLkFx9StLZsctCuD8a5rDXUcrnW8ssbR6PSE3tFovciPA3w1G7EFg5/mHVLc5Uckwqz+ORIDO6FDDemi3OExAgMBAAE=",
      pkcsPrvKey: "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",
      jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"vD1cuexe9e6Z40nYbRigAee0t2GPAWAknsDjPKPKtcflTLkFkSPr3bIj9Tgvgk8ZhdcQ5KGpi8x2ndIQ9ZwznPAOYp066KhxcQYZdASKI1FeYn32hegXLqSUE_ScnSVS62Za9PR8aB7J8HDMEGO6XNmjSzc7oCatHgM-EmX2Ko8lVsOSAeGCsR__RwQ8Wposmzj0LBM3TSalZnng0wIjnT5AlRM12Iv2ujN0pC9fPEcUMTAJ3tGViH1nu6pU7pGh-k3nyfq9sUfXOUrFcnDwISFH4-6XQbBIVbzsjbYUQCaTohKpBQQ_6HFivZtldiNRza0ikC0pC_8ErUSrD_fZdTnSjKmG5JQIx7dsYUOt1COpW9RZ3pLhRRr3xHWrXsLLQJiDVUSj5zzBXCNfm3amfsUSOZLjp4t2ywa14Nr1iHfnjLkFx9StLZsctCuD8a5rDXUcrnW8ssbR6PSE3tFovciPA3w1G7EFg5_mHVLc5Uckwqz-ORIDO6FDDemi3OEx"},
      jwkPrvKey: {"alg":"RS256","d":"FMN7__Inw17vUJfrrJUDyVICqBu1x4QQZgaGykCS8pw7Gcxq5cidktW8i6cH7orFGPNRJLcEWaxTBTOPtVfmhZAhNhV70wAJi1sN4bNCfYTTMXANilXAgN-cidr4j4j3bYnbzJtPQbjrs37ts30cqHNFRN2x0QeTHvVimmruzWD-0GRALb7vSJRr9yxrb98Dvpd4r4frGLKDmhslhoD85rJgM1FsJhfCPmXAnv-utJpuisJuxEpAAU876wJt3eboU2SmcKW91nS4Ixt6Yi8eIlqIHRZ2_GeD2GqTqiu9JWxWJF6fLtlrveJMhrEKKwHCpZhhog1iLBakraKWwz9tk5KY_d9VfGQJiW5WlrSf8BONkYRl324cEQiV8w2euLOqZ_S3PHaUAgT4OMMYZOox5YTfsm7VATSWJrWKpAiKY39NymEzj4eUYWyO3YooJzO_4442c84kXLryAZe7JuCzDcg_lP4ao6UAdq3nzZDk1HsRBud_kq6gS3062PTtsUpB","dp":"4o-mKSV8iPYnlQSHSdIUlobvOvqwvytQUeuE4fXbMflAur1JO98CSo9w19Tv2TRzezdHiSoSFkmDirS6MNpzNdVCLc4ukW4z3bjl3rS8bcgVcqsKhHJyo9EdMzf9wi-_Om-sMP23Uk_j183_Omie48bUXiovkI2AYcamCfTzABa62aMpAedU8dkud6nteizQF3bT2PUUx7xyaxTBg8w0cuypensHh6H9Lxs7dZ1Ulg07n7d9wMIZu8zNVQMsndgB","dq":"SU_UljbaaWpTdDyCOnXzWExGBhcxp63wmYLH3qhyn44ROf1XM6fQdTZiIe4mDMiIZhWdCOU3I6KJAPIPhXNrKnC59Q1b4sg3Lul7LiJ6HYjGgcVDB7WfS6ybHCu9yDj5PR_YqdWNp63UqWkLJusfnnIKdjo7RHmf_vbegvSYhtOTLJ4a4UrJ22AcCV1qOuhISfIBICAFdQhEDMBE6FxrwprIuXueO1yYVs5jg7ok0pg2cXGYbrdL3vvPoEFLOMEh","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"vD1cuexe9e6Z40nYbRigAee0t2GPAWAknsDjPKPKtcflTLkFkSPr3bIj9Tgvgk8ZhdcQ5KGpi8x2ndIQ9ZwznPAOYp066KhxcQYZdASKI1FeYn32hegXLqSUE_ScnSVS62Za9PR8aB7J8HDMEGO6XNmjSzc7oCatHgM-EmX2Ko8lVsOSAeGCsR__RwQ8Wposmzj0LBM3TSalZnng0wIjnT5AlRM12Iv2ujN0pC9fPEcUMTAJ3tGViH1nu6pU7pGh-k3nyfq9sUfXOUrFcnDwISFH4-6XQbBIVbzsjbYUQCaTohKpBQQ_6HFivZtldiNRza0ikC0pC_8ErUSrD_fZdTnSjKmG5JQIx7dsYUOt1COpW9RZ3pLhRRr3xHWrXsLLQJiDVUSj5zzBXCNfm3amfsUSOZLjp4t2ywa14Nr1iHfnjLkFx9StLZsctCuD8a5rDXUcrnW8ssbR6PSE3tFovciPA3w1G7EFg5_mHVLc5Uckwqz-ORIDO6FDDemi3OEx","p":"8q4YVoredClxDQnCM8nEdFUtzH5O-FoKKgZBIKW-0-bF10nssOefxbKXdh3BiC9zWIwPzQ-lOSc0TVtVlHAVfaAZuE2CAbohhc-L4ZWJP8BIAvKZXshDkwc8AFtAPlDgT3W31d2f7uRgkVi7e51LTHnO4gCXz4TkFKYOzCnC5lVmw1bFx0xp4SFXGYqZUpZE1oXN_aCX0b7nh4cmILoTi2Kpq4iT07jKP0x-_9YANwlyQ21g56GVae9vifodmB6p","q":"xpJS7bYdNFEN0uKnv-2GWc0cwtEQMnFBCqiJeVZ5tyFmSmKe4jzms-_TkPPaiNnsbtwv5ELeHB5vgq1vw8QUdfKWo7DI8RqkBvKbOsJXRCAJl2wYrvZMRrepFK7Oe-chdLDLPlHtmndkKndPGP5VgU7wN5MqhNruhxOnD3rlE-RX3EtpKVKvspLDXppXL0yXs8MBa0vFeywm_Qp4iXkKGrtDdmr8DahD6z_NaArstZxNdwysgP3edqozVgxk_-tJ","qi":"f9msAV-bzDoCHRnFxYJr9k0T6BN6mUi_UhOwYDXr1GEsUjZDra1Pmc6Wp_XmhhzgrQuO9YyAe3pwGopsUnDdQmZQ86W5AsBb_Bqvo2V_DPxB47O9rza8BEBlRhEZuBFNiYJAExS-_AarnEco_d4Tbyhd0ToNggNecmkzdYmC_2ehZ73ryh47pwMdYEGWt8oFNsGBvCrFkV8V2_grtpeqN_ab7KDSPQv-7hBst_ti6uibpTJJ11QvCkj7gV2RvFrx"},
      subvectors: [
        { text: "",
          signature: "MJe2Erja9UA7TphOVDHaWeSeLhmrbOZmeLJqez4yhPHHvOFzHGzArgdXSaLQjjtzQdklPGQlSNWQXqJePwMfIwEbEnRAD96yMsjx/V45A4KsYLclbnGsxCfAWSNtUIIs6PKMollcX5FSjebTJB/IWTg6QIrTaCRUZFjtXaiGhjuieCWGG7Toz/T3x+QIj1pM5Ob8vhyQNBGMVGaimn3gbvIfSd0I7W552Cz1wnNQNgEWqk04r27g+Ub8zkO0CTCK1md3k15i9q08yrBfGoJNO4zjjEiPHs/S1Jb6srE7L0CbVw21zih/vjQ1NAd5B83RKy+H+8O7rJjuXkHJOBE4/J6oYRkO9XKU1kwpOFEHabSoauKgBWW1LmaXdc5EbD5bWmcZzbSKNth6JCPg8LVUMeVvFxlshKAbSMY7ymEsFRMu7fDmFvKU7EgKeFY+q5/pB5UuVFbOnaNFZmCJ7aWcLzP3+GmRcLNH6DHlRQmrZQAfSq+UDT7zgYBCpAjxcBDF" },
        { text: "Hello World!",
          signature: "DZ4YtxC0EQWbqbA+BsBy90qPPWuxHu4TlfCZYU2q3swruQ8JM6oX1esYqe3974Cre2oZuFtH9MFPj2NCiC3UM8PFbNjQHWe0efMnKGXyKw+S78vem294W/QBxf8Nw9ngeTqZFVmcpzxMLTfB74hxZC1klU8A0Fxi8PV42WQj/Gswtw3UcoIxcUxsk/K1gC51bUHaYoXgn2+acimGF5ipi8KhYlbumMWb34idlr5aYxObf9nb36i3+a6V16H4f8iTvcviqRkkYQTTdBTNso3stWFVhE/dzFB7A6N/bXXUpLuMGxO3BynhJPZdXEz63L/HYJFF8X9J8NnwN6OCPzUZl5UCokvEXfpTZpxpd4xYs1uft7ftJ8XXiOoGs0RwTQ1IDgxqATDfejH7totmJINxLXGHT8G2kUhOwqIM5oEsyelnBEHG8s1bHJGe66bLfutogIllMb9TVdYxj+Y/RmGaW5xqeFw1Y1rzMBqQmrdjX0H/Lcy5yrrK5+sVPXq4s6tR" },
      ] },
    { modLen: 4096,
      spkiPubKey: "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvyXd6hoWnoxJTmB8ttwr3vGgVgLASpEXQVPxf4xBnM8qMptsbXup6+35DI+1HVsz88c7oUoGs9CZCsQb7M01aRM0DbCYqK8dvJyztbBX1vv5Anhxh7rw/ogqCNyI372o5qkv1tXuBcn/PKKKbJvWWwOZjYvjX4IUNtag9bWpyS3l64mp8IZDrqZFf0yPfDxr00SJ27TBtKUzzkk5m0xqCsGb7+cUB/VW35mCb1TwsHRZViSsePa2YqRtOLR/o7BCtt1bleKkuKb9MCmAQhfoLvFON0/cvxR3M46BogjSvWWZBCXMZmQWwATxt+gY2PHC9L8P0RJdjsnDOzRAkQWTjQ+klyYbp8BmJV2CUynURf48CoKcWcSuUxoxWKf9h+G2dtcm7AEiZFnMshjPMGReLyWa0OpyWPtnZbMluRDndRJ7RKZmFwzx9Ke63G9SYVvte7iV9wPaVefRFWXzrOyQDmDm6DblHbuRXT+pqdbd9UXdTxJCXR9aQl9K08fwQF3zFFRtUsfO/RDikAc9s4McxovPjHfkzQbAuy0o9/KGh5h1I+buW/NhUrxebLBltvnDMe2+NwaRb+Vlr8p5ifAmnJ2+Cjrr9uRuw9eiYkJMYVE8oYl8qbe3ZefnJG5zvRTqBhRTLOVenBMpB7p8G5oI/2Fo8alRbJUg+Q7fi/NHHeUCAwEAAQ==",
      pkcsPrvKey: "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",
      jwkPubKey: {"alg":"RS256","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"vyXd6hoWnoxJTmB8ttwr3vGgVgLASpEXQVPxf4xBnM8qMptsbXup6-35DI-1HVsz88c7oUoGs9CZCsQb7M01aRM0DbCYqK8dvJyztbBX1vv5Anhxh7rw_ogqCNyI372o5qkv1tXuBcn_PKKKbJvWWwOZjYvjX4IUNtag9bWpyS3l64mp8IZDrqZFf0yPfDxr00SJ27TBtKUzzkk5m0xqCsGb7-cUB_VW35mCb1TwsHRZViSsePa2YqRtOLR_o7BCtt1bleKkuKb9MCmAQhfoLvFON0_cvxR3M46BogjSvWWZBCXMZmQWwATxt-gY2PHC9L8P0RJdjsnDOzRAkQWTjQ-klyYbp8BmJV2CUynURf48CoKcWcSuUxoxWKf9h-G2dtcm7AEiZFnMshjPMGReLyWa0OpyWPtnZbMluRDndRJ7RKZmFwzx9Ke63G9SYVvte7iV9wPaVefRFWXzrOyQDmDm6DblHbuRXT-pqdbd9UXdTxJCXR9aQl9K08fwQF3zFFRtUsfO_RDikAc9s4McxovPjHfkzQbAuy0o9_KGh5h1I-buW_NhUrxebLBltvnDMe2-NwaRb-Vlr8p5ifAmnJ2-Cjrr9uRuw9eiYkJMYVE8oYl8qbe3ZefnJG5zvRTqBhRTLOVenBMpB7p8G5oI_2Fo8alRbJUg-Q7fi_NHHeU"},
      jwkPrvKey: {"alg":"RS256","d":"q7ed61_ycA6BEHsXrsKOWuNgccRY8OP1K0f5DOd4TiHBu-LqflR46y1G7iTvxOaY_mg-RoAVE1bTFdvlZk9XqwSIX8AE9I0Uvstbml5IGycTpUeEXjXvqAm1EW7lO3LLmCPniS14fhTgSZ2Pk1BQOkU6nfFMmxFljXo08Wd4lvW3tmhelWhYxz4x8tFZmXdCOnI5EnoJBnre1nPr33q_TNhveQ5zbU7W81qZ1eBNtYdgdkXN94FTibxDLozgmbGPzW2AiF8qMYQ6shimUznc6Mb4yDHjknkVOOjNxj387A6obxRx0o4Z7fjDGb7VC5fs1ygJUn4YNF1HGRmw41dKHAK3yVIyMx0s-V_qFbcFs07rm66ynRSogcW7i8WYKohkdMbZDkKfBVgZO7xOXrSmSX0mrcM7zxD9bLSwCn_vTfmv9wPh7OXW0ZF5Zmt644N2kDwPuVkMDYimRppEoRTJffDRUQS403Ni35uVszCF_cuAwCzWFg0kOBG0jjBPUd2tESaXg_lDUT5bkKlCKmMaKCr4FrLapSI1pzGyz58KaN5BEiFDlAHLrCBiZV1A7pK3tTMa_uw9PvSybsHJQLlWt46Gegp_W-vpUOCN7YAnHYCtnGPbTtwLFW0WpEmFLaf0NKeYwpZQ-2jjgInWTFYcjtZ2fhzKAcoe8g5Bp0xZx-U","dp":"voBis8ZPYJx3B9fTEs2sGkvH9R-Q9gk2PTOXhRq1jLonms8ukjFNtRx6eBWnzZSCoqOz_xnYyVgZRtvLQT9SkBW5vpEUlaih9AWYzH13aEViGTChxrJIPEv32mD5YMcQcXqyHsKQQTN3LCt_EgCkioAQYEUhIm-mhrwdx7zRzIgAH8KOaEpRKlYsqUUbCTAgUd_uA0Axznk_DItF389uTvke3AOB1wxkpY6y8nOWfFq62mzWTiUsKxyPPHMHs4OCslm7d7jN0ORz3btKnsffp2G_NY84SMkk_X-iqIsrWHPL0hiae1Tpgzbh8aMylxueNiCCTSUIcEnrcIgQaPy4iw","dq":"n2p9wkmFVmP41DmZgz-IAVY11FR11cAaDfHJ3x7f4qL7kmr0XqawEgChP9lADaz2cqURuU_UHUkTVs9gd1ePg-j5PVxUmPdtjYySMUy0anB_ry1teCyJnYy1b_KPRVjS7gYgCAb7Euw39BMRWssbYgKdxYx0e8--XYVlw3vrLvrfCsKjh8MkLZf7xkKU6T0UaAfhlPfSYk2-TrQaIALAC-ys14772vYYyhgGtnb4yEe-XuWZtdQz9kzBm8CYWG4ckecAqgB5sMm7vU9ik79UBJ-0aBxt4MBhG_6I3pfHSE-ffeIjiaZ6sbOY8i0UFSldotwL8aekchC9-oj797KDcw","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"vyXd6hoWnoxJTmB8ttwr3vGgVgLASpEXQVPxf4xBnM8qMptsbXup6-35DI-1HVsz88c7oUoGs9CZCsQb7M01aRM0DbCYqK8dvJyztbBX1vv5Anhxh7rw_ogqCNyI372o5qkv1tXuBcn_PKKKbJvWWwOZjYvjX4IUNtag9bWpyS3l64mp8IZDrqZFf0yPfDxr00SJ27TBtKUzzkk5m0xqCsGb7-cUB_VW35mCb1TwsHRZViSsePa2YqRtOLR_o7BCtt1bleKkuKb9MCmAQhfoLvFON0_cvxR3M46BogjSvWWZBCXMZmQWwATxt-gY2PHC9L8P0RJdjsnDOzRAkQWTjQ-klyYbp8BmJV2CUynURf48CoKcWcSuUxoxWKf9h-G2dtcm7AEiZFnMshjPMGReLyWa0OpyWPtnZbMluRDndRJ7RKZmFwzx9Ke63G9SYVvte7iV9wPaVefRFWXzrOyQDmDm6DblHbuRXT-pqdbd9UXdTxJCXR9aQl9K08fwQF3zFFRtUsfO_RDikAc9s4McxovPjHfkzQbAuy0o9_KGh5h1I-buW_NhUrxebLBltvnDMe2-NwaRb-Vlr8p5ifAmnJ2-Cjrr9uRuw9eiYkJMYVE8oYl8qbe3ZefnJG5zvRTqBhRTLOVenBMpB7p8G5oI_2Fo8alRbJUg-Q7fi_NHHeU","p":"318TiQL1oU8C089Mbq3LZFQMJpl9yvZZz2BD05UcWnKyyYNhLxjwSYykRCKk2wHf0NW5KE834QrC_ecQ5qtvbbEqR-5RDeNakSAiO4_XD6dy0GIaS9tx_VXUJEwRByktRLZmNXQuUE6-gZ9FtBY3Y4aHSneFitVbvPoBxGx76MJeFb_zl3JslKtsIYRFvTnutIrs7dAkV5r33Czg5qVA4U47uLmUPXU6cowcKgoST7EIuKvjaj55n5ct-dO_OsYaWDUCmocA1jdcCiCj1Ver1MmvtM34UIH-X1Ww-XHpxB1jP1dcRHY1ivpsDH_9VfKyL6fOVxDwr3M0OtgIeA-UYw","q":"2xHNBRyafMR7ZeljmFHH-YGJ7kma-jqrg9nCF3YwseLBwZBEKMp4TFBMsu-W_5IWd8bHwH7XE2lLZDIL2y0qJrSBvmFwDQiLCJg7YP9I19DGI0XjVVVXytPSe9vQ9I_A6Q7U7yqW4U7Xx6zDL7p3HpSzOVXsiZdIvz7yBXk6A_53A83a0DwZO6d66OzkJ-IkUzmtBxk4YS5SorwxIKWWxYKOecvlaD0g0J88xcMXhgBeVrZ1Mw2z_k6_Fr6tvhsy99rIN4gUZ55fJWS01Cuxf-5xGbYYR6mmwWczykKapjzWrkLb_FbVM-oXfRlKHaC2qOTAZO-BSLblG721ko_jFw","qi":"z4w_NI50rTfYplYwwyhmMhN2vYijJINzAOeBeoYarCxMzwE2ZUWv_ZocucyEQ5t1k5mIavHZWPAkPxFJunbFXArb0G4nv09fY9cRwoLeClbFCinWBPF-G_Sd-0xdgjYSXIbHuFBdrk5fy9Fhp3b4_fs-YjIg4Bt5mP_8EXKbOA-2-tWAEJD97sR-0TpLSz89Fyu1Q0iU_RyJHqQHWhQGsy8TNoU1oMuWCULMXj08BCxD9H-O0mJbvhnbjhzaM8eJFd9vlacAJoWe0pp7AErl5NXnnqhKlZoa-NWVextvPgGPHOUjd9fkOwc29b2lTsK2dPmZ-KF-J4XjE_9JbJRLDg"},
      subvectors: [
        { text: "",
          signature: "dOeehWjJmyT4Xedh6lwUCv/+ouzvsUC4BeZr7G4fd0Xhspgf8Ua+d8SN+gn8q1ujuKn+2030ffn23B+DVnarAP3443avvvL4xK6cXYZUVufalQ7XkTNnR+g1tlSdlqyi7e85BXBv11oZahm2ivWN6N0INGsV3LZ0nb2HxbXBz2xyqBIZ8kSPeQhLQrD2H5Xl84YTGFFUqd8J3Mvufd3ky2cAG3lI1tgRZt81meJcKke78IH1HRDJdJiHXL7nE+8aHHj4Ddc/0OUfjJaIS539dH//ZDpHhKsTGeSskLDCZ5uu0NHEmkGxzKJKP6tuDV1ucJq+gVCF3LMZ19m9TXmLbvmL26e49OkRP5cQ1Hhm+7WJ+DkRVJKCSqYT42Szutbtw4ww3AlEZZA0MmX90PnjdeJQ6QgARZW8vo/hLGlUoQBZjRAGOjR+S4BOrHolz1ibnUW03Y9Z054X1zG++rgKoKDZC4TGQe7Kzju5kLRpPyOejzKb9sFcY0C2ksA5QvPgBwNITP5RJAIWKaajpuSOh8WTkstQtBKJ/mtMr4kfz6D8S91JK0vip9MNmQRo2pKK+pBzwjUcnISZvOBhxSuQt5FuMrDp7Rm9oTgm8+rMoVoCxMH4RxvBTV4+ioAHGFThz83rB1se2KmiPO3fEeIaU8Me3KBiDEW1E/TDiTOD4/s=" },
        { text: "Hello World!",
          signature: "QURUcPaJ4AXQrL56fGbX7KHS7IOvE0xnX1dOwcTvXEDxO8oTA9U9kF5TUKNDDMgNnXRXMdb3/qufsKiPfKGcJTlEsqs6/mAYWDBrVZoRLf87j5b5ONm6UFhhJ84dapLvPgpNjqvm9NPiq1gJMhXRELZtmScpC6tvX+xnUyVIeVlj2VjawCd40SEn84db7ud1ckSOE/WHBAI/bHXAu2EHbo3iCfSeNdnuKoctkYhDfPzC/OnZvwM9HX1wli1oobrXdSrpaYf53tiV8W2V1pD16mJ2SdxxmexRXSYYhFeIkU4JhVV/0ROp+swbFVUFUsMHGijdSxv+JhMF8xrHRwx2HhaEWnzRkKubxSdxKutrNMERzQXxNLPola3RR0/bob18k+4LTHf4ZpjkHVwi0jAtg1AvkAILjJ7H7Ucm0nA6Slpikmi24pdbmH66a/IS4XTA/1K875xBCOtZJ/cLtr+yN37CGMpvdpnZYB6xkPgDUjRIjLB8RuhTa+yeCdZBV2eu7wEyz2B5v1KnCpBE951wfyLxFeaSXDn+zcFk+gRF2oK35g0FfHCRN25188SVeTDLSrMsEUuxgnolTeMyrFmaDVlZbI8l7QNYiE4w6I3NBnz7MOUFHF/6VjkgrUCEVFPMeS0pvFMxUX5tlVfYFZWMs5npFVnQK1wEYIWwP/OB6Vs=" },
      ] },
];

*/
