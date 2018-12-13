describe( 'RSA-OAEP_SHA-1', function () {
    var alg = { name: 'RSA-OAEP', hash: 'SHA-1' },
        pubUse = 'encrypt',
        prvUse = 'decrypt',
        jwkAlg = 'RSA-OAEP';

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

                describe( "encrypt", function () {
                    vectors.forEach( function ( v ) {
                        it( "'" + v.text + "' as ArrayBuffer", function ( done ) {
                            generateKeyComplete
                                .then( function ( keyPair ) {
                                    return crypto.subtle.encrypt( alg, keyPair.publicKey, s2b(v.text).buffer );
                                })
                                .then( function ( ciphertext ) {
                                    expect(ciphertext).toEqual( jasmine.any(ArrayBuffer) );
                                    expect(ciphertext.byteLength).toBe(modLen>>3);
                                })
                                .catch(fail)
                                .then(done);
                        });

                        it( "'" + v.text + "' as Uint8Array", function ( done ) {
                            generateKeyComplete
                                .then( function ( keyPair ) {
                                    return crypto.subtle.encrypt( alg, keyPair.publicKey, s2b(v.text) );
                                })
                                .then( function ( ciphertext ) {
                                    expect(ciphertext).toEqual( jasmine.any(ArrayBuffer) );
                                    expect(ciphertext.byteLength).toBe(modLen>>3);
                                })
                                .catch(fail)
                                .then(done);
                        });
                    });
                });

                describe( "decrypt", function () {
                    vectors.forEach( function ( v ) {
                        it( "'" + v.text + "'", function ( done ) {
                            generateKeyComplete
                                .then( function ( keyPair ) {
                                    return crypto.subtle.encrypt( alg, keyPair.publicKey, s2b(v.text) )
                                        .then( function ( ciphertext ) {
                                            return crypto.subtle.decrypt( alg, keyPair.privateKey, ciphertext );
                                        });
                                })
                                .then( function ( cleartext ) {
                                    expect( b2s(cleartext) ).toBe(v.text);
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
              spkiPubKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYamp78gOm8dSC7lgPB93/6FdYIWTnd1rCMhY5YvGw63T6gIyKkCS9Lr1OrKQf0D7I+OMuaV7MAF3XpLrOiYm3tTfv9LMAP+ZQ6UK6Oz00zlnNxr+VkptRfBia5qEfK2mjcxxvw/or9UZv9D69Lp1ClFCsFkXOl+FXJYcIoobi+QIDAQAB',
              pkcsPrvKey: 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBANhqanvyA6bx1ILuWA8H3f/oV1ghZOd3WsIyFjli8bDrdPqAjIqQJL0uvU6spB/QPsj44y5pXswAXdekus6Jibe1N+/0swA/5lDpQro7PTTOWc3Gv5WSm1F8GJrmoR8raaNzHG/D+iv1Rm/0Pr0unUKUUKwWRc6X4VclhwiihuL5AgMBAAECgYEAseb41h7ipbASU/d+aAy9kAr9EjORcT2KXC00W8RcjmVgajSWU6meqe3sLOp6mLRliGwgxRxVkzmR6x09e19Q1zIM8qyHVL1hkVVcWcvPS0wd5Dc0FhpaXBeSiRu1Vkzk+jMCA60IBzobWvvuEqglOitqBEaLPJwTM/E6N2ddggECQQD4tYSi7goCW1b05o3O99oYN2584Ns3H3a92AawUgAyi9HkW7MeJdtvE5gQ+GVxP/iUIxpjgjksoA3p+0xEXJ+ZAkEA3sKL5BQB3ChOV7QJ8WIqButQ4qPO/0lg4MuJxqYDS9/2EhyFHOldKdbcmuFh8hJ+aQpcDChfvG+ngb+kTAv6YQJBAOSrAChNdCZ2lJzW3ctNVtitHojytJsZ8rLZzEyRGF1g8LplFWrCo96cxVPVDm/xwTtyivCy6p59Ck33H0g7YQECQEE/QrJfmdvegnP17COj2SOFsX9w86Sa3aF6fLSO09BZnT3Y1LSPNhaXNK647XN2L0idHDEDcmdDXREIDRupNoECQFCv/0EUecHxPXjRVg86aSUsvbCCkhuKoJCY7GpB7xJdza96oeAFmLUGrkMHeqKHzg3CWTxkLEkDyNnR36yMilA=',
              jwkPubKey: {"alg":"RSA-OAEP","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"2Gpqe_IDpvHUgu5YDwfd_-hXWCFk53dawjIWOWLxsOt0-oCMipAkvS69TqykH9A-yPjjLmlezABd16S6zomJt7U37_SzAD_mUOlCujs9NM5Zzca_lZKbUXwYmuahHytpo3Mcb8P6K_VGb_Q-vS6dQpRQrBZFzpfhVyWHCKKG4vk"},
              jwkPrvKey: {"alg":"RSA-OAEP","d":"seb41h7ipbASU_d-aAy9kAr9EjORcT2KXC00W8RcjmVgajSWU6meqe3sLOp6mLRliGwgxRxVkzmR6x09e19Q1zIM8qyHVL1hkVVcWcvPS0wd5Dc0FhpaXBeSiRu1Vkzk-jMCA60IBzobWvvuEqglOitqBEaLPJwTM_E6N2ddggE","dp":"5KsAKE10JnaUnNbdy01W2K0eiPK0mxnystnMTJEYXWDwumUVasKj3pzFU9UOb_HBO3KK8LLqnn0KTfcfSDthAQ","dq":"QT9Csl-Z296Cc_XsI6PZI4Wxf3DzpJrdoXp8tI7T0FmdPdjUtI82Fpc0rrjtc3YvSJ0cMQNyZ0NdEQgNG6k2gQ","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"2Gpqe_IDpvHUgu5YDwfd_-hXWCFk53dawjIWOWLxsOt0-oCMipAkvS69TqykH9A-yPjjLmlezABd16S6zomJt7U37_SzAD_mUOlCujs9NM5Zzca_lZKbUXwYmuahHytpo3Mcb8P6K_VGb_Q-vS6dQpRQrBZFzpfhVyWHCKKG4vk","p":"-LWEou4KAltW9OaNzvfaGDdufODbNx92vdgGsFIAMovR5FuzHiXbbxOYEPhlcT_4lCMaY4I5LKAN6ftMRFyfmQ","q":"3sKL5BQB3ChOV7QJ8WIqButQ4qPO_0lg4MuJxqYDS9_2EhyFHOldKdbcmuFh8hJ-aQpcDChfvG-ngb-kTAv6YQ","qi":"UK__QRR5wfE9eNFWDzppJSy9sIKSG4qgkJjsakHvEl3Nr3qh4AWYtQauQwd6oofODcJZPGQsSQPI2dHfrIyKUA"} },
            { modLen: 2048,
              spkiPubKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw3bzCBUL8ZV1jwM4twWbtcAfihBMEVsjVwBxDcVnqKPgqNVtnoQAubd7QDVAIYsgXn2ozLwIxcJK4CY6NI4ihfVjaDGSZDDNuTgJK5Vb/N5+5uG/mGSvtak7jDpzfo6s2Az95U7HWcoxev49Zp+0XjIAgjiQBPh83sdj1/76LFJn1Hjv8aMD9WrSH1T4Sgpa8TbH8Y73rz+qqYdBdgoyMUPiFXwXTzM/PIbQc6KD8xRdt3J9wwk0gyH4rg9Lwk6fBQ8aQb6KoItXYaM/UqQawwVM3fAwcFTbZfDtEW8GkyMXtl65D6duYq8EsF+Hc52lnW3561eCiQ5GmBl8Db81ewIDAQAB',
              pkcsPrvKey: 'MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDDdvMIFQvxlXWPAzi3BZu1wB+KEEwRWyNXAHENxWeoo+Co1W2ehAC5t3tANUAhiyBefajMvAjFwkrgJjo0jiKF9WNoMZJkMM25OAkrlVv83n7m4b+YZK+1qTuMOnN+jqzYDP3lTsdZyjF6/j1mn7ReMgCCOJAE+Hzex2PX/vosUmfUeO/xowP1atIfVPhKClrxNsfxjvevP6qph0F2CjIxQ+IVfBdPMz88htBzooPzFF23cn3DCTSDIfiuD0vCTp8FDxpBvoqgi1dhoz9SpBrDBUzd8DBwVNtl8O0RbwaTIxe2XrkPp25irwSwX4dznaWdbfnrV4KJDkaYGXwNvzV7AgMBAAECggEBAIMn4qVusef1uL8wkzLD0ZqgAsm6a8BNniX3xuRNrGONKuc+5uIxgucbBdmsoY6gcyTUPpq6JUzFNUa4f9/Z67JlWMGGWcter/vzbLvQ6buAdDhqDAyuqvRDTRCn++1UwQfrl8XxGXTXZmI4DG07BmUaOhsm5wRe1DMMKaO6lJV9vSOf/Q6M/51Elx8DSxo8riHtBysgi/i0wPoJL/CnAwxaOe7nes/nHwjhwgxdIVzIm81ub3q3WqcGtTNhUd0iHK56owEmynQjPyJpj8loEvp3liECm4v0tzzBfl3LoZR+puM6NM5M0lhGS5xFdpdWgdIlsifjJXL3bElGlXU8PAECgYEA7hLRavTGFovBVdmHf+tvcxVO43AkkPMj83rm4lFjfr2QwNEk93GCUz+2XYRU4ceYfpl7WuaUwX6sQhEp8hJzabZ0zX2cFZB7pLqtLLtw6kUTJTbdtcEv1VqibarjitTpxSVv+j4vB6/X2LBjWXWZ95kdoaBI9+X4KFRZpuod93sCgYEA0i7KAgHFKz8+2Fp9Yh9fk6XLTX7EvRVe6jPwxbr60sCBwZiIvKLvaPmUJn93MFk9rthTzB69RKWko5fzTxDfHZNA8uarOspAc4Um2wTUwEAhSzlqEO19wmtDiPsmaJJ5XM0P7Xx2FhZ+r5dmzo5Pob3IkwjRcWxsYSw7NX3gWgECgYEAos0biBh6nVBUlXB7yG4neHtJxx4Y40Zhf068NGeTskfPhQuAS/XDOUqIWsrzgLINBgXO5QppDyigg01ZccBMTC4JEbyjz9tNsgg2BDDptkomHXy3gGLrYurnyDbkAzw14CsJuAZuAsOsxvFX/wT8lOSP7sa9H0iTuoB0DkBq3aECgYEArJ5AyeUqSZpnwsiOsUeS92/yyHKUobYrfa2q0Ln/xZbU+mqL4mDuvwg65GNLQCoKvs5sA/g6+WYREUp6STVSCLgnX1aSynXQ+Q8iGj6dfEcvENjWg5CI+GOf06BwqvGhOtYvfpv5X6qZ4Rw3Eu1N+Ugksp1LZhvl5uisuAHpgAECgYB7x9OaYaqGaDv2LFHWH3gaEagv1OTxcJZu3cCJvDk+ihOs3x1g6szojEsbeD3wcdWmAc5xXEl8sjmbxu1oa1eRDuzoZryLuuw3SRM7uWt3Tp1WWWzOdQGp7a3FLM/DQ1iG/7woeGPjH1C1MR7B8KdqsurK13UjrjE6hY4N4H5MnA==',
              jwkPubKey: {"alg":"RSA-OAEP","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"w3bzCBUL8ZV1jwM4twWbtcAfihBMEVsjVwBxDcVnqKPgqNVtnoQAubd7QDVAIYsgXn2ozLwIxcJK4CY6NI4ihfVjaDGSZDDNuTgJK5Vb_N5-5uG_mGSvtak7jDpzfo6s2Az95U7HWcoxev49Zp-0XjIAgjiQBPh83sdj1_76LFJn1Hjv8aMD9WrSH1T4Sgpa8TbH8Y73rz-qqYdBdgoyMUPiFXwXTzM_PIbQc6KD8xRdt3J9wwk0gyH4rg9Lwk6fBQ8aQb6KoItXYaM_UqQawwVM3fAwcFTbZfDtEW8GkyMXtl65D6duYq8EsF-Hc52lnW3561eCiQ5GmBl8Db81ew"},
              jwkPrvKey: {"alg":"RSA-OAEP","d":"gyfipW6x5_W4vzCTMsPRmqACybprwE2eJffG5E2sY40q5z7m4jGC5xsF2ayhjqBzJNQ-mrolTMU1Rrh_39nrsmVYwYZZy16v-_Nsu9Dpu4B0OGoMDK6q9ENNEKf77VTBB-uXxfEZdNdmYjgMbTsGZRo6GybnBF7UMwwpo7qUlX29I5_9Doz_nUSXHwNLGjyuIe0HKyCL-LTA-gkv8KcDDFo57ud6z-cfCOHCDF0hXMibzW5verdapwa1M2FR3SIcrnqjASbKdCM_ImmPyWgS-neWIQKbi_S3PMF-XcuhlH6m4zo0zkzSWEZLnEV2l1aB0iWyJ-MlcvdsSUaVdTw8AQ","dp":"os0biBh6nVBUlXB7yG4neHtJxx4Y40Zhf068NGeTskfPhQuAS_XDOUqIWsrzgLINBgXO5QppDyigg01ZccBMTC4JEbyjz9tNsgg2BDDptkomHXy3gGLrYurnyDbkAzw14CsJuAZuAsOsxvFX_wT8lOSP7sa9H0iTuoB0DkBq3aE","dq":"rJ5AyeUqSZpnwsiOsUeS92_yyHKUobYrfa2q0Ln_xZbU-mqL4mDuvwg65GNLQCoKvs5sA_g6-WYREUp6STVSCLgnX1aSynXQ-Q8iGj6dfEcvENjWg5CI-GOf06BwqvGhOtYvfpv5X6qZ4Rw3Eu1N-Ugksp1LZhvl5uisuAHpgAE","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"w3bzCBUL8ZV1jwM4twWbtcAfihBMEVsjVwBxDcVnqKPgqNVtnoQAubd7QDVAIYsgXn2ozLwIxcJK4CY6NI4ihfVjaDGSZDDNuTgJK5Vb_N5-5uG_mGSvtak7jDpzfo6s2Az95U7HWcoxev49Zp-0XjIAgjiQBPh83sdj1_76LFJn1Hjv8aMD9WrSH1T4Sgpa8TbH8Y73rz-qqYdBdgoyMUPiFXwXTzM_PIbQc6KD8xRdt3J9wwk0gyH4rg9Lwk6fBQ8aQb6KoItXYaM_UqQawwVM3fAwcFTbZfDtEW8GkyMXtl65D6duYq8EsF-Hc52lnW3561eCiQ5GmBl8Db81ew","p":"7hLRavTGFovBVdmHf-tvcxVO43AkkPMj83rm4lFjfr2QwNEk93GCUz-2XYRU4ceYfpl7WuaUwX6sQhEp8hJzabZ0zX2cFZB7pLqtLLtw6kUTJTbdtcEv1VqibarjitTpxSVv-j4vB6_X2LBjWXWZ95kdoaBI9-X4KFRZpuod93s","q":"0i7KAgHFKz8-2Fp9Yh9fk6XLTX7EvRVe6jPwxbr60sCBwZiIvKLvaPmUJn93MFk9rthTzB69RKWko5fzTxDfHZNA8uarOspAc4Um2wTUwEAhSzlqEO19wmtDiPsmaJJ5XM0P7Xx2FhZ-r5dmzo5Pob3IkwjRcWxsYSw7NX3gWgE","qi":"e8fTmmGqhmg79ixR1h94GhGoL9Tk8XCWbt3Aibw5PooTrN8dYOrM6IxLG3g98HHVpgHOcVxJfLI5m8btaGtXkQ7s6Ga8i7rsN0kTO7lrd06dVllsznUBqe2txSzPw0NYhv-8KHhj4x9QtTEewfCnarLqytd1I64xOoWODeB-TJw"} },
            { modLen: 3072,
              spkiPubKey: 'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAvLGhydJcuMXAzNBhpcn/O7Tcx+Ur5hUSD2QPX1pkP2Oz63tVP2jMjjw8+yoY/xgOcx/ty3McDEyalIvLA0xzh5oOe7zlaB3nPWUDkIFKirzNWBmnqCX9z3aufw7Nwyav3NG3r1imnaSX2M2KWiHUmjW5n4UKvlpLPaWaIp18Lbp1Z0QKIYyaO+9uBdyKoG/17IpFHmt+IBwUp8WtQk1k+u875Dq8ZBFlIDlhmgRSjrsxHn8uWr++VxuhlA0Dw8NcrXJVPTMI9PatqkHAnwxk8lECL3/oCADmzJIqNG4hf3NVp5W+w+N4XU1/mWD/dfnkc0EhZZARq1jltrXdon1DzlBWXrVh20gzUbg/tXY1IgJ4Ff3Ij7iv2PUj7GTkPwTSk11kM2WnvcSlaQaHElod98UNnyv8tW95861QWLuRddaExvLF+thYtJZtws3YxxnhMlwpr6MW5dhYRb7WBXgYyyaoOg4opOXKIh3pali+dp6aDo7JU/PJ2I8mlchSF+uJAgMBAAE=',
              pkcsPrvKey: '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',
              jwkPubKey: {"alg":"RSA-OAEP","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"vLGhydJcuMXAzNBhpcn_O7Tcx-Ur5hUSD2QPX1pkP2Oz63tVP2jMjjw8-yoY_xgOcx_ty3McDEyalIvLA0xzh5oOe7zlaB3nPWUDkIFKirzNWBmnqCX9z3aufw7Nwyav3NG3r1imnaSX2M2KWiHUmjW5n4UKvlpLPaWaIp18Lbp1Z0QKIYyaO-9uBdyKoG_17IpFHmt-IBwUp8WtQk1k-u875Dq8ZBFlIDlhmgRSjrsxHn8uWr--VxuhlA0Dw8NcrXJVPTMI9PatqkHAnwxk8lECL3_oCADmzJIqNG4hf3NVp5W-w-N4XU1_mWD_dfnkc0EhZZARq1jltrXdon1DzlBWXrVh20gzUbg_tXY1IgJ4Ff3Ij7iv2PUj7GTkPwTSk11kM2WnvcSlaQaHElod98UNnyv8tW95861QWLuRddaExvLF-thYtJZtws3YxxnhMlwpr6MW5dhYRb7WBXgYyyaoOg4opOXKIh3pali-dp6aDo7JU_PJ2I8mlchSF-uJ"},
              jwkPrvKey: {"alg":"RSA-OAEP","d":"E4nJGN7BXxiK6CpDkikiVopZuhEOxJo17oYL2XHAo5etT5rLru8pDylJnzAyumdBR8Zslv5qTxO3hd4bvVGzPL1E9qcOkgNWqFLHVbUthMQb9x1g8NZOO6csVlewEp704saMYImrZvNeDcLqqn6KRxV9DPl3rVIoLE_zb9Yiv5FpCrJO4j5u0fnuyIiXihlNu5ptocK7opOFyAF9-TmOVTVkXDOAwlPSxs1qP8pmygS0B1Zf9GGaUea4il32n9SgnGZz8zDzzpNnscb87ytklvazHKDrsXyx9ODuHe0JBST4EIjOHV9-8w_QaQ8dScosOzOiGr1aDT0g1H_mNkOPQZdguRJwwMZp-HihLlcif_dzVdOWRFBXtjRYHSi57t92rfAkPBHaTu0NzR1gokEAFUbxIzAJN_maAuah2xXwZV3x92ayDzKXsiVC3-mqkQRji2OQ9adxYsO6R9fCZ8s5Dv_1F3kjUSAK5If9wKUD-34kHbCtGx5RL2HO4Z4DJ16J","dp":"X-iT-xicpzzrQ8hDkV0eCyl-EGwJHGsRvsK2WqOV4-162yKhddqtGb3mfhrWcc62NvGOZmya_DlyYdYNdjUnuOo-4IntACWruGXeUEsWftPNyngxclj5PMC19h32F_luDJ3cydyU04AL676jjmy_PEPIvDEuZMC5MolhFtZSLNLtumbb22vfvnYDJMLsQH1_Y3X_wH0-Nkc5fdxmiqrlKXXw9bKs9medGgZ_q-whn9-zfABhcJYdGMvz7ZA2R8D3","dq":"cq9mPn8PpEza3MC-qqzXVLQcW9xONWHlLZe8WYrmdKXmy5ulrkCre--Bwg5Z0cUKNi3lVjVrQ1VvKIOhhQI1gNcbox5dFA7GUXA1jzTG0PQnjO9N8BO1ofSHldQ44aXZbm1eyVRp9YjJXVAHzyB8ikH8FBzzg8p2ooN-qPQQyK3BpBKyP3d7b8kRBXoRYcmnJZ7t_bjGiGOA8xy6LCzam0bSpr8SPCLkTFm2fGq3bXcg6JqxJBsfiB10SZ6bAqd3","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"vLGhydJcuMXAzNBhpcn_O7Tcx-Ur5hUSD2QPX1pkP2Oz63tVP2jMjjw8-yoY_xgOcx_ty3McDEyalIvLA0xzh5oOe7zlaB3nPWUDkIFKirzNWBmnqCX9z3aufw7Nwyav3NG3r1imnaSX2M2KWiHUmjW5n4UKvlpLPaWaIp18Lbp1Z0QKIYyaO-9uBdyKoG_17IpFHmt-IBwUp8WtQk1k-u875Dq8ZBFlIDlhmgRSjrsxHn8uWr--VxuhlA0Dw8NcrXJVPTMI9PatqkHAnwxk8lECL3_oCADmzJIqNG4hf3NVp5W-w-N4XU1_mWD_dfnkc0EhZZARq1jltrXdon1DzlBWXrVh20gzUbg_tXY1IgJ4Ff3Ij7iv2PUj7GTkPwTSk11kM2WnvcSlaQaHElod98UNnyv8tW95861QWLuRddaExvLF-thYtJZtws3YxxnhMlwpr6MW5dhYRb7WBXgYyyaoOg4opOXKIh3pali-dp6aDo7JU_PJ2I8mlchSF-uJ","p":"7WD_lMSRccxgpgPXctpvFqXRl7PA2k5Z8yVbwMou4qHP1vu0F1v7NWzzjqouoCIb6v-xpmgFu0OxGhQzDL0gIKiH_4svsXGqdTYZfIwswx-Ng4OhKWmKvk4f6ZuqyQhX_7p7Jhh8cqH5BIU4BGlb54y6XGMQe74LTfCL_sujVU_Qo7R02cKjeG6x-guNre9thOaOR5KLlR_B3UV4ABdbOKzPguRdjvKQ-nnGk2-JKReh1JbV2NcSdw_4DFZ4LGNr","q":"y37zDxWMu0EAPWgivBCe7UZ2QhXuMuOJsk8KtBsylkE3vk9lz2bOnsG1R56oqX-7p2vdgvfhSV7XciA-YmDKE5BUWl4cnU6fPIhsuyDG_WhWV12OFxByCrr_bV1KYG4ysimUxFapVxScxKigoRSoxv7RLl6GEP6xZrZ55LJOuoFyhXQh-jQn4-svQMdUlENnieF8k7wTuFi6L_YAGnE7VofgbsxuucZn1h9Vl85mZrkB4-0hvTpH9A7AjaLdQ13b","qi":"R0dC1GzG1cI9jfKMK1Rq-W2K5buyEg3b_YLILaBohVrvcmnwPZUziY0nW_JVM_J3A1XGmOb-1kgdTFUOPWFu5bGMrLNqI0R0EhlPXwa_Bhbn4aKzGfxRegPIBwoqwaQNaGBifLZBqdMxjEdjfNXApMEJYb0y3UvABRVRtkiIfpulrE-aZqelh7ELmuFc1W21m9Qru6_zv9RuzPla-orl4x9HKqGZFlCyasGimJ7iAtkZcaIik551es2KuUablcH5"} },
            { modLen: 4096,
              spkiPubKey: 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAqJ+9n7Lg3x3opsqG5EnTocfqwxub3Oqycgxo3aC/3OrLEEUHQusbwFTpO+05BndpyqwfBNSEfOaRNhN9gQqRshjPXsKRdS+VdJ7w6gDUPSAhqevCXqsoH3e6Epp0ceGL62jZ2gpuFhxqVJUv6S2QN1MNM3DvQ1B+wkISKFaJ4v146dvVw5kEk3ROf7HAR4szC/Y4ptxLQLQC9Cs1N1djPvdFEaD0DHJFJtkdPjWD6ofb2KslNpNacrohfYtcc0FAH+uDTIG0nJ8N86QbDojKXds0uXnWGB4kEEk3Gi9EpP2iem/1dLx0fUeQ1u9PTU6riwRfc5jZWb/SETi/1dLAwkz3g8pt0OYFLFMFcem9KG2EBk8a7vfUvxvirUuAgCe2KAN2KH1hsQ8wGAOLKSwMCnhXIFWZ1JLi74j19wQWFnVwNgtBFcP/f1z7I+W3mQj45sw87WdU+d2UKaCrSoiu3RXMK6acbq1hA4J2F+nQHvJYnzWGg6VJI5+I0NcweMyMZi7lbzHFUQXmnN+gbKuyly12FlGCcmc7UxiPnc4gL9fIzQV1dNOkZ2Tf/OnCpyWICZAZ8DBqSf73HwREmfqlq05PelvZv/tt+GdNtqvvLiWjCYYNk/ltWLpyvE+zaWNemVusGkQ4r/msSdLUwL+oQnm+nczQmE4bQYuwY211rVcCAwEAAQ==',
              pkcsPrvKey: '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',
              jwkPubKey: {"alg":"RSA-OAEP","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"qJ-9n7Lg3x3opsqG5EnTocfqwxub3Oqycgxo3aC_3OrLEEUHQusbwFTpO-05BndpyqwfBNSEfOaRNhN9gQqRshjPXsKRdS-VdJ7w6gDUPSAhqevCXqsoH3e6Epp0ceGL62jZ2gpuFhxqVJUv6S2QN1MNM3DvQ1B-wkISKFaJ4v146dvVw5kEk3ROf7HAR4szC_Y4ptxLQLQC9Cs1N1djPvdFEaD0DHJFJtkdPjWD6ofb2KslNpNacrohfYtcc0FAH-uDTIG0nJ8N86QbDojKXds0uXnWGB4kEEk3Gi9EpP2iem_1dLx0fUeQ1u9PTU6riwRfc5jZWb_SETi_1dLAwkz3g8pt0OYFLFMFcem9KG2EBk8a7vfUvxvirUuAgCe2KAN2KH1hsQ8wGAOLKSwMCnhXIFWZ1JLi74j19wQWFnVwNgtBFcP_f1z7I-W3mQj45sw87WdU-d2UKaCrSoiu3RXMK6acbq1hA4J2F-nQHvJYnzWGg6VJI5-I0NcweMyMZi7lbzHFUQXmnN-gbKuyly12FlGCcmc7UxiPnc4gL9fIzQV1dNOkZ2Tf_OnCpyWICZAZ8DBqSf73HwREmfqlq05PelvZv_tt-GdNtqvvLiWjCYYNk_ltWLpyvE-zaWNemVusGkQ4r_msSdLUwL-oQnm-nczQmE4bQYuwY211rVc"},
              jwkPrvKey: {"alg":"RSA-OAEP","d":"bGwBxhyDQJL_k7cnUsQxgpWD2p328u4pfPGDv_VrSEXj-XsY9ysq9dji-rhGcWT4retMKpPm-FRcTDPt_7nnAme3douOcZX9-DV2XE_aJ89wNcy0dqCAtPMLvoh3lP3cNKp_YRZRwH_W0rn2S20TjK8nDstv3I12Y7uN50f1cvFd_KhwY0sRSSqAitSk-JuFYAyaUpfU_y5_s7XQitvyoXrmezZNlW8oDZmOlwBb6MIgVsl8rQHEJ36MqCeicy0iaSPKkbfYhNg0ZVNAXnEQBZc76IJxaaJ_t8UL3BdGgPvgq-8vGTdPg3ovpDPNfry1yjYulapTHsUa8h3WI0tWyszi2Jm0AcnA75Mb330r_PAl-8eoO1JYApQzH1fzurrLOnE3cm9X5yaKFmMpLAWDqFQVG-HvO1X65OnGFxREwwACUMhMsQHIuXMyTM_tqJHzPRoVspCTbhyquAd-2_tOY1Ri90svYAiWu5NyLwmSbU7A_Bhk5TqXxioyozPxcsJqB0GnDjD-AbpD92At8Y2Wv1dPm_k86s1dTetVzAf3tl7FZsiyIQ3qo6QhJ3yf4stO80UhsZweL57fxR7lqhZQ3yV7N6edZsFP9Lu-CUhFNLaigmtyDaWQe5vmCJaRpkW85X8lnWfKasMyJ5o4ayL3izFYRZBeOiyVkYO4MmgWZMk","dp":"jwsIykpbxxOlT1LOVhlAP2hPLROyWTeENbS0_QlYH_p-PYUoksA-3lBD44b6eQfNvTxQh9zi_E34bg0Ue8Qt7Kj85PRiguuv8FHK9nDCJAhVZ8YwlC-sigTNV4B6T65XnE2znCOEQunbcADtQG7pER5YoeIKLyhid9sVps6J3c5H_D2f_ncNFmuiHprpbV3CjlyzlQ3CHh8CTwUwA6QMGD1MsU2953Mp4zkzHa3VmkYAUnDd8BUncRQ8OjkebKA73S6gRDr80AnwyjX2-dM6RVoBhv1rEXmVNEDQQ7BbEj0m_FI5nKr2S30BqsiTIFhpn4yDN8To8Xu5WSua0158lQ","dq":"qHY0Mc2HBHxtuo9AJ2e28QbkprEusDDszPBGV2l5mgvyCn_BdS9M8LWza_328YEntdE-dk08APQ28-33FEH8vOrE1oHqDqlsJ7BGwq1W4mdQGC9xRJC7Zkzh51uR4QVX9L2F5MYGaIs9rQ2FJKeG8ie3mL9ruk0GJHQomRx67nyo6xqkN3G_xsM0I5Sc8A3ax-vas1ZFTIP80HbbYx8e4K2pu_us2qnV5-_E775sSyS8qT7ULb0zAlUUKlD5MyePZL86D6jSZ63i0dTIfXOuvt8jV_2KuUsLcVAYdUnFsdP0kbofXYG1I4-WK4rB_ld5An9TdoKcVam_GrXJkvAbZQ","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"qJ-9n7Lg3x3opsqG5EnTocfqwxub3Oqycgxo3aC_3OrLEEUHQusbwFTpO-05BndpyqwfBNSEfOaRNhN9gQqRshjPXsKRdS-VdJ7w6gDUPSAhqevCXqsoH3e6Epp0ceGL62jZ2gpuFhxqVJUv6S2QN1MNM3DvQ1B-wkISKFaJ4v146dvVw5kEk3ROf7HAR4szC_Y4ptxLQLQC9Cs1N1djPvdFEaD0DHJFJtkdPjWD6ofb2KslNpNacrohfYtcc0FAH-uDTIG0nJ8N86QbDojKXds0uXnWGB4kEEk3Gi9EpP2iem_1dLx0fUeQ1u9PTU6riwRfc5jZWb_SETi_1dLAwkz3g8pt0OYFLFMFcem9KG2EBk8a7vfUvxvirUuAgCe2KAN2KH1hsQ8wGAOLKSwMCnhXIFWZ1JLi74j19wQWFnVwNgtBFcP_f1z7I-W3mQj45sw87WdU-d2UKaCrSoiu3RXMK6acbq1hA4J2F-nQHvJYnzWGg6VJI5-I0NcweMyMZi7lbzHFUQXmnN-gbKuyly12FlGCcmc7UxiPnc4gL9fIzQV1dNOkZ2Tf_OnCpyWICZAZ8DBqSf73HwREmfqlq05PelvZv_tt-GdNtqvvLiWjCYYNk_ltWLpyvE-zaWNemVusGkQ4r_msSdLUwL-oQnm-nczQmE4bQYuwY211rVc","p":"1RaoeorsMF0s-YSxpZ4FqO2Xl6XHfc4yp80icmQvrT8CVty22t45dbZ791upFnxy9zmtI4n2EXBwQoIOpT1OkpvLbljLYXsKmiqXOZJB7AU44BMihTWeyVIx86yi4rv-zherzGpfidcwEF11xbfUhVIpmGodf155hl6CSUYNgITMqAnBBBRRN9rO6ZpatTK6uFFKb1Ygrbzl6GsoGPmzy96-gU_R8aUdihQ3k4oyTML5W3g16ZpxyR0RS_IJyTlX0QsxR7JzZXDVsmoHVKfX1EQlM2AbRd3Mzb9XsePCVX5iNahygtBcHfO3kG2p9FAUn0oXdrgvtMyof9wtqU4OMw","q":"ypTOI0j6GHOj1WPwatXmQLDfNLoO-N9Q35RQn6IiHBtR8nOx9Bm7ioXPEjVsJ1OYQl5Qe2NdOC-S_CXWSemxPUY_Wq-BIxnJmcdVXn8qBp1hvpUvTChqaxKFxZTcED_GjU_oyYPm6NX2736W4RI6fV2VdQ7Brd2u8Lr6RUDPL2Ycz_VTEDhAaYjvq8orxdwxAsxDBIwAmHZ0R6k2G8Xk25y_TU0evHqkAtOGaXO_RzFkPH_PztqDm5JIMfdYYYUtO2j8CPBACVIlBecWO8xBThB_gBYb5_U8tvfnyXvb9c4dvfVvpjEn61D8R8LF1CSnqp9yNJxIxbreRUVlId74TQ","qi":"AkoaqK1MUomIYtT5gx3nE01hph4SWjMQLkgzQ-INWxVIMQDjKq0iPm7hpaKN4BznqS_LXwJjwtoVkFSvH3fbL3bOo7AGEX2NfBfK7FnZhL4keFk7I0WRsNZam8o-62Gmh3idhaNJmUKkJg0ivwc_eWj3tkuAS3aLbTwRPTWLvZUrq4c7T0rc_8O-E8D175Q6YjAeIdSaxPB24gu8z8UVIpAuIV_a60NZpGaNpDnI-RNC8BISxclTXvcnJxRAGQW4pS-W7O8YkXDvloYo3cWm3nwqfr_VEjbMIeNbZYNe-jLZ6wKXoy1zVteOcAm66fPFcXIAt3FkOm5WvsXKWvk6ig"} },
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

    describe( "decrypt", function () {
        var vectors = [
            { modLen: 1024,
              jwkPrvKey: {"alg":"RSA-OAEP","d":"seb41h7ipbASU_d-aAy9kAr9EjORcT2KXC00W8RcjmVgajSWU6meqe3sLOp6mLRliGwgxRxVkzmR6x09e19Q1zIM8qyHVL1hkVVcWcvPS0wd5Dc0FhpaXBeSiRu1Vkzk-jMCA60IBzobWvvuEqglOitqBEaLPJwTM_E6N2ddggE","dp":"5KsAKE10JnaUnNbdy01W2K0eiPK0mxnystnMTJEYXWDwumUVasKj3pzFU9UOb_HBO3KK8LLqnn0KTfcfSDthAQ","dq":"QT9Csl-Z296Cc_XsI6PZI4Wxf3DzpJrdoXp8tI7T0FmdPdjUtI82Fpc0rrjtc3YvSJ0cMQNyZ0NdEQgNG6k2gQ","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"2Gpqe_IDpvHUgu5YDwfd_-hXWCFk53dawjIWOWLxsOt0-oCMipAkvS69TqykH9A-yPjjLmlezABd16S6zomJt7U37_SzAD_mUOlCujs9NM5Zzca_lZKbUXwYmuahHytpo3Mcb8P6K_VGb_Q-vS6dQpRQrBZFzpfhVyWHCKKG4vk","p":"-LWEou4KAltW9OaNzvfaGDdufODbNx92vdgGsFIAMovR5FuzHiXbbxOYEPhlcT_4lCMaY4I5LKAN6ftMRFyfmQ","q":"3sKL5BQB3ChOV7QJ8WIqButQ4qPO_0lg4MuJxqYDS9_2EhyFHOldKdbcmuFh8hJ-aQpcDChfvG-ngb-kTAv6YQ","qi":"UK__QRR5wfE9eNFWDzppJSy9sIKSG4qgkJjsakHvEl3Nr3qh4AWYtQauQwd6oofODcJZPGQsSQPI2dHfrIyKUA"},
              subvectors: [
                { text: "",
                  ciphertext: 'TKeCGtHTEpUOjSE2+rerTI3msiZu/CT5OJ58J8nFeKy9aK5kGvffXA6eCbXix0Q4gRWXwQlZ4du89DUchLDAHqaz1vDBPSTFQ47xdTxpraZehVLU8/frwONv1UA/0/7pVkr899AxtylYiybuQkhTNUNiNResebfsDpmnFYRY+ag=' },
                { text: "Hello World!",
                  ciphertext: 'UEGYBOnSU8WFJxLvG2kHMDN0y86M7xuA2c3JHovIBcUMVf2Mr12x1/n2kl2OHhTC18355GOxWA3xARbbuhRV4umUtmzIxAnI7s6FpmasJKjQkEagBXlco1DWIB3/5CyW3iUHt6RuG+mMgns4heN6F6mgDympKMM42tBHAeVjDIA=' },
              ] },
            { modLen: 2048,
              jwkPrvKey: {"alg":"RSA-OAEP","d":"gyfipW6x5_W4vzCTMsPRmqACybprwE2eJffG5E2sY40q5z7m4jGC5xsF2ayhjqBzJNQ-mrolTMU1Rrh_39nrsmVYwYZZy16v-_Nsu9Dpu4B0OGoMDK6q9ENNEKf77VTBB-uXxfEZdNdmYjgMbTsGZRo6GybnBF7UMwwpo7qUlX29I5_9Doz_nUSXHwNLGjyuIe0HKyCL-LTA-gkv8KcDDFo57ud6z-cfCOHCDF0hXMibzW5verdapwa1M2FR3SIcrnqjASbKdCM_ImmPyWgS-neWIQKbi_S3PMF-XcuhlH6m4zo0zkzSWEZLnEV2l1aB0iWyJ-MlcvdsSUaVdTw8AQ","dp":"os0biBh6nVBUlXB7yG4neHtJxx4Y40Zhf068NGeTskfPhQuAS_XDOUqIWsrzgLINBgXO5QppDyigg01ZccBMTC4JEbyjz9tNsgg2BDDptkomHXy3gGLrYurnyDbkAzw14CsJuAZuAsOsxvFX_wT8lOSP7sa9H0iTuoB0DkBq3aE","dq":"rJ5AyeUqSZpnwsiOsUeS92_yyHKUobYrfa2q0Ln_xZbU-mqL4mDuvwg65GNLQCoKvs5sA_g6-WYREUp6STVSCLgnX1aSynXQ-Q8iGj6dfEcvENjWg5CI-GOf06BwqvGhOtYvfpv5X6qZ4Rw3Eu1N-Ugksp1LZhvl5uisuAHpgAE","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"w3bzCBUL8ZV1jwM4twWbtcAfihBMEVsjVwBxDcVnqKPgqNVtnoQAubd7QDVAIYsgXn2ozLwIxcJK4CY6NI4ihfVjaDGSZDDNuTgJK5Vb_N5-5uG_mGSvtak7jDpzfo6s2Az95U7HWcoxev49Zp-0XjIAgjiQBPh83sdj1_76LFJn1Hjv8aMD9WrSH1T4Sgpa8TbH8Y73rz-qqYdBdgoyMUPiFXwXTzM_PIbQc6KD8xRdt3J9wwk0gyH4rg9Lwk6fBQ8aQb6KoItXYaM_UqQawwVM3fAwcFTbZfDtEW8GkyMXtl65D6duYq8EsF-Hc52lnW3561eCiQ5GmBl8Db81ew","p":"7hLRavTGFovBVdmHf-tvcxVO43AkkPMj83rm4lFjfr2QwNEk93GCUz-2XYRU4ceYfpl7WuaUwX6sQhEp8hJzabZ0zX2cFZB7pLqtLLtw6kUTJTbdtcEv1VqibarjitTpxSVv-j4vB6_X2LBjWXWZ95kdoaBI9-X4KFRZpuod93s","q":"0i7KAgHFKz8-2Fp9Yh9fk6XLTX7EvRVe6jPwxbr60sCBwZiIvKLvaPmUJn93MFk9rthTzB69RKWko5fzTxDfHZNA8uarOspAc4Um2wTUwEAhSzlqEO19wmtDiPsmaJJ5XM0P7Xx2FhZ-r5dmzo5Pob3IkwjRcWxsYSw7NX3gWgE","qi":"e8fTmmGqhmg79ixR1h94GhGoL9Tk8XCWbt3Aibw5PooTrN8dYOrM6IxLG3g98HHVpgHOcVxJfLI5m8btaGtXkQ7s6Ga8i7rsN0kTO7lrd06dVllsznUBqe2txSzPw0NYhv-8KHhj4x9QtTEewfCnarLqytd1I64xOoWODeB-TJw"},
              subvectors: [
                { text: "",
                  ciphertext: 'onOPhl9Zwldpdk0V9axvLzEQXpHlOOgaTfP8/lAg/PF050/5BGyxhPGrQcTkdvL1VJzs743+feXWj0/8UVlYcbEOurKf0NkTxNN9lD6jMyVIibnstjz5vpubk6l7o7WCPQ4cB/f/Jty47DgRjOA+HPBf2E9fmXh0AYeCEDIgpU4DBj0BAmxZgt4SrQdTzjtNNzeEAl9LQk/ePz0e4qfuBIcM7eiuY+8Lc/ww/1Cd7DegjhwBAwEoYUd8v5RdRpi3sVuNoxyYKIQJPyxkt4dLVxJyDmh6ZmjFlnrOVsHtQrlnbLdfwQYzAzgSIVb4iZ9l7TfFjzEXjLgtiJuDwT6WSQ==' },
                { text: "Hello World!",
                  ciphertext: 'Di/y9DtmRhUoyz6Tpn2EEuNStsgTkmKcCCHRqvCEOUtBxNFAnU0FJtovISvWHiOjQKbAHY7OlgcAJMXbGSVr9QtijKWvuxb+V6Yrucj48tdwqQByZDS9F26NCydGZOSOrqNo92hGIGT5/whBd3a8spnCq89u9ABhhK7Ak57IysXhYjYTJnPU82w+w16tsMtulmsWSy23hlyBYFRvGNF0OekzndrkM4EvALHuk70VWV07SUppeVNJklvCh0VQ0N7VtZe2PGeAoya21hKGNupmYBTKE1L4PG8K5wbdqnDQJnjnEJxIjqOjHBzGsFuw3dOH4+uUmtYpFHhYDKFwZIXfjw==' },
              ] },
            { modLen: 3072,
              jwkPrvKey: {"alg":"RSA-OAEP","d":"E4nJGN7BXxiK6CpDkikiVopZuhEOxJo17oYL2XHAo5etT5rLru8pDylJnzAyumdBR8Zslv5qTxO3hd4bvVGzPL1E9qcOkgNWqFLHVbUthMQb9x1g8NZOO6csVlewEp704saMYImrZvNeDcLqqn6KRxV9DPl3rVIoLE_zb9Yiv5FpCrJO4j5u0fnuyIiXihlNu5ptocK7opOFyAF9-TmOVTVkXDOAwlPSxs1qP8pmygS0B1Zf9GGaUea4il32n9SgnGZz8zDzzpNnscb87ytklvazHKDrsXyx9ODuHe0JBST4EIjOHV9-8w_QaQ8dScosOzOiGr1aDT0g1H_mNkOPQZdguRJwwMZp-HihLlcif_dzVdOWRFBXtjRYHSi57t92rfAkPBHaTu0NzR1gokEAFUbxIzAJN_maAuah2xXwZV3x92ayDzKXsiVC3-mqkQRji2OQ9adxYsO6R9fCZ8s5Dv_1F3kjUSAK5If9wKUD-34kHbCtGx5RL2HO4Z4DJ16J","dp":"X-iT-xicpzzrQ8hDkV0eCyl-EGwJHGsRvsK2WqOV4-162yKhddqtGb3mfhrWcc62NvGOZmya_DlyYdYNdjUnuOo-4IntACWruGXeUEsWftPNyngxclj5PMC19h32F_luDJ3cydyU04AL676jjmy_PEPIvDEuZMC5MolhFtZSLNLtumbb22vfvnYDJMLsQH1_Y3X_wH0-Nkc5fdxmiqrlKXXw9bKs9medGgZ_q-whn9-zfABhcJYdGMvz7ZA2R8D3","dq":"cq9mPn8PpEza3MC-qqzXVLQcW9xONWHlLZe8WYrmdKXmy5ulrkCre--Bwg5Z0cUKNi3lVjVrQ1VvKIOhhQI1gNcbox5dFA7GUXA1jzTG0PQnjO9N8BO1ofSHldQ44aXZbm1eyVRp9YjJXVAHzyB8ikH8FBzzg8p2ooN-qPQQyK3BpBKyP3d7b8kRBXoRYcmnJZ7t_bjGiGOA8xy6LCzam0bSpr8SPCLkTFm2fGq3bXcg6JqxJBsfiB10SZ6bAqd3","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"vLGhydJcuMXAzNBhpcn_O7Tcx-Ur5hUSD2QPX1pkP2Oz63tVP2jMjjw8-yoY_xgOcx_ty3McDEyalIvLA0xzh5oOe7zlaB3nPWUDkIFKirzNWBmnqCX9z3aufw7Nwyav3NG3r1imnaSX2M2KWiHUmjW5n4UKvlpLPaWaIp18Lbp1Z0QKIYyaO-9uBdyKoG_17IpFHmt-IBwUp8WtQk1k-u875Dq8ZBFlIDlhmgRSjrsxHn8uWr--VxuhlA0Dw8NcrXJVPTMI9PatqkHAnwxk8lECL3_oCADmzJIqNG4hf3NVp5W-w-N4XU1_mWD_dfnkc0EhZZARq1jltrXdon1DzlBWXrVh20gzUbg_tXY1IgJ4Ff3Ij7iv2PUj7GTkPwTSk11kM2WnvcSlaQaHElod98UNnyv8tW95861QWLuRddaExvLF-thYtJZtws3YxxnhMlwpr6MW5dhYRb7WBXgYyyaoOg4opOXKIh3pali-dp6aDo7JU_PJ2I8mlchSF-uJ","p":"7WD_lMSRccxgpgPXctpvFqXRl7PA2k5Z8yVbwMou4qHP1vu0F1v7NWzzjqouoCIb6v-xpmgFu0OxGhQzDL0gIKiH_4svsXGqdTYZfIwswx-Ng4OhKWmKvk4f6ZuqyQhX_7p7Jhh8cqH5BIU4BGlb54y6XGMQe74LTfCL_sujVU_Qo7R02cKjeG6x-guNre9thOaOR5KLlR_B3UV4ABdbOKzPguRdjvKQ-nnGk2-JKReh1JbV2NcSdw_4DFZ4LGNr","q":"y37zDxWMu0EAPWgivBCe7UZ2QhXuMuOJsk8KtBsylkE3vk9lz2bOnsG1R56oqX-7p2vdgvfhSV7XciA-YmDKE5BUWl4cnU6fPIhsuyDG_WhWV12OFxByCrr_bV1KYG4ysimUxFapVxScxKigoRSoxv7RLl6GEP6xZrZ55LJOuoFyhXQh-jQn4-svQMdUlENnieF8k7wTuFi6L_YAGnE7VofgbsxuucZn1h9Vl85mZrkB4-0hvTpH9A7AjaLdQ13b","qi":"R0dC1GzG1cI9jfKMK1Rq-W2K5buyEg3b_YLILaBohVrvcmnwPZUziY0nW_JVM_J3A1XGmOb-1kgdTFUOPWFu5bGMrLNqI0R0EhlPXwa_Bhbn4aKzGfxRegPIBwoqwaQNaGBifLZBqdMxjEdjfNXApMEJYb0y3UvABRVRtkiIfpulrE-aZqelh7ELmuFc1W21m9Qru6_zv9RuzPla-orl4x9HKqGZFlCyasGimJ7iAtkZcaIik551es2KuUablcH5"},
              subvectors: [
                { text: "",
                  ciphertext: 'ssMzh73T84FZbRCp1LL7FnMPp/YqXjLnpUOPTqV++2GeZ2/L190FXedjyRrKb5hy8ctNzLqkW+KVwCDOC+J1HUlAjvZcI8071WpNz+FjVQMl9Tp+sbm1/Q6uswIAF6IWcufrFtxuGHiGuumyWZ6zIiN9+ygwjjIMciHb4eOjnao/dZHpyXDmruBVdOSywwlub59jvVcN87ycQoI4tERsZ57U4V/KeDuSe9TJQyV4yo/51szbVoUrmm4A8LeYAyb2PY1w6JSIoqdUh/dWG/xb51kWGJeVN7MJtfEINC/dz9IfGX7kj3kQ/Hm+3842XBwAhCoppopZKlJgnCQQNQU85GTnfidsQqCfwIekAVldR2mOHhaDcVlC0nZ4WWbbeAAZLzfMPDI0DfugllNGJf8qaGyGZscnukPaOcFPTXed1kCMerI/kiPZwYY+p7IR8pC7uq7zYvxH5VcBXzbkJYuhu7+d4Idb9pmb+CYiSQMgcoq3ravuOgMvwMhvJJTGhM50' },
                { text: "Hello World!",
                  ciphertext: 'gzu26BVAirq2HBADWGwfEKzmXowQuhAnNZ++HZ1EDDXwkPjlTJgS+LLu3wOS1Ga3jT7AGoRoIVtm2OKJjVfBCqc8uSpiZxMYj7qy1KMJ12SVVpziSZq6Njyr5PTjgISy/64CFumBpCphBjhszl8UTXk0slIcKVqyH/JI0gJae82VdWc/t/fiTISVhA60RNukGl0WCaVdI8EhN5KdeXJHrKcJNuT9aIU7qbELUrJ2x4Zmstteng2IXdEy8bSE17QCIu6mmdliUrWKsjnEcRyAlNiFOyNdPvAsMmJsLOrzgpv6cvEOrRd0nL95Pucn0gzB8mVOuqG73wpknmujKZqFXtUsEVTZd4qs7MsdEbpzscblEX/rrMWn0qLq3Kgwu8AchKavbVBZS6srneAMTy0Bg7bHTsh/PwS373mHaYJMPQwOqScelgbpZKcxv805Tc1q7SnLTZlybY+JfvY6GoPLgHLzwQyUAh96dFeOq74lEsjVNoZAc4f/RrqbaUp7bdYt' },
              ] },
            { modLen: 4096,
              jwkPrvKey: {"alg":"RSA-OAEP","d":"bGwBxhyDQJL_k7cnUsQxgpWD2p328u4pfPGDv_VrSEXj-XsY9ysq9dji-rhGcWT4retMKpPm-FRcTDPt_7nnAme3douOcZX9-DV2XE_aJ89wNcy0dqCAtPMLvoh3lP3cNKp_YRZRwH_W0rn2S20TjK8nDstv3I12Y7uN50f1cvFd_KhwY0sRSSqAitSk-JuFYAyaUpfU_y5_s7XQitvyoXrmezZNlW8oDZmOlwBb6MIgVsl8rQHEJ36MqCeicy0iaSPKkbfYhNg0ZVNAXnEQBZc76IJxaaJ_t8UL3BdGgPvgq-8vGTdPg3ovpDPNfry1yjYulapTHsUa8h3WI0tWyszi2Jm0AcnA75Mb330r_PAl-8eoO1JYApQzH1fzurrLOnE3cm9X5yaKFmMpLAWDqFQVG-HvO1X65OnGFxREwwACUMhMsQHIuXMyTM_tqJHzPRoVspCTbhyquAd-2_tOY1Ri90svYAiWu5NyLwmSbU7A_Bhk5TqXxioyozPxcsJqB0GnDjD-AbpD92At8Y2Wv1dPm_k86s1dTetVzAf3tl7FZsiyIQ3qo6QhJ3yf4stO80UhsZweL57fxR7lqhZQ3yV7N6edZsFP9Lu-CUhFNLaigmtyDaWQe5vmCJaRpkW85X8lnWfKasMyJ5o4ayL3izFYRZBeOiyVkYO4MmgWZMk","dp":"jwsIykpbxxOlT1LOVhlAP2hPLROyWTeENbS0_QlYH_p-PYUoksA-3lBD44b6eQfNvTxQh9zi_E34bg0Ue8Qt7Kj85PRiguuv8FHK9nDCJAhVZ8YwlC-sigTNV4B6T65XnE2znCOEQunbcADtQG7pER5YoeIKLyhid9sVps6J3c5H_D2f_ncNFmuiHprpbV3CjlyzlQ3CHh8CTwUwA6QMGD1MsU2953Mp4zkzHa3VmkYAUnDd8BUncRQ8OjkebKA73S6gRDr80AnwyjX2-dM6RVoBhv1rEXmVNEDQQ7BbEj0m_FI5nKr2S30BqsiTIFhpn4yDN8To8Xu5WSua0158lQ","dq":"qHY0Mc2HBHxtuo9AJ2e28QbkprEusDDszPBGV2l5mgvyCn_BdS9M8LWza_328YEntdE-dk08APQ28-33FEH8vOrE1oHqDqlsJ7BGwq1W4mdQGC9xRJC7Zkzh51uR4QVX9L2F5MYGaIs9rQ2FJKeG8ie3mL9ruk0GJHQomRx67nyo6xqkN3G_xsM0I5Sc8A3ax-vas1ZFTIP80HbbYx8e4K2pu_us2qnV5-_E775sSyS8qT7ULb0zAlUUKlD5MyePZL86D6jSZ63i0dTIfXOuvt8jV_2KuUsLcVAYdUnFsdP0kbofXYG1I4-WK4rB_ld5An9TdoKcVam_GrXJkvAbZQ","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"qJ-9n7Lg3x3opsqG5EnTocfqwxub3Oqycgxo3aC_3OrLEEUHQusbwFTpO-05BndpyqwfBNSEfOaRNhN9gQqRshjPXsKRdS-VdJ7w6gDUPSAhqevCXqsoH3e6Epp0ceGL62jZ2gpuFhxqVJUv6S2QN1MNM3DvQ1B-wkISKFaJ4v146dvVw5kEk3ROf7HAR4szC_Y4ptxLQLQC9Cs1N1djPvdFEaD0DHJFJtkdPjWD6ofb2KslNpNacrohfYtcc0FAH-uDTIG0nJ8N86QbDojKXds0uXnWGB4kEEk3Gi9EpP2iem_1dLx0fUeQ1u9PTU6riwRfc5jZWb_SETi_1dLAwkz3g8pt0OYFLFMFcem9KG2EBk8a7vfUvxvirUuAgCe2KAN2KH1hsQ8wGAOLKSwMCnhXIFWZ1JLi74j19wQWFnVwNgtBFcP_f1z7I-W3mQj45sw87WdU-d2UKaCrSoiu3RXMK6acbq1hA4J2F-nQHvJYnzWGg6VJI5-I0NcweMyMZi7lbzHFUQXmnN-gbKuyly12FlGCcmc7UxiPnc4gL9fIzQV1dNOkZ2Tf_OnCpyWICZAZ8DBqSf73HwREmfqlq05PelvZv_tt-GdNtqvvLiWjCYYNk_ltWLpyvE-zaWNemVusGkQ4r_msSdLUwL-oQnm-nczQmE4bQYuwY211rVc","p":"1RaoeorsMF0s-YSxpZ4FqO2Xl6XHfc4yp80icmQvrT8CVty22t45dbZ791upFnxy9zmtI4n2EXBwQoIOpT1OkpvLbljLYXsKmiqXOZJB7AU44BMihTWeyVIx86yi4rv-zherzGpfidcwEF11xbfUhVIpmGodf155hl6CSUYNgITMqAnBBBRRN9rO6ZpatTK6uFFKb1Ygrbzl6GsoGPmzy96-gU_R8aUdihQ3k4oyTML5W3g16ZpxyR0RS_IJyTlX0QsxR7JzZXDVsmoHVKfX1EQlM2AbRd3Mzb9XsePCVX5iNahygtBcHfO3kG2p9FAUn0oXdrgvtMyof9wtqU4OMw","q":"ypTOI0j6GHOj1WPwatXmQLDfNLoO-N9Q35RQn6IiHBtR8nOx9Bm7ioXPEjVsJ1OYQl5Qe2NdOC-S_CXWSemxPUY_Wq-BIxnJmcdVXn8qBp1hvpUvTChqaxKFxZTcED_GjU_oyYPm6NX2736W4RI6fV2VdQ7Brd2u8Lr6RUDPL2Ycz_VTEDhAaYjvq8orxdwxAsxDBIwAmHZ0R6k2G8Xk25y_TU0evHqkAtOGaXO_RzFkPH_PztqDm5JIMfdYYYUtO2j8CPBACVIlBecWO8xBThB_gBYb5_U8tvfnyXvb9c4dvfVvpjEn61D8R8LF1CSnqp9yNJxIxbreRUVlId74TQ","qi":"AkoaqK1MUomIYtT5gx3nE01hph4SWjMQLkgzQ-INWxVIMQDjKq0iPm7hpaKN4BznqS_LXwJjwtoVkFSvH3fbL3bOo7AGEX2NfBfK7FnZhL4keFk7I0WRsNZam8o-62Gmh3idhaNJmUKkJg0ivwc_eWj3tkuAS3aLbTwRPTWLvZUrq4c7T0rc_8O-E8D175Q6YjAeIdSaxPB24gu8z8UVIpAuIV_a60NZpGaNpDnI-RNC8BISxclTXvcnJxRAGQW4pS-W7O8YkXDvloYo3cWm3nwqfr_VEjbMIeNbZYNe-jLZ6wKXoy1zVteOcAm66fPFcXIAt3FkOm5WvsXKWvk6ig"},
              subvectors: [
                { text: "",
                  ciphertext: 'fIIhjRQ9lH6uVsISeJgcz/S+6y3EOpoGQs7j98JvuQmd5P2/ak0L3d1IaTFQTHirXKbSu5RNmVKxnGjNsP33Ch3yEazUsUw6PvjZaB7neCEWuVZQBtjbIr10K8BIZ+4Kqu72IpAPsmzXDOadTWC1tFUDVkAI3aOblXJssIwHFmc1rfwuHOSurkot7LL2oy8H4DANU9ypxuLR4s2a0KCg0R9XboOU/dFoEwt0oj9KRT6Z5b//B0pw4stFb7X7qP1ifbogqBFw3aza4JBhaoq/vN11QW2LS3WmWKdAiqngnks9Yq3yfyiYlSuaSF+DD9ysauPID77xNb1NSjzFMdS/KzQWdIZx0A3+nPCgSmn9UGJH7LrEgfCQH9IpnOWAPNsyVApT+qG1Z3YHLKKgdRIaCgfKiJyyl9DwiFeDIHOVzSxaJb+KoerU2gkLYh5bQ+Ns3+tCXI/cXYVyY4Kn4HfXF/N6SrIgkBs4/IlhHn886PQW++0XP8RzUWK3KnOCWCs+2UXh/92K/2iaSQGwF9s/ke6DiKygwvEzmNgO20k8NTKcHo/Wq98yop2+KvkeR9Mxr1aioeUAVZU+ZMmY115Vo3/2JV+UE8HlDN+9+o9LJNaGIj98ZCrUAACTIHCK/HY+VBrzilZLhsbrsoVO7ve7Wh8roEqstFMTZ+3gUeZUsiI=' },
                { text: "Hello World!",
                  ciphertext: 'ZPn/xhqsZ10ZwEED71HNfFEk6jhiTFzf2cwMKL/yEco0NsT3UNxEDPTuCkqYh5A3QT/4Ifc5PPHScIUjImbfYJ0JkhxGWu9u/bvWRkRd1YCYidIujcnxuOkd+NoJaPBG5FUSp0m++q9GbcvDTjgErcU3zEjB99HFL76pLKuzxBUn8U4b5N3DdGiKZ586bGzP2lPLHT3rLLBQJS7Sp0pxxpAVvM4ttP/lB9k2pQQxavkAtYOSkY5O26b64D0Jl5qQ6D4K5jsjYyjUtOu52khGr2kZWNypXtyRUlY63R0plTOh6JzZh1M29gJxO7Vs3/nt0mwrupIbx3ROlEznJ4YRN4i3C4vpM5LRjbeT5Hb7oGf8hNasAmRZR1FgwVyJ6yIy0bOPG41CeL7UXi0XDemHKPJazdY2lMHR0TVGMmbV9hkd6NNC8hivurupkiKZP9Q8E/MGT+8nSusYxLT6NXmxzkRyr1XVfmNXDIsBepVrEhwEXkoFkGw3xPKbUqt78tfpUzhavniSqi2mQzIDuSENnwFSy0cYinuyYxyYaDKR10H3HgrbvA3iNSTAMjcRFa5KeuCsTchD1ttWBzRHrlDgkdqIQMsLSaqHHhPxEUFDIGwBB2EOkD0/nwj09uh7JBfXzCvOII9ybc19++8SuRy6jWNu80RqlH2IOIwPiBniePg=' },
              ] },
        ];

        vectors.forEach( function ( v ) {
            describe( v.modLen + " bits", function ( done ) {
                v.subvectors.forEach( function ( sv ) {
                    it( "'" + sv.ciphertext + "'", function ( done ) {
                        crypto.subtle.importKey( "jwk", v.jwkPrvKey, alg, true, [ prvUse ] )
                            .then( function ( key ) {
                                return crypto.subtle.decrypt( alg, key, s2b( atob(sv.ciphertext) ) );
                            })
                            .then( function ( plaintext ) {
                                expect( b2s(plaintext) ).toBe(sv.text);
                            })
                            .catch(fail)
                            .then(done);
                    });
                });
            });
        });
    });

    describe( "unwrapKey", function () {
        var vectors = [
            { modLen: 2048,
              jwkWrapKey: {"alg":"RSA-OAEP","e":"AQAB","ext":true,"key_ops":["encrypt","wrapKey"],"kty":"RSA","n":"vEsQ2OX9oR6ygnUZv2O7IA6TiXdHHyQSxDI_tJxGaQiqiWz5rQ9waWQL64-Dvo1F7-2A_oYoMW0MdcS5Vpqci4NLxHizohZ6Q1fhin5CttYqkm-s8scePCrbDI2FKcmGxgLA-zHSiOxqxuKIh8AqVwqCSfcP9IQnXAAP3mrC3RCamcYiWvzK17gXihb6oB3C_Mcr7oVpwq9M-IQuv2PSDtha4LdgOmOlHymlp1VyU_pHwj2Y3Y8qLWYu_AO1_Hvkybxj8q6TUwRhbZrFHSWBJRL2SweCbEanyL8l5Ml6WoTq3RkikA_2y8Hm191uwCsKytn4BM7Q0Fcvm_IH0eVXjQ"},
              jwkUnwrapKey: {"alg":"RSA-OAEP","d":"YOFesbrkXNomjukhblAqH7xgPQKaHXO6FCimjo85yyEiXcMsU9b1x8QqPfGBn7GgompZTJxKYePx3UZy9hRnJ4FOorBX_LYEAlJdQZzlRp27Gc1L9z5sWBjUzAik03NVXNxd3uErqje6WMqF5RMCtfY6Q0RTeUPl3HhLsezMhmD5ff4fMJuzWZEA_DsSGa50Jki74YKEKWFPzP8pRMoFw754leguS33TY2mSRQi0BDOeveqAQvIlvVE_3-sX8xhInovzkZEYNOf3r_2h8oQ1xG1C6KtF0URo54uHx3OJ2omiQxQjfV4ZnWK7-ENW0-Ae6z_tNXbaYNeFsxO4U1_kAQ","dp":"amUYdod7LMkxZZ_oGMh5zyb3LDYlDhlhpgJw1Pb-IDxcaqVGLlwilSUc0GR1MFtFMR7tl5EdT74DQjeKwYfGCDu6rwJlMfcQZBY1flkuhwju64rvncac_AWHowlkggEaRKbCtH6saktF8Cy0Gp4QgFe-jdi_LkeiygT77Wz3b_E","dq":"X7pSwpOzjPDkmerbZM7n03kxkvTw2IAsLT8SLeKWQJ-5O-xuInqjonOuXQGWXpLQotIa_D_AmX0T9Q8OOwi6ebvXBFIGgDGgF7yTU84bW1ygcvs0OComfE9Dyq-oGexbQp5kbWPw6EpfYh9DMR-5hH26NdX2or979D8ZZeyCIwE","e":"AQAB","ext":true,"key_ops":["decrypt","unwrapKey"],"kty":"RSA","n":"vEsQ2OX9oR6ygnUZv2O7IA6TiXdHHyQSxDI_tJxGaQiqiWz5rQ9waWQL64-Dvo1F7-2A_oYoMW0MdcS5Vpqci4NLxHizohZ6Q1fhin5CttYqkm-s8scePCrbDI2FKcmGxgLA-zHSiOxqxuKIh8AqVwqCSfcP9IQnXAAP3mrC3RCamcYiWvzK17gXihb6oB3C_Mcr7oVpwq9M-IQuv2PSDtha4LdgOmOlHymlp1VyU_pHwj2Y3Y8qLWYu_AO1_Hvkybxj8q6TUwRhbZrFHSWBJRL2SweCbEanyL8l5Ml6WoTq3RkikA_2y8Hm191uwCsKytn4BM7Q0Fcvm_IH0eVXjQ","p":"89ahUS3Qssx0TDayMVmnVUTGRKh1NKlNvIAdbgpE49clxRK8UTxrJxCrN5-CI0_eTpou0zDsWTHWZEp0v2MUhMvaI2zKShdwuEL6NDKtiIkhhYyUU_4XTLCkzI0n4tR1XMp1oGbaKIiBu1dy1YOOHMr06dPtldnWQuO6aJIlJG0","q":"xa85u0K2HZd4T6DsDonQZO_X1G28WXM6YYjeWqRVNWqfXCInfCqkBJOHEmQudvFYQuCvIKzr4Ds4WqC2UiQuvcazh8jY-c5P93Rw70w0vByeW_z15UU7fIeE0splZKRXXlwUfL58Y1eA18kPrzqd4VdNRiXqpUCWIed1bMjjy6E","qi":"qHAp5_62ytVWUXtBNOS6OXVxoMx22sn3x0h6k3owUvAeGLjPg_pTfKKlLxH7EEEnu3iFoAAxaYRfTmnhguwlhI9gq2tdg2mEXPTAZgYBHpdfAAULKKobDuk8rtHwTXxupEXKfeNzUPliH-PfaIGdjp6OVjiH1qWLImnkZu7PYS4"},
              wrappedSecret: 'DyW4O4mImw/HG/dEA4TlY1eel6wGZ3AheqgSEQ4ruxuotGQbMBW2XTKFJWS5HlY3Be1zsOYg+RJzr+69Ma5RodE9Q+huI0CLKxs99nrADPDjIpQu1wWKipgjWY7iCSooMQkfAdmhWbrIhTfzTrYk4NANFUT5fHbmMy1I9BGbHolPxerKIF85KNGEzRt3a5vokyTedwdBWqNIyfVa5DY4FSTY7Fyv7Na3wTR1Yx/tj0pDXR10HZBcGTPn0rzzs9667wv+3Kbggk11eWQkOvKop2R/p37/zKoMXgprGd6OvoXDeZFVE9dNzCoNIxbLV2o4dXgKFuBOFclINnjOyqfgGA==',
              secretIv: '16eu2GxWu4Wo/ly1uOas6Q==',
              secretAlg: { name: 'AES-CBC', length: 128 },
              ciphertext: 'lXIyndrvPD+XxeYLLmpNrg==',
              text: 'test' },
        ];

        vectors.forEach( function ( v ) {
            describe( v.modLen + " bits", function ( done ) {
                var unwrapKeyAlg = extend( normalizeAlg(alg), { modulusLength: v.modLen, publicExponent: x2b('10001') } );

                it( "'" + v.wrappedSecret + "'", function ( done ) {
                    crypto.subtle.importKey( "jwk", v.jwkUnwrapKey, alg, false, [ 'unwrapKey' ] )
                        .then( function ( unwrapKey ) {
                            expect(unwrapKey).toEqual(jasmine.any(CryptoKey));
                            expect(unwrapKey.type).toBe('private');
                            expect(unwrapKey.extractable).toBe(false);
                            expect(unwrapKey.algorithm).toEqual(unwrapKeyAlg);
                            expect(unwrapKey.usages).toEqual(['unwrapKey']);
                            return unwrapKey;
                        })
                        .then( function ( unwrapKey ) {
                            return crypto.subtle.unwrapKey( "raw", s2b( atob(v.wrappedSecret) ), unwrapKey, alg, v.secretAlg, false, [ prvUse ] )
                        })
                        .then( function ( secretKey ) {
                            expect(secretKey).toEqual(jasmine.any(CryptoKey));
                            expect(secretKey.type).toBe('secret');
                            expect(secretKey.extractable).toBe(false);
                            expect(secretKey.algorithm).toEqual(v.secretAlg);
                            expect(secretKey.usages).toEqual([prvUse]);
                            return crypto.subtle.decrypt( extend( v.secretAlg, { iv: s2b( atob(v.secretIv) ) } ), secretKey, s2b( atob(v.ciphertext) ) );
                        })
                        .then( function ( plaintext ) {
                            expect( b2s(plaintext) ).toBe(v.text);
                        })
                        .catch(fail)
                        .then(done);
                });
            });
        });
    });
});

/*

var vectors = [
    { modLen: 1024,
      spkiPubKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYamp78gOm8dSC7lgPB93/6FdYIWTnd1rCMhY5YvGw63T6gIyKkCS9Lr1OrKQf0D7I+OMuaV7MAF3XpLrOiYm3tTfv9LMAP+ZQ6UK6Oz00zlnNxr+VkptRfBia5qEfK2mjcxxvw/or9UZv9D69Lp1ClFCsFkXOl+FXJYcIoobi+QIDAQAB',
      pkcsPrvKey: 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBANhqanvyA6bx1ILuWA8H3f/oV1ghZOd3WsIyFjli8bDrdPqAjIqQJL0uvU6spB/QPsj44y5pXswAXdekus6Jibe1N+/0swA/5lDpQro7PTTOWc3Gv5WSm1F8GJrmoR8raaNzHG/D+iv1Rm/0Pr0unUKUUKwWRc6X4VclhwiihuL5AgMBAAECgYEAseb41h7ipbASU/d+aAy9kAr9EjORcT2KXC00W8RcjmVgajSWU6meqe3sLOp6mLRliGwgxRxVkzmR6x09e19Q1zIM8qyHVL1hkVVcWcvPS0wd5Dc0FhpaXBeSiRu1Vkzk+jMCA60IBzobWvvuEqglOitqBEaLPJwTM/E6N2ddggECQQD4tYSi7goCW1b05o3O99oYN2584Ns3H3a92AawUgAyi9HkW7MeJdtvE5gQ+GVxP/iUIxpjgjksoA3p+0xEXJ+ZAkEA3sKL5BQB3ChOV7QJ8WIqButQ4qPO/0lg4MuJxqYDS9/2EhyFHOldKdbcmuFh8hJ+aQpcDChfvG+ngb+kTAv6YQJBAOSrAChNdCZ2lJzW3ctNVtitHojytJsZ8rLZzEyRGF1g8LplFWrCo96cxVPVDm/xwTtyivCy6p59Ck33H0g7YQECQEE/QrJfmdvegnP17COj2SOFsX9w86Sa3aF6fLSO09BZnT3Y1LSPNhaXNK647XN2L0idHDEDcmdDXREIDRupNoECQFCv/0EUecHxPXjRVg86aSUsvbCCkhuKoJCY7GpB7xJdza96oeAFmLUGrkMHeqKHzg3CWTxkLEkDyNnR36yMilA=',
      jwkPubKey: {"alg":"RSA-OAEP","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"2Gpqe_IDpvHUgu5YDwfd_-hXWCFk53dawjIWOWLxsOt0-oCMipAkvS69TqykH9A-yPjjLmlezABd16S6zomJt7U37_SzAD_mUOlCujs9NM5Zzca_lZKbUXwYmuahHytpo3Mcb8P6K_VGb_Q-vS6dQpRQrBZFzpfhVyWHCKKG4vk"},
      jwkPrvKey: {"alg":"RSA-OAEP","d":"seb41h7ipbASU_d-aAy9kAr9EjORcT2KXC00W8RcjmVgajSWU6meqe3sLOp6mLRliGwgxRxVkzmR6x09e19Q1zIM8qyHVL1hkVVcWcvPS0wd5Dc0FhpaXBeSiRu1Vkzk-jMCA60IBzobWvvuEqglOitqBEaLPJwTM_E6N2ddggE","dp":"5KsAKE10JnaUnNbdy01W2K0eiPK0mxnystnMTJEYXWDwumUVasKj3pzFU9UOb_HBO3KK8LLqnn0KTfcfSDthAQ","dq":"QT9Csl-Z296Cc_XsI6PZI4Wxf3DzpJrdoXp8tI7T0FmdPdjUtI82Fpc0rrjtc3YvSJ0cMQNyZ0NdEQgNG6k2gQ","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"2Gpqe_IDpvHUgu5YDwfd_-hXWCFk53dawjIWOWLxsOt0-oCMipAkvS69TqykH9A-yPjjLmlezABd16S6zomJt7U37_SzAD_mUOlCujs9NM5Zzca_lZKbUXwYmuahHytpo3Mcb8P6K_VGb_Q-vS6dQpRQrBZFzpfhVyWHCKKG4vk","p":"-LWEou4KAltW9OaNzvfaGDdufODbNx92vdgGsFIAMovR5FuzHiXbbxOYEPhlcT_4lCMaY4I5LKAN6ftMRFyfmQ","q":"3sKL5BQB3ChOV7QJ8WIqButQ4qPO_0lg4MuJxqYDS9_2EhyFHOldKdbcmuFh8hJ-aQpcDChfvG-ngb-kTAv6YQ","qi":"UK__QRR5wfE9eNFWDzppJSy9sIKSG4qgkJjsakHvEl3Nr3qh4AWYtQauQwd6oofODcJZPGQsSQPI2dHfrIyKUA"},
      subvectors: [
        { text: "",
          ciphertext: 'TKeCGtHTEpUOjSE2+rerTI3msiZu/CT5OJ58J8nFeKy9aK5kGvffXA6eCbXix0Q4gRWXwQlZ4du89DUchLDAHqaz1vDBPSTFQ47xdTxpraZehVLU8/frwONv1UA/0/7pVkr899AxtylYiybuQkhTNUNiNResebfsDpmnFYRY+ag=' },
        { text: "Hello World!",
          ciphertext: 'UEGYBOnSU8WFJxLvG2kHMDN0y86M7xuA2c3JHovIBcUMVf2Mr12x1/n2kl2OHhTC18355GOxWA3xARbbuhRV4umUtmzIxAnI7s6FpmasJKjQkEagBXlco1DWIB3/5CyW3iUHt6RuG+mMgns4heN6F6mgDympKMM42tBHAeVjDIA=' },
      ] },
    { modLen: 2048,
      spkiPubKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw3bzCBUL8ZV1jwM4twWbtcAfihBMEVsjVwBxDcVnqKPgqNVtnoQAubd7QDVAIYsgXn2ozLwIxcJK4CY6NI4ihfVjaDGSZDDNuTgJK5Vb/N5+5uG/mGSvtak7jDpzfo6s2Az95U7HWcoxev49Zp+0XjIAgjiQBPh83sdj1/76LFJn1Hjv8aMD9WrSH1T4Sgpa8TbH8Y73rz+qqYdBdgoyMUPiFXwXTzM/PIbQc6KD8xRdt3J9wwk0gyH4rg9Lwk6fBQ8aQb6KoItXYaM/UqQawwVM3fAwcFTbZfDtEW8GkyMXtl65D6duYq8EsF+Hc52lnW3561eCiQ5GmBl8Db81ewIDAQAB',
      pkcsPrvKey: 'MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDDdvMIFQvxlXWPAzi3BZu1wB+KEEwRWyNXAHENxWeoo+Co1W2ehAC5t3tANUAhiyBefajMvAjFwkrgJjo0jiKF9WNoMZJkMM25OAkrlVv83n7m4b+YZK+1qTuMOnN+jqzYDP3lTsdZyjF6/j1mn7ReMgCCOJAE+Hzex2PX/vosUmfUeO/xowP1atIfVPhKClrxNsfxjvevP6qph0F2CjIxQ+IVfBdPMz88htBzooPzFF23cn3DCTSDIfiuD0vCTp8FDxpBvoqgi1dhoz9SpBrDBUzd8DBwVNtl8O0RbwaTIxe2XrkPp25irwSwX4dznaWdbfnrV4KJDkaYGXwNvzV7AgMBAAECggEBAIMn4qVusef1uL8wkzLD0ZqgAsm6a8BNniX3xuRNrGONKuc+5uIxgucbBdmsoY6gcyTUPpq6JUzFNUa4f9/Z67JlWMGGWcter/vzbLvQ6buAdDhqDAyuqvRDTRCn++1UwQfrl8XxGXTXZmI4DG07BmUaOhsm5wRe1DMMKaO6lJV9vSOf/Q6M/51Elx8DSxo8riHtBysgi/i0wPoJL/CnAwxaOe7nes/nHwjhwgxdIVzIm81ub3q3WqcGtTNhUd0iHK56owEmynQjPyJpj8loEvp3liECm4v0tzzBfl3LoZR+puM6NM5M0lhGS5xFdpdWgdIlsifjJXL3bElGlXU8PAECgYEA7hLRavTGFovBVdmHf+tvcxVO43AkkPMj83rm4lFjfr2QwNEk93GCUz+2XYRU4ceYfpl7WuaUwX6sQhEp8hJzabZ0zX2cFZB7pLqtLLtw6kUTJTbdtcEv1VqibarjitTpxSVv+j4vB6/X2LBjWXWZ95kdoaBI9+X4KFRZpuod93sCgYEA0i7KAgHFKz8+2Fp9Yh9fk6XLTX7EvRVe6jPwxbr60sCBwZiIvKLvaPmUJn93MFk9rthTzB69RKWko5fzTxDfHZNA8uarOspAc4Um2wTUwEAhSzlqEO19wmtDiPsmaJJ5XM0P7Xx2FhZ+r5dmzo5Pob3IkwjRcWxsYSw7NX3gWgECgYEAos0biBh6nVBUlXB7yG4neHtJxx4Y40Zhf068NGeTskfPhQuAS/XDOUqIWsrzgLINBgXO5QppDyigg01ZccBMTC4JEbyjz9tNsgg2BDDptkomHXy3gGLrYurnyDbkAzw14CsJuAZuAsOsxvFX/wT8lOSP7sa9H0iTuoB0DkBq3aECgYEArJ5AyeUqSZpnwsiOsUeS92/yyHKUobYrfa2q0Ln/xZbU+mqL4mDuvwg65GNLQCoKvs5sA/g6+WYREUp6STVSCLgnX1aSynXQ+Q8iGj6dfEcvENjWg5CI+GOf06BwqvGhOtYvfpv5X6qZ4Rw3Eu1N+Ugksp1LZhvl5uisuAHpgAECgYB7x9OaYaqGaDv2LFHWH3gaEagv1OTxcJZu3cCJvDk+ihOs3x1g6szojEsbeD3wcdWmAc5xXEl8sjmbxu1oa1eRDuzoZryLuuw3SRM7uWt3Tp1WWWzOdQGp7a3FLM/DQ1iG/7woeGPjH1C1MR7B8KdqsurK13UjrjE6hY4N4H5MnA==',
      jwkPubKey: {"alg":"RSA-OAEP","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"w3bzCBUL8ZV1jwM4twWbtcAfihBMEVsjVwBxDcVnqKPgqNVtnoQAubd7QDVAIYsgXn2ozLwIxcJK4CY6NI4ihfVjaDGSZDDNuTgJK5Vb_N5-5uG_mGSvtak7jDpzfo6s2Az95U7HWcoxev49Zp-0XjIAgjiQBPh83sdj1_76LFJn1Hjv8aMD9WrSH1T4Sgpa8TbH8Y73rz-qqYdBdgoyMUPiFXwXTzM_PIbQc6KD8xRdt3J9wwk0gyH4rg9Lwk6fBQ8aQb6KoItXYaM_UqQawwVM3fAwcFTbZfDtEW8GkyMXtl65D6duYq8EsF-Hc52lnW3561eCiQ5GmBl8Db81ew"},
      jwkPrvKey: {"alg":"RSA-OAEP","d":"gyfipW6x5_W4vzCTMsPRmqACybprwE2eJffG5E2sY40q5z7m4jGC5xsF2ayhjqBzJNQ-mrolTMU1Rrh_39nrsmVYwYZZy16v-_Nsu9Dpu4B0OGoMDK6q9ENNEKf77VTBB-uXxfEZdNdmYjgMbTsGZRo6GybnBF7UMwwpo7qUlX29I5_9Doz_nUSXHwNLGjyuIe0HKyCL-LTA-gkv8KcDDFo57ud6z-cfCOHCDF0hXMibzW5verdapwa1M2FR3SIcrnqjASbKdCM_ImmPyWgS-neWIQKbi_S3PMF-XcuhlH6m4zo0zkzSWEZLnEV2l1aB0iWyJ-MlcvdsSUaVdTw8AQ","dp":"os0biBh6nVBUlXB7yG4neHtJxx4Y40Zhf068NGeTskfPhQuAS_XDOUqIWsrzgLINBgXO5QppDyigg01ZccBMTC4JEbyjz9tNsgg2BDDptkomHXy3gGLrYurnyDbkAzw14CsJuAZuAsOsxvFX_wT8lOSP7sa9H0iTuoB0DkBq3aE","dq":"rJ5AyeUqSZpnwsiOsUeS92_yyHKUobYrfa2q0Ln_xZbU-mqL4mDuvwg65GNLQCoKvs5sA_g6-WYREUp6STVSCLgnX1aSynXQ-Q8iGj6dfEcvENjWg5CI-GOf06BwqvGhOtYvfpv5X6qZ4Rw3Eu1N-Ugksp1LZhvl5uisuAHpgAE","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"w3bzCBUL8ZV1jwM4twWbtcAfihBMEVsjVwBxDcVnqKPgqNVtnoQAubd7QDVAIYsgXn2ozLwIxcJK4CY6NI4ihfVjaDGSZDDNuTgJK5Vb_N5-5uG_mGSvtak7jDpzfo6s2Az95U7HWcoxev49Zp-0XjIAgjiQBPh83sdj1_76LFJn1Hjv8aMD9WrSH1T4Sgpa8TbH8Y73rz-qqYdBdgoyMUPiFXwXTzM_PIbQc6KD8xRdt3J9wwk0gyH4rg9Lwk6fBQ8aQb6KoItXYaM_UqQawwVM3fAwcFTbZfDtEW8GkyMXtl65D6duYq8EsF-Hc52lnW3561eCiQ5GmBl8Db81ew","p":"7hLRavTGFovBVdmHf-tvcxVO43AkkPMj83rm4lFjfr2QwNEk93GCUz-2XYRU4ceYfpl7WuaUwX6sQhEp8hJzabZ0zX2cFZB7pLqtLLtw6kUTJTbdtcEv1VqibarjitTpxSVv-j4vB6_X2LBjWXWZ95kdoaBI9-X4KFRZpuod93s","q":"0i7KAgHFKz8-2Fp9Yh9fk6XLTX7EvRVe6jPwxbr60sCBwZiIvKLvaPmUJn93MFk9rthTzB69RKWko5fzTxDfHZNA8uarOspAc4Um2wTUwEAhSzlqEO19wmtDiPsmaJJ5XM0P7Xx2FhZ-r5dmzo5Pob3IkwjRcWxsYSw7NX3gWgE","qi":"e8fTmmGqhmg79ixR1h94GhGoL9Tk8XCWbt3Aibw5PooTrN8dYOrM6IxLG3g98HHVpgHOcVxJfLI5m8btaGtXkQ7s6Ga8i7rsN0kTO7lrd06dVllsznUBqe2txSzPw0NYhv-8KHhj4x9QtTEewfCnarLqytd1I64xOoWODeB-TJw"},
      subvectors: [
        { text: "",
          ciphertext: 'onOPhl9Zwldpdk0V9axvLzEQXpHlOOgaTfP8/lAg/PF050/5BGyxhPGrQcTkdvL1VJzs743+feXWj0/8UVlYcbEOurKf0NkTxNN9lD6jMyVIibnstjz5vpubk6l7o7WCPQ4cB/f/Jty47DgRjOA+HPBf2E9fmXh0AYeCEDIgpU4DBj0BAmxZgt4SrQdTzjtNNzeEAl9LQk/ePz0e4qfuBIcM7eiuY+8Lc/ww/1Cd7DegjhwBAwEoYUd8v5RdRpi3sVuNoxyYKIQJPyxkt4dLVxJyDmh6ZmjFlnrOVsHtQrlnbLdfwQYzAzgSIVb4iZ9l7TfFjzEXjLgtiJuDwT6WSQ==' },
        { text: "Hello World!",
          ciphertext: 'Di/y9DtmRhUoyz6Tpn2EEuNStsgTkmKcCCHRqvCEOUtBxNFAnU0FJtovISvWHiOjQKbAHY7OlgcAJMXbGSVr9QtijKWvuxb+V6Yrucj48tdwqQByZDS9F26NCydGZOSOrqNo92hGIGT5/whBd3a8spnCq89u9ABhhK7Ak57IysXhYjYTJnPU82w+w16tsMtulmsWSy23hlyBYFRvGNF0OekzndrkM4EvALHuk70VWV07SUppeVNJklvCh0VQ0N7VtZe2PGeAoya21hKGNupmYBTKE1L4PG8K5wbdqnDQJnjnEJxIjqOjHBzGsFuw3dOH4+uUmtYpFHhYDKFwZIXfjw==' },
      ] },
    { modLen: 3072,
      spkiPubKey: 'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAvLGhydJcuMXAzNBhpcn/O7Tcx+Ur5hUSD2QPX1pkP2Oz63tVP2jMjjw8+yoY/xgOcx/ty3McDEyalIvLA0xzh5oOe7zlaB3nPWUDkIFKirzNWBmnqCX9z3aufw7Nwyav3NG3r1imnaSX2M2KWiHUmjW5n4UKvlpLPaWaIp18Lbp1Z0QKIYyaO+9uBdyKoG/17IpFHmt+IBwUp8WtQk1k+u875Dq8ZBFlIDlhmgRSjrsxHn8uWr++VxuhlA0Dw8NcrXJVPTMI9PatqkHAnwxk8lECL3/oCADmzJIqNG4hf3NVp5W+w+N4XU1/mWD/dfnkc0EhZZARq1jltrXdon1DzlBWXrVh20gzUbg/tXY1IgJ4Ff3Ij7iv2PUj7GTkPwTSk11kM2WnvcSlaQaHElod98UNnyv8tW95861QWLuRddaExvLF+thYtJZtws3YxxnhMlwpr6MW5dhYRb7WBXgYyyaoOg4opOXKIh3pali+dp6aDo7JU/PJ2I8mlchSF+uJAgMBAAE=',
      pkcsPrvKey: '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',
      jwkPubKey: {"alg":"RSA-OAEP","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"vLGhydJcuMXAzNBhpcn_O7Tcx-Ur5hUSD2QPX1pkP2Oz63tVP2jMjjw8-yoY_xgOcx_ty3McDEyalIvLA0xzh5oOe7zlaB3nPWUDkIFKirzNWBmnqCX9z3aufw7Nwyav3NG3r1imnaSX2M2KWiHUmjW5n4UKvlpLPaWaIp18Lbp1Z0QKIYyaO-9uBdyKoG_17IpFHmt-IBwUp8WtQk1k-u875Dq8ZBFlIDlhmgRSjrsxHn8uWr--VxuhlA0Dw8NcrXJVPTMI9PatqkHAnwxk8lECL3_oCADmzJIqNG4hf3NVp5W-w-N4XU1_mWD_dfnkc0EhZZARq1jltrXdon1DzlBWXrVh20gzUbg_tXY1IgJ4Ff3Ij7iv2PUj7GTkPwTSk11kM2WnvcSlaQaHElod98UNnyv8tW95861QWLuRddaExvLF-thYtJZtws3YxxnhMlwpr6MW5dhYRb7WBXgYyyaoOg4opOXKIh3pali-dp6aDo7JU_PJ2I8mlchSF-uJ"},
      jwkPrvKey: {"alg":"RSA-OAEP","d":"E4nJGN7BXxiK6CpDkikiVopZuhEOxJo17oYL2XHAo5etT5rLru8pDylJnzAyumdBR8Zslv5qTxO3hd4bvVGzPL1E9qcOkgNWqFLHVbUthMQb9x1g8NZOO6csVlewEp704saMYImrZvNeDcLqqn6KRxV9DPl3rVIoLE_zb9Yiv5FpCrJO4j5u0fnuyIiXihlNu5ptocK7opOFyAF9-TmOVTVkXDOAwlPSxs1qP8pmygS0B1Zf9GGaUea4il32n9SgnGZz8zDzzpNnscb87ytklvazHKDrsXyx9ODuHe0JBST4EIjOHV9-8w_QaQ8dScosOzOiGr1aDT0g1H_mNkOPQZdguRJwwMZp-HihLlcif_dzVdOWRFBXtjRYHSi57t92rfAkPBHaTu0NzR1gokEAFUbxIzAJN_maAuah2xXwZV3x92ayDzKXsiVC3-mqkQRji2OQ9adxYsO6R9fCZ8s5Dv_1F3kjUSAK5If9wKUD-34kHbCtGx5RL2HO4Z4DJ16J","dp":"X-iT-xicpzzrQ8hDkV0eCyl-EGwJHGsRvsK2WqOV4-162yKhddqtGb3mfhrWcc62NvGOZmya_DlyYdYNdjUnuOo-4IntACWruGXeUEsWftPNyngxclj5PMC19h32F_luDJ3cydyU04AL676jjmy_PEPIvDEuZMC5MolhFtZSLNLtumbb22vfvnYDJMLsQH1_Y3X_wH0-Nkc5fdxmiqrlKXXw9bKs9medGgZ_q-whn9-zfABhcJYdGMvz7ZA2R8D3","dq":"cq9mPn8PpEza3MC-qqzXVLQcW9xONWHlLZe8WYrmdKXmy5ulrkCre--Bwg5Z0cUKNi3lVjVrQ1VvKIOhhQI1gNcbox5dFA7GUXA1jzTG0PQnjO9N8BO1ofSHldQ44aXZbm1eyVRp9YjJXVAHzyB8ikH8FBzzg8p2ooN-qPQQyK3BpBKyP3d7b8kRBXoRYcmnJZ7t_bjGiGOA8xy6LCzam0bSpr8SPCLkTFm2fGq3bXcg6JqxJBsfiB10SZ6bAqd3","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"vLGhydJcuMXAzNBhpcn_O7Tcx-Ur5hUSD2QPX1pkP2Oz63tVP2jMjjw8-yoY_xgOcx_ty3McDEyalIvLA0xzh5oOe7zlaB3nPWUDkIFKirzNWBmnqCX9z3aufw7Nwyav3NG3r1imnaSX2M2KWiHUmjW5n4UKvlpLPaWaIp18Lbp1Z0QKIYyaO-9uBdyKoG_17IpFHmt-IBwUp8WtQk1k-u875Dq8ZBFlIDlhmgRSjrsxHn8uWr--VxuhlA0Dw8NcrXJVPTMI9PatqkHAnwxk8lECL3_oCADmzJIqNG4hf3NVp5W-w-N4XU1_mWD_dfnkc0EhZZARq1jltrXdon1DzlBWXrVh20gzUbg_tXY1IgJ4Ff3Ij7iv2PUj7GTkPwTSk11kM2WnvcSlaQaHElod98UNnyv8tW95861QWLuRddaExvLF-thYtJZtws3YxxnhMlwpr6MW5dhYRb7WBXgYyyaoOg4opOXKIh3pali-dp6aDo7JU_PJ2I8mlchSF-uJ","p":"7WD_lMSRccxgpgPXctpvFqXRl7PA2k5Z8yVbwMou4qHP1vu0F1v7NWzzjqouoCIb6v-xpmgFu0OxGhQzDL0gIKiH_4svsXGqdTYZfIwswx-Ng4OhKWmKvk4f6ZuqyQhX_7p7Jhh8cqH5BIU4BGlb54y6XGMQe74LTfCL_sujVU_Qo7R02cKjeG6x-guNre9thOaOR5KLlR_B3UV4ABdbOKzPguRdjvKQ-nnGk2-JKReh1JbV2NcSdw_4DFZ4LGNr","q":"y37zDxWMu0EAPWgivBCe7UZ2QhXuMuOJsk8KtBsylkE3vk9lz2bOnsG1R56oqX-7p2vdgvfhSV7XciA-YmDKE5BUWl4cnU6fPIhsuyDG_WhWV12OFxByCrr_bV1KYG4ysimUxFapVxScxKigoRSoxv7RLl6GEP6xZrZ55LJOuoFyhXQh-jQn4-svQMdUlENnieF8k7wTuFi6L_YAGnE7VofgbsxuucZn1h9Vl85mZrkB4-0hvTpH9A7AjaLdQ13b","qi":"R0dC1GzG1cI9jfKMK1Rq-W2K5buyEg3b_YLILaBohVrvcmnwPZUziY0nW_JVM_J3A1XGmOb-1kgdTFUOPWFu5bGMrLNqI0R0EhlPXwa_Bhbn4aKzGfxRegPIBwoqwaQNaGBifLZBqdMxjEdjfNXApMEJYb0y3UvABRVRtkiIfpulrE-aZqelh7ELmuFc1W21m9Qru6_zv9RuzPla-orl4x9HKqGZFlCyasGimJ7iAtkZcaIik551es2KuUablcH5"},
      subvectors: [
        { text: "",
          ciphertext: 'ssMzh73T84FZbRCp1LL7FnMPp/YqXjLnpUOPTqV++2GeZ2/L190FXedjyRrKb5hy8ctNzLqkW+KVwCDOC+J1HUlAjvZcI8071WpNz+FjVQMl9Tp+sbm1/Q6uswIAF6IWcufrFtxuGHiGuumyWZ6zIiN9+ygwjjIMciHb4eOjnao/dZHpyXDmruBVdOSywwlub59jvVcN87ycQoI4tERsZ57U4V/KeDuSe9TJQyV4yo/51szbVoUrmm4A8LeYAyb2PY1w6JSIoqdUh/dWG/xb51kWGJeVN7MJtfEINC/dz9IfGX7kj3kQ/Hm+3842XBwAhCoppopZKlJgnCQQNQU85GTnfidsQqCfwIekAVldR2mOHhaDcVlC0nZ4WWbbeAAZLzfMPDI0DfugllNGJf8qaGyGZscnukPaOcFPTXed1kCMerI/kiPZwYY+p7IR8pC7uq7zYvxH5VcBXzbkJYuhu7+d4Idb9pmb+CYiSQMgcoq3ravuOgMvwMhvJJTGhM50' },
        { text: "Hello World!",
          ciphertext: 'gzu26BVAirq2HBADWGwfEKzmXowQuhAnNZ++HZ1EDDXwkPjlTJgS+LLu3wOS1Ga3jT7AGoRoIVtm2OKJjVfBCqc8uSpiZxMYj7qy1KMJ12SVVpziSZq6Njyr5PTjgISy/64CFumBpCphBjhszl8UTXk0slIcKVqyH/JI0gJae82VdWc/t/fiTISVhA60RNukGl0WCaVdI8EhN5KdeXJHrKcJNuT9aIU7qbELUrJ2x4Zmstteng2IXdEy8bSE17QCIu6mmdliUrWKsjnEcRyAlNiFOyNdPvAsMmJsLOrzgpv6cvEOrRd0nL95Pucn0gzB8mVOuqG73wpknmujKZqFXtUsEVTZd4qs7MsdEbpzscblEX/rrMWn0qLq3Kgwu8AchKavbVBZS6srneAMTy0Bg7bHTsh/PwS373mHaYJMPQwOqScelgbpZKcxv805Tc1q7SnLTZlybY+JfvY6GoPLgHLzwQyUAh96dFeOq74lEsjVNoZAc4f/RrqbaUp7bdYt' },
      ] },
    { modLen: 4096,
      spkiPubKey: 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAqJ+9n7Lg3x3opsqG5EnTocfqwxub3Oqycgxo3aC/3OrLEEUHQusbwFTpO+05BndpyqwfBNSEfOaRNhN9gQqRshjPXsKRdS+VdJ7w6gDUPSAhqevCXqsoH3e6Epp0ceGL62jZ2gpuFhxqVJUv6S2QN1MNM3DvQ1B+wkISKFaJ4v146dvVw5kEk3ROf7HAR4szC/Y4ptxLQLQC9Cs1N1djPvdFEaD0DHJFJtkdPjWD6ofb2KslNpNacrohfYtcc0FAH+uDTIG0nJ8N86QbDojKXds0uXnWGB4kEEk3Gi9EpP2iem/1dLx0fUeQ1u9PTU6riwRfc5jZWb/SETi/1dLAwkz3g8pt0OYFLFMFcem9KG2EBk8a7vfUvxvirUuAgCe2KAN2KH1hsQ8wGAOLKSwMCnhXIFWZ1JLi74j19wQWFnVwNgtBFcP/f1z7I+W3mQj45sw87WdU+d2UKaCrSoiu3RXMK6acbq1hA4J2F+nQHvJYnzWGg6VJI5+I0NcweMyMZi7lbzHFUQXmnN+gbKuyly12FlGCcmc7UxiPnc4gL9fIzQV1dNOkZ2Tf/OnCpyWICZAZ8DBqSf73HwREmfqlq05PelvZv/tt+GdNtqvvLiWjCYYNk/ltWLpyvE+zaWNemVusGkQ4r/msSdLUwL+oQnm+nczQmE4bQYuwY211rVcCAwEAAQ==',
      pkcsPrvKey: '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',
      jwkPubKey: {"alg":"RSA-OAEP","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"qJ-9n7Lg3x3opsqG5EnTocfqwxub3Oqycgxo3aC_3OrLEEUHQusbwFTpO-05BndpyqwfBNSEfOaRNhN9gQqRshjPXsKRdS-VdJ7w6gDUPSAhqevCXqsoH3e6Epp0ceGL62jZ2gpuFhxqVJUv6S2QN1MNM3DvQ1B-wkISKFaJ4v146dvVw5kEk3ROf7HAR4szC_Y4ptxLQLQC9Cs1N1djPvdFEaD0DHJFJtkdPjWD6ofb2KslNpNacrohfYtcc0FAH-uDTIG0nJ8N86QbDojKXds0uXnWGB4kEEk3Gi9EpP2iem_1dLx0fUeQ1u9PTU6riwRfc5jZWb_SETi_1dLAwkz3g8pt0OYFLFMFcem9KG2EBk8a7vfUvxvirUuAgCe2KAN2KH1hsQ8wGAOLKSwMCnhXIFWZ1JLi74j19wQWFnVwNgtBFcP_f1z7I-W3mQj45sw87WdU-d2UKaCrSoiu3RXMK6acbq1hA4J2F-nQHvJYnzWGg6VJI5-I0NcweMyMZi7lbzHFUQXmnN-gbKuyly12FlGCcmc7UxiPnc4gL9fIzQV1dNOkZ2Tf_OnCpyWICZAZ8DBqSf73HwREmfqlq05PelvZv_tt-GdNtqvvLiWjCYYNk_ltWLpyvE-zaWNemVusGkQ4r_msSdLUwL-oQnm-nczQmE4bQYuwY211rVc"},
      jwkPrvKey: {"alg":"RSA-OAEP","d":"bGwBxhyDQJL_k7cnUsQxgpWD2p328u4pfPGDv_VrSEXj-XsY9ysq9dji-rhGcWT4retMKpPm-FRcTDPt_7nnAme3douOcZX9-DV2XE_aJ89wNcy0dqCAtPMLvoh3lP3cNKp_YRZRwH_W0rn2S20TjK8nDstv3I12Y7uN50f1cvFd_KhwY0sRSSqAitSk-JuFYAyaUpfU_y5_s7XQitvyoXrmezZNlW8oDZmOlwBb6MIgVsl8rQHEJ36MqCeicy0iaSPKkbfYhNg0ZVNAXnEQBZc76IJxaaJ_t8UL3BdGgPvgq-8vGTdPg3ovpDPNfry1yjYulapTHsUa8h3WI0tWyszi2Jm0AcnA75Mb330r_PAl-8eoO1JYApQzH1fzurrLOnE3cm9X5yaKFmMpLAWDqFQVG-HvO1X65OnGFxREwwACUMhMsQHIuXMyTM_tqJHzPRoVspCTbhyquAd-2_tOY1Ri90svYAiWu5NyLwmSbU7A_Bhk5TqXxioyozPxcsJqB0GnDjD-AbpD92At8Y2Wv1dPm_k86s1dTetVzAf3tl7FZsiyIQ3qo6QhJ3yf4stO80UhsZweL57fxR7lqhZQ3yV7N6edZsFP9Lu-CUhFNLaigmtyDaWQe5vmCJaRpkW85X8lnWfKasMyJ5o4ayL3izFYRZBeOiyVkYO4MmgWZMk","dp":"jwsIykpbxxOlT1LOVhlAP2hPLROyWTeENbS0_QlYH_p-PYUoksA-3lBD44b6eQfNvTxQh9zi_E34bg0Ue8Qt7Kj85PRiguuv8FHK9nDCJAhVZ8YwlC-sigTNV4B6T65XnE2znCOEQunbcADtQG7pER5YoeIKLyhid9sVps6J3c5H_D2f_ncNFmuiHprpbV3CjlyzlQ3CHh8CTwUwA6QMGD1MsU2953Mp4zkzHa3VmkYAUnDd8BUncRQ8OjkebKA73S6gRDr80AnwyjX2-dM6RVoBhv1rEXmVNEDQQ7BbEj0m_FI5nKr2S30BqsiTIFhpn4yDN8To8Xu5WSua0158lQ","dq":"qHY0Mc2HBHxtuo9AJ2e28QbkprEusDDszPBGV2l5mgvyCn_BdS9M8LWza_328YEntdE-dk08APQ28-33FEH8vOrE1oHqDqlsJ7BGwq1W4mdQGC9xRJC7Zkzh51uR4QVX9L2F5MYGaIs9rQ2FJKeG8ie3mL9ruk0GJHQomRx67nyo6xqkN3G_xsM0I5Sc8A3ax-vas1ZFTIP80HbbYx8e4K2pu_us2qnV5-_E775sSyS8qT7ULb0zAlUUKlD5MyePZL86D6jSZ63i0dTIfXOuvt8jV_2KuUsLcVAYdUnFsdP0kbofXYG1I4-WK4rB_ld5An9TdoKcVam_GrXJkvAbZQ","e":"AQAB","ext":true,"key_ops":["decrypt"],"kty":"RSA","n":"qJ-9n7Lg3x3opsqG5EnTocfqwxub3Oqycgxo3aC_3OrLEEUHQusbwFTpO-05BndpyqwfBNSEfOaRNhN9gQqRshjPXsKRdS-VdJ7w6gDUPSAhqevCXqsoH3e6Epp0ceGL62jZ2gpuFhxqVJUv6S2QN1MNM3DvQ1B-wkISKFaJ4v146dvVw5kEk3ROf7HAR4szC_Y4ptxLQLQC9Cs1N1djPvdFEaD0DHJFJtkdPjWD6ofb2KslNpNacrohfYtcc0FAH-uDTIG0nJ8N86QbDojKXds0uXnWGB4kEEk3Gi9EpP2iem_1dLx0fUeQ1u9PTU6riwRfc5jZWb_SETi_1dLAwkz3g8pt0OYFLFMFcem9KG2EBk8a7vfUvxvirUuAgCe2KAN2KH1hsQ8wGAOLKSwMCnhXIFWZ1JLi74j19wQWFnVwNgtBFcP_f1z7I-W3mQj45sw87WdU-d2UKaCrSoiu3RXMK6acbq1hA4J2F-nQHvJYnzWGg6VJI5-I0NcweMyMZi7lbzHFUQXmnN-gbKuyly12FlGCcmc7UxiPnc4gL9fIzQV1dNOkZ2Tf_OnCpyWICZAZ8DBqSf73HwREmfqlq05PelvZv_tt-GdNtqvvLiWjCYYNk_ltWLpyvE-zaWNemVusGkQ4r_msSdLUwL-oQnm-nczQmE4bQYuwY211rVc","p":"1RaoeorsMF0s-YSxpZ4FqO2Xl6XHfc4yp80icmQvrT8CVty22t45dbZ791upFnxy9zmtI4n2EXBwQoIOpT1OkpvLbljLYXsKmiqXOZJB7AU44BMihTWeyVIx86yi4rv-zherzGpfidcwEF11xbfUhVIpmGodf155hl6CSUYNgITMqAnBBBRRN9rO6ZpatTK6uFFKb1Ygrbzl6GsoGPmzy96-gU_R8aUdihQ3k4oyTML5W3g16ZpxyR0RS_IJyTlX0QsxR7JzZXDVsmoHVKfX1EQlM2AbRd3Mzb9XsePCVX5iNahygtBcHfO3kG2p9FAUn0oXdrgvtMyof9wtqU4OMw","q":"ypTOI0j6GHOj1WPwatXmQLDfNLoO-N9Q35RQn6IiHBtR8nOx9Bm7ioXPEjVsJ1OYQl5Qe2NdOC-S_CXWSemxPUY_Wq-BIxnJmcdVXn8qBp1hvpUvTChqaxKFxZTcED_GjU_oyYPm6NX2736W4RI6fV2VdQ7Brd2u8Lr6RUDPL2Ycz_VTEDhAaYjvq8orxdwxAsxDBIwAmHZ0R6k2G8Xk25y_TU0evHqkAtOGaXO_RzFkPH_PztqDm5JIMfdYYYUtO2j8CPBACVIlBecWO8xBThB_gBYb5_U8tvfnyXvb9c4dvfVvpjEn61D8R8LF1CSnqp9yNJxIxbreRUVlId74TQ","qi":"AkoaqK1MUomIYtT5gx3nE01hph4SWjMQLkgzQ-INWxVIMQDjKq0iPm7hpaKN4BznqS_LXwJjwtoVkFSvH3fbL3bOo7AGEX2NfBfK7FnZhL4keFk7I0WRsNZam8o-62Gmh3idhaNJmUKkJg0ivwc_eWj3tkuAS3aLbTwRPTWLvZUrq4c7T0rc_8O-E8D175Q6YjAeIdSaxPB24gu8z8UVIpAuIV_a60NZpGaNpDnI-RNC8BISxclTXvcnJxRAGQW4pS-W7O8YkXDvloYo3cWm3nwqfr_VEjbMIeNbZYNe-jLZ6wKXoy1zVteOcAm66fPFcXIAt3FkOm5WvsXKWvk6ig"},
      subvectors: [
        { text: "",
          ciphertext: 'fIIhjRQ9lH6uVsISeJgcz/S+6y3EOpoGQs7j98JvuQmd5P2/ak0L3d1IaTFQTHirXKbSu5RNmVKxnGjNsP33Ch3yEazUsUw6PvjZaB7neCEWuVZQBtjbIr10K8BIZ+4Kqu72IpAPsmzXDOadTWC1tFUDVkAI3aOblXJssIwHFmc1rfwuHOSurkot7LL2oy8H4DANU9ypxuLR4s2a0KCg0R9XboOU/dFoEwt0oj9KRT6Z5b//B0pw4stFb7X7qP1ifbogqBFw3aza4JBhaoq/vN11QW2LS3WmWKdAiqngnks9Yq3yfyiYlSuaSF+DD9ysauPID77xNb1NSjzFMdS/KzQWdIZx0A3+nPCgSmn9UGJH7LrEgfCQH9IpnOWAPNsyVApT+qG1Z3YHLKKgdRIaCgfKiJyyl9DwiFeDIHOVzSxaJb+KoerU2gkLYh5bQ+Ns3+tCXI/cXYVyY4Kn4HfXF/N6SrIgkBs4/IlhHn886PQW++0XP8RzUWK3KnOCWCs+2UXh/92K/2iaSQGwF9s/ke6DiKygwvEzmNgO20k8NTKcHo/Wq98yop2+KvkeR9Mxr1aioeUAVZU+ZMmY115Vo3/2JV+UE8HlDN+9+o9LJNaGIj98ZCrUAACTIHCK/HY+VBrzilZLhsbrsoVO7ve7Wh8roEqstFMTZ+3gUeZUsiI=' },
        { text: "Hello World!",
          ciphertext: 'ZPn/xhqsZ10ZwEED71HNfFEk6jhiTFzf2cwMKL/yEco0NsT3UNxEDPTuCkqYh5A3QT/4Ifc5PPHScIUjImbfYJ0JkhxGWu9u/bvWRkRd1YCYidIujcnxuOkd+NoJaPBG5FUSp0m++q9GbcvDTjgErcU3zEjB99HFL76pLKuzxBUn8U4b5N3DdGiKZ586bGzP2lPLHT3rLLBQJS7Sp0pxxpAVvM4ttP/lB9k2pQQxavkAtYOSkY5O26b64D0Jl5qQ6D4K5jsjYyjUtOu52khGr2kZWNypXtyRUlY63R0plTOh6JzZh1M29gJxO7Vs3/nt0mwrupIbx3ROlEznJ4YRN4i3C4vpM5LRjbeT5Hb7oGf8hNasAmRZR1FgwVyJ6yIy0bOPG41CeL7UXi0XDemHKPJazdY2lMHR0TVGMmbV9hkd6NNC8hivurupkiKZP9Q8E/MGT+8nSusYxLT6NXmxzkRyr1XVfmNXDIsBepVrEhwEXkoFkGw3xPKbUqt78tfpUzhavniSqi2mQzIDuSENnwFSy0cYinuyYxyYaDKR10H3HgrbvA3iNSTAMjcRFa5KeuCsTchD1ttWBzRHrlDgkdqIQMsLSaqHHhPxEUFDIGwBB2EOkD0/nwj09uh7JBfXzCvOII9ybc19++8SuRy6jWNu80RqlH2IOIwPiBniePg=' },
      ] },
];

*/
