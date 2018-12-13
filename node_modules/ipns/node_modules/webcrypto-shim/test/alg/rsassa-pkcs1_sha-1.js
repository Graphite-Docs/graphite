describe( 'RSASSA-PKCS1-v1.5_SHA-1', function () {
    var alg = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-1' },
        pubUse = 'verify',
        prvUse = 'sign',
        jwkAlg = 'RS1';

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
              spkiPubKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9Crw44P//zsyyf9RoosEyjWrNihhPdEiMkBwTUAqGdGQGsiTDqYEnRHU6OgR8Hn0SmmvUTTpIlJJzW9ahL7c9EUePNmpgZodInan2v2QakJbJNG/z/kcE8ob6xiY+ZPU7FrO5ueE7+s39KZ5/RJ/gFNIKC4xZlmeMlZJCaMHkWQIDAQAB',
              pkcsPrvKey: 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAL0KvDjg///OzLJ/1GiiwTKNas2KGE90SIyQHBNQCoZ0ZAayJMOpgSdEdTo6BHwefRKaa9RNOkiUknNb1qEvtz0RR482amBmh0idqfa/ZBqQlsk0b/P+RwTyhvrGJj5k9TsWs7m54Tv6zf0pnn9En+AU0goLjFmWZ4yVkkJoweRZAgMBAAECgYA0UDw2IU22pKvQ2b8WFbQRIUFlD8oacruA6oBad9Px0VO85p915fpvu2oVaujC0E0cUM92OMjgPP0qH0gN4v551TEMFKjHNtgBqDb/1LDZ711p+L295CgFN2O5OadNlUjwSEcrsv/qlPdHvMf+YhTGkb8QqAG1eM09JEDjGGGgAQJBAPcqfIg72BvsCTfDtCsCfThvqXkDuha9FXOM3T3L0u8BjNmSBPk2PPFWlFVbqYSS1zk9LHtTS96nrNYPms3Q6dkCQQDDzG1HPShsfquwiIgztU+mMWGX2wZFaJp43aZSQT+UzRhB/sGYanABbCnfccRUnXS4uKDvnFmRUR/BWFEzNb6BAkAXJhmHwOMaql6qpF+pb5A+yuZ6eQjivE7YBadq9D4LOH/ymKRymsvWZp955x3XVtFlgP87ha+jaNzdJ5T+FcTxAkA1EmA8gxNF9T/MZfWlLmwcfB4b7z5P6f6U7F98xDrbtovwt4D6Mz+Q4ySmcEvrM5LDzyewSwzsGrUkzy+TVeoBAkEAz/3NoZF6zxMZjp6SQaO86xbrqgCJZJKJFxixZ9f/6LYFz8nSbSN4GSWZY1a4KN6RUX/qQnVJ8IBXdgNC+ov1ww==',
              jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"vQq8OOD__87Msn_UaKLBMo1qzYoYT3RIjJAcE1AKhnRkBrIkw6mBJ0R1OjoEfB59Eppr1E06SJSSc1vWoS-3PRFHjzZqYGaHSJ2p9r9kGpCWyTRv8_5HBPKG-sYmPmT1OxazubnhO_rN_Smef0Sf4BTSCguMWZZnjJWSQmjB5Fk"},
              jwkPrvKey: {"alg":"RS1","d":"NFA8NiFNtqSr0Nm_FhW0ESFBZQ_KGnK7gOqAWnfT8dFTvOafdeX6b7tqFWrowtBNHFDPdjjI4Dz9Kh9IDeL-edUxDBSoxzbYAag2_9Sw2e9dafi9veQoBTdjuTmnTZVI8EhHK7L_6pT3R7zH_mIUxpG_EKgBtXjNPSRA4xhhoAE","dp":"FyYZh8DjGqpeqqRfqW-QPsrmenkI4rxO2AWnavQ-Czh_8pikcprL1mafeecd11bRZYD_O4Wvo2jc3SeU_hXE8Q","dq":"NRJgPIMTRfU_zGX1pS5sHHweG-8-T-n-lOxffMQ627aL8LeA-jM_kOMkpnBL6zOSw88nsEsM7Bq1JM8vk1XqAQ","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"vQq8OOD__87Msn_UaKLBMo1qzYoYT3RIjJAcE1AKhnRkBrIkw6mBJ0R1OjoEfB59Eppr1E06SJSSc1vWoS-3PRFHjzZqYGaHSJ2p9r9kGpCWyTRv8_5HBPKG-sYmPmT1OxazubnhO_rN_Smef0Sf4BTSCguMWZZnjJWSQmjB5Fk","p":"9yp8iDvYG-wJN8O0KwJ9OG-peQO6Fr0Vc4zdPcvS7wGM2ZIE-TY88VaUVVuphJLXOT0se1NL3qes1g-azdDp2Q","q":"w8xtRz0obH6rsIiIM7VPpjFhl9sGRWiaeN2mUkE_lM0YQf7BmGpwAWwp33HEVJ10uLig75xZkVEfwVhRMzW-gQ","qi":"z_3NoZF6zxMZjp6SQaO86xbrqgCJZJKJFxixZ9f_6LYFz8nSbSN4GSWZY1a4KN6RUX_qQnVJ8IBXdgNC-ov1ww"} },
            { modLen: 2048,
              spkiPubKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4Bzd5DJXjzWFiNyOuOXs6YpRQZPT4Za0APAFU+6+6CHfi6tZ64Ss80ht6pSDEI02FC+mC77BMXpU//SovXiM0bOKdQ8LaYjL0H1Wy5w9YjFgxVf7xS3bTDDzTHB1JfQlSDqiWiqmoHKKJpEnGkMEva2bEucAy+7YoDhjwPvaelPxX78A0Im1bpycSluwYKSbKESWkK3mH1cAIKj8URUuZtjsB2mEpPo8S1V0SgsXP1HPsqerJx+PN4h3FlxdQ5VzLRkIcssx7e7FLPXkIAvmkqexcto1QMgaETVAdno7wAYuzPrObEt4aoP4h/pb4t0AFjEPLFpSSj7nSHeaudu9eQIDAQAB',
              pkcsPrvKey: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDgHN3kMlePNYWI3I645ezpilFBk9PhlrQA8AVT7r7oId+Lq1nrhKzzSG3qlIMQjTYUL6YLvsExelT/9Ki9eIzRs4p1DwtpiMvQfVbLnD1iMWDFV/vFLdtMMPNMcHUl9CVIOqJaKqagcoomkScaQwS9rZsS5wDL7tigOGPA+9p6U/FfvwDQibVunJxKW7BgpJsoRJaQreYfVwAgqPxRFS5m2OwHaYSk+jxLVXRKCxc/Uc+yp6snH483iHcWXF1DlXMtGQhyyzHt7sUs9eQgC+aSp7Fy2jVAyBoRNUB2ejvABi7M+s5sS3hqg/iH+lvi3QAWMQ8sWlJKPudId5q52715AgMBAAECggEAJZoyULtxnYGpahE3kSZi3bxrbclT36Hdidq7yh1gwqoMS+7wI2gbbKZWaumIJBrNXA2ymn3jBF42LMvsE/5KAlVRgdqIW6isKcsd6QPJ+NO4HORqRecvyFTePZEQ1tFj//52hxJo6rrNGzN3kBx2iyy5vC4uIAlvJ1LOye539dYXPPLazHP6OMCTmn1ZrquPF8omWox1wZRe6IhBMEt1ZL4TkGIWTEVRDep8aSf3+ZebZPWOyrdxJKUCTA7RqTt9elE2er/D6rEjq6Bm+dZOP6N/cdvAKQ7U5MlnQKNOpbdV3HL8NnmaTgGxaFMAKMAAdpKLjAusvlRhIM2ayGikkQKBgQD+6xOAO6/WHiGRgqEUTx/MDT+uxwE8t2LnjSVNIYKVJ8dLSijrRLqixA541n7Cz/jrWVGfJmnmwDZUB4Hgc3MWzpU2SLyiuFFNnFhPntXN/kat58biWVNxw9GvRoqSRG35HqcrFcs73b9yjK+sNQY4KkHTV9KXyfKx60VI3wOT5wKBgQDhEFNpgKvmSCCcE5p6Q391uI6uIJZl19cHm0NjXpXpbA96mA6fMBylpwskV2pn9G6pA+slO7LeGpyReqp8/4IHrTxgLjH6Vr4xJQ4DpMFQyB2c42BiWBEnnN0v6t8CZKPEWmbOa7DsMTnfzNAfb0FhbKfxpH701/69w6nO97n3nwKBgQDr29sOMatuhDBw7plVLiRwau26K5zEbbUQIvMZW2Dz2ns1+SbFD7FTee0d9vAQFdbtApZXl3YyrzNVKiEL6CXbO0aplEEcmUd4dKjs+jw+PP9uVl4Y/acMQq8W6kC6NqA9+BOZ9K828+P3+51qyyC3BLok7kQGdy6bWeCgHN+1jwKBgG3gJYi9O67aCamI3ILSDxjuuCGEYUhpHl5lS3noxHFHwyrLr1/CAkpRCdx9HMKRj7DN6++qfIF4JnXTmAYcS2PqDC68fsPDs2iUuYnH1mTUvbhJPVXlvsJDD60EEkm9zkHfDI+7/Yzh32pGOFkQXK/udvM+pohsJr6IFo+nW0/rAoGBAOAgMItBWB8GTHd48fduaBUOQdQRql+dP17sqeVDrD0Zr6vGAPd/i0wriDxCIi1/NXB1wTrewIaPyFuwF18xq98uzVpocMqpICdnl31Z/6VBcGh4QKw/+3C1o9m7gO945gdlIqym01c3pyOMHRcImHEQwnWjKGMvdNGGQAueDHwE',
              jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"4Bzd5DJXjzWFiNyOuOXs6YpRQZPT4Za0APAFU-6-6CHfi6tZ64Ss80ht6pSDEI02FC-mC77BMXpU__SovXiM0bOKdQ8LaYjL0H1Wy5w9YjFgxVf7xS3bTDDzTHB1JfQlSDqiWiqmoHKKJpEnGkMEva2bEucAy-7YoDhjwPvaelPxX78A0Im1bpycSluwYKSbKESWkK3mH1cAIKj8URUuZtjsB2mEpPo8S1V0SgsXP1HPsqerJx-PN4h3FlxdQ5VzLRkIcssx7e7FLPXkIAvmkqexcto1QMgaETVAdno7wAYuzPrObEt4aoP4h_pb4t0AFjEPLFpSSj7nSHeaudu9eQ"},
              jwkPrvKey: {"alg":"RS1","d":"JZoyULtxnYGpahE3kSZi3bxrbclT36Hdidq7yh1gwqoMS-7wI2gbbKZWaumIJBrNXA2ymn3jBF42LMvsE_5KAlVRgdqIW6isKcsd6QPJ-NO4HORqRecvyFTePZEQ1tFj__52hxJo6rrNGzN3kBx2iyy5vC4uIAlvJ1LOye539dYXPPLazHP6OMCTmn1ZrquPF8omWox1wZRe6IhBMEt1ZL4TkGIWTEVRDep8aSf3-ZebZPWOyrdxJKUCTA7RqTt9elE2er_D6rEjq6Bm-dZOP6N_cdvAKQ7U5MlnQKNOpbdV3HL8NnmaTgGxaFMAKMAAdpKLjAusvlRhIM2ayGikkQ","dp":"69vbDjGrboQwcO6ZVS4kcGrtuiucxG21ECLzGVtg89p7NfkmxQ-xU3ntHfbwEBXW7QKWV5d2Mq8zVSohC-gl2ztGqZRBHJlHeHSo7Po8Pjz_blZeGP2nDEKvFupAujagPfgTmfSvNvPj9_udassgtwS6JO5EBncum1ngoBzftY8","dq":"beAliL07rtoJqYjcgtIPGO64IYRhSGkeXmVLeejEcUfDKsuvX8ICSlEJ3H0cwpGPsM3r76p8gXgmddOYBhxLY-oMLrx-w8OzaJS5icfWZNS9uEk9VeW-wkMPrQQSSb3OQd8Mj7v9jOHfakY4WRBcr-528z6miGwmvogWj6dbT-s","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"4Bzd5DJXjzWFiNyOuOXs6YpRQZPT4Za0APAFU-6-6CHfi6tZ64Ss80ht6pSDEI02FC-mC77BMXpU__SovXiM0bOKdQ8LaYjL0H1Wy5w9YjFgxVf7xS3bTDDzTHB1JfQlSDqiWiqmoHKKJpEnGkMEva2bEucAy-7YoDhjwPvaelPxX78A0Im1bpycSluwYKSbKESWkK3mH1cAIKj8URUuZtjsB2mEpPo8S1V0SgsXP1HPsqerJx-PN4h3FlxdQ5VzLRkIcssx7e7FLPXkIAvmkqexcto1QMgaETVAdno7wAYuzPrObEt4aoP4h_pb4t0AFjEPLFpSSj7nSHeaudu9eQ","p":"_usTgDuv1h4hkYKhFE8fzA0_rscBPLdi540lTSGClSfHS0oo60S6osQOeNZ-ws_461lRnyZp5sA2VAeB4HNzFs6VNki8orhRTZxYT57Vzf5GrefG4llTccPRr0aKkkRt-R6nKxXLO92_coyvrDUGOCpB01fSl8nysetFSN8Dk-c","q":"4RBTaYCr5kggnBOaekN_dbiOriCWZdfXB5tDY16V6WwPepgOnzAcpacLJFdqZ_RuqQPrJTuy3hqckXqqfP-CB608YC4x-la-MSUOA6TBUMgdnONgYlgRJ5zdL-rfAmSjxFpmzmuw7DE538zQH29BYWyn8aR-9Nf-vcOpzve5958","qi":"4CAwi0FYHwZMd3jx925oFQ5B1BGqX50_Xuyp5UOsPRmvq8YA93-LTCuIPEIiLX81cHXBOt7Aho_IW7AXXzGr3y7NWmhwyqkgJ2eXfVn_pUFwaHhArD_7cLWj2buA73jmB2UirKbTVzenI4wdFwiYcRDCdaMoYy900YZAC54MfAQ"} },
            { modLen: 3072,
              spkiPubKey: 'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEA3yFwWj1hAK9wNTerJwcoCygHRhuagC9xeeDibeRUCmRlZSUbZ/qhi8nEBmLg5mUZL5xRJV6AuGDqMpOamABo+JmEeLjGsrYsUVRcRlLK4GvVPYucIXNuHsmH7zA8hltx5rfFGuzY4EUYzUI8KAbJ4Z7AbxxxuukoNTItFpgzmUTkwl3dj9Hckv5v5npD7W5hK13rYPUrWPYsyC6ux0O+ozI2z8eSGwWjWq66xmjaUN1ZvGVvVKM5jZ9FpneYGZD+f5Nl+3OU3YE2sDqNnNoaNozJ+YFbcJ9Ck7c3fGQFi24Eq2kGGnSB12DvUy66qXcWmBwNwPV/T8ZrzKvmlEGwJRLGIEDAoKr7j+6Iw6/Bkyj/uHw7kn9ZxheX8ms65mcKRO6OxpF/4DOX0lptdYNpJS5NcrLM4XvuyJYNQC0DbBgn9SVUEk0kFKWFK6zHl8AncxTYraNLXZ1YfzAJRCUYGqr3I4sBTea0upHtncH9KYyHIpXZasYtbCl2/gYF2DrVAgMBAAE=',
              pkcsPrvKey: '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',
              jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"3yFwWj1hAK9wNTerJwcoCygHRhuagC9xeeDibeRUCmRlZSUbZ_qhi8nEBmLg5mUZL5xRJV6AuGDqMpOamABo-JmEeLjGsrYsUVRcRlLK4GvVPYucIXNuHsmH7zA8hltx5rfFGuzY4EUYzUI8KAbJ4Z7AbxxxuukoNTItFpgzmUTkwl3dj9Hckv5v5npD7W5hK13rYPUrWPYsyC6ux0O-ozI2z8eSGwWjWq66xmjaUN1ZvGVvVKM5jZ9FpneYGZD-f5Nl-3OU3YE2sDqNnNoaNozJ-YFbcJ9Ck7c3fGQFi24Eq2kGGnSB12DvUy66qXcWmBwNwPV_T8ZrzKvmlEGwJRLGIEDAoKr7j-6Iw6_Bkyj_uHw7kn9ZxheX8ms65mcKRO6OxpF_4DOX0lptdYNpJS5NcrLM4XvuyJYNQC0DbBgn9SVUEk0kFKWFK6zHl8AncxTYraNLXZ1YfzAJRCUYGqr3I4sBTea0upHtncH9KYyHIpXZasYtbCl2_gYF2DrV"},
              jwkPrvKey: {"alg":"RS1","d":"Bq4PmQQBZW3bJBy4iQCT2FGodhbZd0D0Wru6y6NsSKtcxbxop6I_N9ogfjhzlzIroNtDKqU7oUl1eXIlzKsmeVrPNnYBrNP7W6v03z4XSMSxq5gEYpP8Ffvej_CXv0X5kPirc_TnQT-QUITNHD2nyZNhG3J0jS3xwDXyV5zS3qHLX25D9cxImDX5z6KVagRF8HBtXYe5dn5YNN4A6YJDsMsODQZif2CZ1VspyErXTlhyGUvIG3aPgIfmI-esrAdFKOkRC6RdLs9CoAWpvzES5tcAo_McD8OyLRHDsQeW1ciZw9X338g3uFUMoEfPaojFrTZuI9DNd7fRYrDuvE6HuAlOcGr4ImYurhPXkqdgX_uGqTV4nnLcC_D1Z5w51c0lAzi45DLzJedTZeollx0bh6TF-CXcaeFYwKlWJpkcvz9rNLbYwbB97YHm6w5RGypvS1TksGjL41DJdHQG1h6ZJU5h4bCaKQTfV7iNinI4qqouU0viSm0Ru07FcVzw2TMB","dp":"4dmPzev30X5J8tkraCANk1n1_xUuBarhLjX1xixNBE2hGt9GruJA7Cv7McXvmOvHwiHl9D2eVoDgKPRPh3WqCoz2mLGakujelM5Gt3ncPlimieySf3ErN8NuiuyWTaZ8R2ihEZizn4l7a93FkI-xsqHDy07DMQ3of6ibFL6hFbrm-bj-DW_6C6YyQqaGaXx-IvKLkI2pzaK9kxJBV-1g46hfo9ipbgNN_gDrJ8fk7Chwg_KRkpHDbpyceZ49f7Mh","dq":"1XQxV0b4sH-VvuU-a4CEKXQnUkYlp1kAhWOI4FjqWd2obGbfj2FTUJWFrChtmvjys36RD-CCOHKh_sXdvMVYaAldm6aCx46v8Ibvb8jblwCb1eknKwmiKBEOtwzMJvJxZbR_T2iSVb1GvYeOym7ZUhJDdGF8BHulmvCk90w2BOWOucgyWeDNMNYX7wbIo0bSdA4sb8k_cTVOF_Ywx8jF_rYDdZG6Sqw3VUdTuNfHfQwXUE5AGi4Bo2LnZ1T0nERt","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"3yFwWj1hAK9wNTerJwcoCygHRhuagC9xeeDibeRUCmRlZSUbZ_qhi8nEBmLg5mUZL5xRJV6AuGDqMpOamABo-JmEeLjGsrYsUVRcRlLK4GvVPYucIXNuHsmH7zA8hltx5rfFGuzY4EUYzUI8KAbJ4Z7AbxxxuukoNTItFpgzmUTkwl3dj9Hckv5v5npD7W5hK13rYPUrWPYsyC6ux0O-ozI2z8eSGwWjWq66xmjaUN1ZvGVvVKM5jZ9FpneYGZD-f5Nl-3OU3YE2sDqNnNoaNozJ-YFbcJ9Ck7c3fGQFi24Eq2kGGnSB12DvUy66qXcWmBwNwPV_T8ZrzKvmlEGwJRLGIEDAoKr7j-6Iw6_Bkyj_uHw7kn9ZxheX8ms65mcKRO6OxpF_4DOX0lptdYNpJS5NcrLM4XvuyJYNQC0DbBgn9SVUEk0kFKWFK6zHl8AncxTYraNLXZ1YfzAJRCUYGqr3I4sBTea0upHtncH9KYyHIpXZasYtbCl2_gYF2DrV","p":"8KXTeK4RQyPFayq98J9zKvJzFlFslLmTf3QJMMa622nWFubQKDGDCb0tti1IBVdx6bTKa-fSCLIRIW-zd0EMPeDdHaOsMYss3txMqDPK15f3lill9a9S9ZF4yELmGZ305R7fW3ydciroPnhdynBLmAthiz8N3QBG6ZuyH7bWYEUcZHlAC2EfAIvWu1t3mUpwJn6DoLE_9v7TwGsrDtdLKw3ccrFex1PN8YDAfjVaY5893QJkJ2M6szaMmP6V2l5h","q":"7V2HdUddFsjFIYiqPoUDb4_4CQ8NBB3MNOPU8a19ImPAZhfHElj7E_99EZjX2RLULXngItOTosTg_vYTovhJRtU1PvjddE1VkrthnuIgDDctnb1T7UF6k1QaZKkOVnGOaT2IrR_uD8QlG6QEiyWPOyfuIe3NJJy3AWmt2-z_VN79dL4nRJssOOrqErvDJOFuhbZtaSGACNjfZZbFZep4qLHTcJde_Kc1hHLe92SQY_T8W3gcfzq9cBNv_NtO1Oj1","qi":"rB6PdO61kGpTE0MRtUIKJl2jflj53dX3xMCYgX5CLKJs9YexKYCT490t-m5fYai6Oud-kuQN12W-JM_t42oIu035S4xg0hmrtZVEqsmrZYOR-zDtu3QY437UMgLBYRM2XZQLpLB9RbapmU7Nte9F1OPKtiYJqfFIrTGe75w5TGplV0_K_5PJ5Na_dNyzZxl7Z8PoH-uGl6QWLifeYwQ9n29PEAF5CACJ4Bb9_cMoJ-70i-fENvQuX1LW5KsCPsAC"} },
            { modLen: 4096,
              spkiPubKey: 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAr8JV9r7hQgofgxHGFpL/CUhz1QCynLR1aKqwcpEbtVs5eXfZTVSeE/ASc1qhmFbIQ9MGCui77lntDKuWwaAxRwP5bXVHVvGl1swbsM1YSzSm4rwud9wmeKizoMcvLO4nTMSwmJEFN0rQvmpnnFf+eXM0HEzEr9+qZqPbv9k8r7TCLUJZXo/52ntRavEAYcGA4UCcnrSPQeyCkmNLNYGR7bfRjBy/Ok4SwGSW81gKmzt9Y68Ptsp+xkLKslUffQe3QaMTe5E31ycSJyS2ywJv8TP80nuQtQrsgj5NmU7GHufTFd6KAnY3xBozXhUBWYUqjXvrSBdFYi5iVu4SsY31wivha1wGX/uOlm4lV7lBVbKyh8Tuvq5sid7snRk5y7ERTlywtJR85o++qevDi/2FNxOibnJoFHAWlxKVtn8yshZFc4Kmy5R84tFptoFeda+zCSYlwtHQBuYOoTm6F+ESMDRK3JuEr07cMZ7QD+VR4LRDEGJCqrtDccB11JOQu32Ds06odB8fsY9ikCbaQW91nvQcQ1CfiFTG7vYRiLM/4rkClBvmKfG0apluctQ1FZZgKV8LQF3FG1644GJlcuwWXUA5j8fdtvgLlKybpuNKN9E9THZgsFRSx/uvWoBL7GdyY82FXKDqVcKFlv6N9MH1GKsAb6jRj5yybjM80LHtKZECAwEAAQ==',
              pkcsPrvKey: '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',
              jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"r8JV9r7hQgofgxHGFpL_CUhz1QCynLR1aKqwcpEbtVs5eXfZTVSeE_ASc1qhmFbIQ9MGCui77lntDKuWwaAxRwP5bXVHVvGl1swbsM1YSzSm4rwud9wmeKizoMcvLO4nTMSwmJEFN0rQvmpnnFf-eXM0HEzEr9-qZqPbv9k8r7TCLUJZXo_52ntRavEAYcGA4UCcnrSPQeyCkmNLNYGR7bfRjBy_Ok4SwGSW81gKmzt9Y68Ptsp-xkLKslUffQe3QaMTe5E31ycSJyS2ywJv8TP80nuQtQrsgj5NmU7GHufTFd6KAnY3xBozXhUBWYUqjXvrSBdFYi5iVu4SsY31wivha1wGX_uOlm4lV7lBVbKyh8Tuvq5sid7snRk5y7ERTlywtJR85o--qevDi_2FNxOibnJoFHAWlxKVtn8yshZFc4Kmy5R84tFptoFeda-zCSYlwtHQBuYOoTm6F-ESMDRK3JuEr07cMZ7QD-VR4LRDEGJCqrtDccB11JOQu32Ds06odB8fsY9ikCbaQW91nvQcQ1CfiFTG7vYRiLM_4rkClBvmKfG0apluctQ1FZZgKV8LQF3FG1644GJlcuwWXUA5j8fdtvgLlKybpuNKN9E9THZgsFRSx_uvWoBL7GdyY82FXKDqVcKFlv6N9MH1GKsAb6jRj5yybjM80LHtKZE"},
              jwkPrvKey: {"alg":"RS1","d":"qDWzlB0G9O8_TW-7R2uTzkybHyY1yyginfOOP3eFL0KJdSkwvYPYbnh7EA-TTHrx24eg5tvq0Kkb595owBMSVkcFdq6hgiJvd22Mqt88O22-so0rY-c8oonCsIMxMS0US7KK2NkiRtLBiRvI4aaNk6qgGt2V-ER1jxoPfELqg7bZh_tSEOB2XZVcTJ8uoGBTekEeI_3mhU9Xf8ar-h9xjDM6x3_TvHdwFtWuamK-c-axkK_AuE6AmjreR2KUalLyHk12nfJToQRxqSjIEO7aN9xrgP5ldf9obxY1qh3sGzP_n5SGPOjrYjE5LDeqPQTnvtT0TuCGtPpzf4MGPQwCQSa8LJtZsPprrwkxFDzaBaK7QkaEw4-8V-gy4ODSdXHj_h3Ok8DzoLPBqzJHeYHYgmyrEF_3cprk_QOTj0jkGYVd1UILEDwg3rmAxEC4RIzdpb6g1A4K14LcC4nGpLAIR4PypTy4eo1GKUv4BS5kz8Pv1xX2vH3CfgGwwkv4yd6t5amg26OU2y4bBuI3ZTWELU3Zc4r1IsXhsKvbjbJ2e3-el7S7NMUQB1iAbr4zHsMSLb-S4_5DCvUn7beooIcgfg7q_pCi31VI9q-n6NAJy0chbPvjqKamfXPb0T9GX2J4NVUJS6TnqnKVMsyeThPle87jwjzGD7K9SEfL3bPQ1Gk","dp":"jlhFpwTfo6iZaKv4Holu78DhvzWvNE3tdAgwohy3RSxm1EZ3JzMMLNJ9s_oiEK702k2egNM5mwhR7OKE1ozrsXw7HZNYT4t-kuWewZebZ5KcoqtHQ0O5YEvFoyvZWvRZNZpuIusYmvSt-LEcEzfw9e3bdOLAbTtgOOO-C5ZjV03CF9tZEK1e2YBQsnZhBxX-qkTAZ8V8cMR-xLCSVNohx1o98yc70d-WpHDg_k8Kh27XmrJM7HAkcNX8LMoyjzoYDCPqPi5B-EhtxE7b96O_V7GCewbFAev5rJtRD8UiQpOowEXN-tfbjznv8npYRu1oxvw7EExVjUJPWZBKsGgLsQ","dq":"s2Mc53YhS1jlfwZRRPlcP3q2qVIFqR7Bp4s2sGaZoRW4i5shRo4Ny6UzK4l5j52EHOZFWN-98c7G4757MNYSn621EQ2BuNktufcLlXzcJLwLbB78voJjg3n86dV974YOeA0wnAMqdD-YgdSBroj0baJ7f3VIlIjFYnmoM8eKr3bDKyOd0NwumgwepvjFXC-l5_TA-C7inBMezuGqQKndxGMqf3IxpJWPuZJ9VdS30vPiQ9vl34UsGyuuxGMIvA9yc8-JtsHYfuIH3FMiYa0VxbfbhxsJcr2mLAMsoU2ef6A2I2PBQetx3XMo030QFa8o8PeE_KaLBHKbNLo9Q6qeHw","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"r8JV9r7hQgofgxHGFpL_CUhz1QCynLR1aKqwcpEbtVs5eXfZTVSeE_ASc1qhmFbIQ9MGCui77lntDKuWwaAxRwP5bXVHVvGl1swbsM1YSzSm4rwud9wmeKizoMcvLO4nTMSwmJEFN0rQvmpnnFf-eXM0HEzEr9-qZqPbv9k8r7TCLUJZXo_52ntRavEAYcGA4UCcnrSPQeyCkmNLNYGR7bfRjBy_Ok4SwGSW81gKmzt9Y68Ptsp-xkLKslUffQe3QaMTe5E31ycSJyS2ywJv8TP80nuQtQrsgj5NmU7GHufTFd6KAnY3xBozXhUBWYUqjXvrSBdFYi5iVu4SsY31wivha1wGX_uOlm4lV7lBVbKyh8Tuvq5sid7snRk5y7ERTlywtJR85o--qevDi_2FNxOibnJoFHAWlxKVtn8yshZFc4Kmy5R84tFptoFeda-zCSYlwtHQBuYOoTm6F-ESMDRK3JuEr07cMZ7QD-VR4LRDEGJCqrtDccB11JOQu32Ds06odB8fsY9ikCbaQW91nvQcQ1CfiFTG7vYRiLM_4rkClBvmKfG0apluctQ1FZZgKV8LQF3FG1644GJlcuwWXUA5j8fdtvgLlKybpuNKN9E9THZgsFRSx_uvWoBL7GdyY82FXKDqVcKFlv6N9MH1GKsAb6jRj5yybjM80LHtKZE","p":"3uwbNKyAd9plmuzFlQdf1HFzJ3D9kLHz-RXOcFkHTbBNhgcE7bXUP2qz1221lLtfV0X8278rsR9A4EQJKHu7R6VxKHaQ-Zy9e2ainpnxm16G6II9ESWdEeTskJMv8_JroPuRxeq7q1GizdT2e74ORvRP4qApNOCdUOuihbqAAqZBH4zNnhA-rxlEF1aYL1Frt2U45RIVkkjRg-L5If2xBYF55CLvqUCBOUF29z1498lgz4_g3fgs1YkoZEQef2quwBwhSpYMRlcM8umi9S7Hi6DTsGJFDqOG-jTwEJRMMj9leYG6BWtDudrmL-zhtut-JIoFQ6FKM4gtMcTPT1jM6w","q":"ydayRE3U0gqhiUnFzBsPu9Gq8Bajknn-Pkg0DbfivreSaQO3vBoXOOYM9_2YqLJQ2oieHQ5lwLkNqGUDAfPbwdHmIAipZYacSz9BoA60TUQp9wSs_yyfkSmr4uFIJA6itMkaoFKV5Vk1zm_RP_Ae1GRD9NcGXh9B5p5dyde-PstfKojbqwIM1apX0YPgLxEgxbhEg7qEb8h-e0Qx0LNh7YS2lTvDvzaMdDuuKkNmwEQGB2brFw6IanckNho-WDXBCGqhmXYAB5IVGRHKO_SNhCUnFLLqzTO_S1DHqV_H8R8TmIxYrrLVrwnVP19C6xbcjeSFk25GgFomeLi1GmRUcw","qi":"ehgMMBDFy5JTubQOVRbI5RzE0r67h2LNuApM-zzn4SSGBKNoW1fUBV8Xec3Ry-VPrQolskS1bNQd2Ka6sGkhKxX6RqxzTi-hBksQCtet6MnXoeylu5h6lcBP6sQb-W3T74G-1ZB1O40p3J8DNxureoy86apQ6zPToUDbuexe8dzLbfxsFDqvAbaUmugBAB3p-D1XrWdtv91AwCmkbxY0hWUAUaSgs11xhs7By_WI-5-sbyMSsr4hRUzV8MKzrQhBo8x7bUherqQKc4Rz2iPxpv2xb-FQSyNYf_vd0XFWItc-7hxL4CR2ZYvXUch67ZzcUX2heLP0TJSXlJ7AP_hMew"} },
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
              jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"vQq8OOD__87Msn_UaKLBMo1qzYoYT3RIjJAcE1AKhnRkBrIkw6mBJ0R1OjoEfB59Eppr1E06SJSSc1vWoS-3PRFHjzZqYGaHSJ2p9r9kGpCWyTRv8_5HBPKG-sYmPmT1OxazubnhO_rN_Smef0Sf4BTSCguMWZZnjJWSQmjB5Fk"},
              subvectors: [
                { text: "",
                  signature: "Wrld8ba7rlqMQPt6YemWO872ouAbkuKR9UOxSU+IwkXvyCzPWSGPIMkakTlSd6vfCCcQ38wOQEWkIgvjAno6KhL7w57zmR76SP8N4s9ZTL94fVyGVQNb58HA9cu561dBq5FmSMa48E4eb6sKFnnJrH7P+GD+7PmkDxYH9z+KJoE=" },
                { text: "Hello World!",
                  signature: "BFQnxsM1pnhN2SAWXVQDrnTVmrmFXaDYnzbTmhHmCTgH8Q6pAQJKYKVEjy+0ndOWvkftRM2pHUK900Tn61k4DXkv9bUluiqgLkHsPUYs4vEUROz2tUnQyzBacKn5+JaR0mKKlW8GkYMpHJEsCJK37QLRBnP9BCHEzpNSkvC3ba0=" },
              ] },
            { modLen: 2048,
              jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"4Bzd5DJXjzWFiNyOuOXs6YpRQZPT4Za0APAFU-6-6CHfi6tZ64Ss80ht6pSDEI02FC-mC77BMXpU__SovXiM0bOKdQ8LaYjL0H1Wy5w9YjFgxVf7xS3bTDDzTHB1JfQlSDqiWiqmoHKKJpEnGkMEva2bEucAy-7YoDhjwPvaelPxX78A0Im1bpycSluwYKSbKESWkK3mH1cAIKj8URUuZtjsB2mEpPo8S1V0SgsXP1HPsqerJx-PN4h3FlxdQ5VzLRkIcssx7e7FLPXkIAvmkqexcto1QMgaETVAdno7wAYuzPrObEt4aoP4h_pb4t0AFjEPLFpSSj7nSHeaudu9eQ"},
              subvectors: [
                { text: "",
                  signature: "efzLMPufSRE7oPf2IIchoic43DA3OcCrblzxVogedSRbJYTI0YaFqc7mkz0tusTmCb8Nx+QgGuluVfSXkPAr6u4dt6M/Pbg1qyHctqdB9r/onWZN5nkDVX/F/Gay1woaB/XdWDLiC88Jor7ebBpvwNp78TUozsqSSNwmt1tVb0SGILU6ZgRW5+Wb2uA0BB3Hw7lFAzGnCrgVFxlbI3tIVFcn5qAGSz0LxR1XHYXp6u1qd0LdbzbY/p8V+szQJQPKGgqZqvH02AzgHJH98iN301LdmPzOuFDkasQSrCGuyXx7eHo2vRi3r90Shkk52RmI7jDU8sfvYkWAe9JptfFkUQ==" },
                { text: "Hello World!",
                  signature: "wdFeRqSlEjDbsKKOD87bI5E3r1nMqdB/ol/XnV0pT0LovM0RK3TUb1vJONETf3CNnO+6p1JwXyuF084yjIw3UixeohGu7Sthnt2I+RY7uO86EOzR+ZaxccwiNSNbPNTAD9lsXUXn9aLL8hhUtjhyMgsxVeF+0+I6X7bcUZXKLk0JMKA9MSkPmw0kalZ1cJQsGTE47kllXUk3B5KO4QSVtDiGmUY3u5sKZSihOawaT7p1atZVd36kyehyn31oYZP8oFhJ7WF5pjCdGF+n4QUJe7LhZiEYAlTY9qeYMw9xx8ptBhGHtPojfTeX8D7Ho3SD8reBzZUc2uUfz1/sG+22mw==" },
              ] },
            { modLen: 3072,
              jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"3yFwWj1hAK9wNTerJwcoCygHRhuagC9xeeDibeRUCmRlZSUbZ_qhi8nEBmLg5mUZL5xRJV6AuGDqMpOamABo-JmEeLjGsrYsUVRcRlLK4GvVPYucIXNuHsmH7zA8hltx5rfFGuzY4EUYzUI8KAbJ4Z7AbxxxuukoNTItFpgzmUTkwl3dj9Hckv5v5npD7W5hK13rYPUrWPYsyC6ux0O-ozI2z8eSGwWjWq66xmjaUN1ZvGVvVKM5jZ9FpneYGZD-f5Nl-3OU3YE2sDqNnNoaNozJ-YFbcJ9Ck7c3fGQFi24Eq2kGGnSB12DvUy66qXcWmBwNwPV_T8ZrzKvmlEGwJRLGIEDAoKr7j-6Iw6_Bkyj_uHw7kn9ZxheX8ms65mcKRO6OxpF_4DOX0lptdYNpJS5NcrLM4XvuyJYNQC0DbBgn9SVUEk0kFKWFK6zHl8AncxTYraNLXZ1YfzAJRCUYGqr3I4sBTea0upHtncH9KYyHIpXZasYtbCl2_gYF2DrV"},
              subvectors: [
                { text: "",
                  signature: "QXiVBWA9y8joOzA/erxr3yThLMQITfFdUrhx3Wp/P804b1YoROrc3WFnSvywwmP41p+f9Ov2NfE0rL2Ar4NGBkf2dST7N1hOAHpyiw0GaQb+jVjNHG3v7C5bIUZ4Q11yi39sm7Zg5jZDKkB/CH/g3Nrj0XrkJc86ivtqgg2WXQKL5T39AoFYqtaSwOVv0sEIexw3iXGPNsqKXWQEvsuEdJsw5ZP20OhGQ+RZnJ6zPadx6FNqyMrn24J++DaAPCgz7fCPjIYMSV3jIfNWm68m9N6F162syAFavt6bdedDFgU5GR5hfpE2HGwC773tCHeClDMYxQp1ZZp2lKcPD7KtENJ8o+C40UTv/pKngeJz3iInL9R3hIfzVHC3KI0BW8eVRuawfNGh4tvnSw/DpdipykmhFQ5xmxVw7qZ5q0v7Rf+Sl2/k2DuALc0Y9jBITsNOoJWQOmJoX0mXllS01VSXVxGNMguJWumBlNcEfqYO6qb8Y1RbWWLZsunrVFBO5JXm" },
                { text: "Hello World!",
                  signature: "w5FLdI5bY7tjgrdqU/q4r585wenx76hGqmpqTfmiMKojIuS6spDQDOdV4JuJhBBCEq8Riscw4Jd3ngOagwW8lvvmkRcVyu7jv/DI6yV+/EtxN2r0nQT969dixPHkGQmCvFWenFTdZ5scey5studbJ+qur9OLrE/Hh1t2aHeECOhm/shIGVepn026ly2P1eAxnxDz6F1Gcs8epgsJQ2/9ql9rWWOrjCXXPhhoyKWtvMpDInIESpSu1W0llWJl7TtHBJZsuJotalZ82S2ijc/l5figEPmoM9q1WNEpK1sJFN7NPpp8WFMT60bo0yc2LLHt5D+wy4TklYmXA7uEa8wHm1HxblLEv4YswDRa2NYlmXImGFJ68nhYqKJlNfZEjMgHTY/2xG+ZOaM5SRLq2tfHNXrdt11wLJLU4OOGIsB5FUL84PyV3WfQ2WBsyVc1nHtjfKe1BgBN3mDYec4G/z0YKproIE3/r1Vw6p360Rvn5IJsNd6QoLxp83o9GGzmlpTN" },
              ] },
            { modLen: 4096,
              jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"r8JV9r7hQgofgxHGFpL_CUhz1QCynLR1aKqwcpEbtVs5eXfZTVSeE_ASc1qhmFbIQ9MGCui77lntDKuWwaAxRwP5bXVHVvGl1swbsM1YSzSm4rwud9wmeKizoMcvLO4nTMSwmJEFN0rQvmpnnFf-eXM0HEzEr9-qZqPbv9k8r7TCLUJZXo_52ntRavEAYcGA4UCcnrSPQeyCkmNLNYGR7bfRjBy_Ok4SwGSW81gKmzt9Y68Ptsp-xkLKslUffQe3QaMTe5E31ycSJyS2ywJv8TP80nuQtQrsgj5NmU7GHufTFd6KAnY3xBozXhUBWYUqjXvrSBdFYi5iVu4SsY31wivha1wGX_uOlm4lV7lBVbKyh8Tuvq5sid7snRk5y7ERTlywtJR85o--qevDi_2FNxOibnJoFHAWlxKVtn8yshZFc4Kmy5R84tFptoFeda-zCSYlwtHQBuYOoTm6F-ESMDRK3JuEr07cMZ7QD-VR4LRDEGJCqrtDccB11JOQu32Ds06odB8fsY9ikCbaQW91nvQcQ1CfiFTG7vYRiLM_4rkClBvmKfG0apluctQ1FZZgKV8LQF3FG1644GJlcuwWXUA5j8fdtvgLlKybpuNKN9E9THZgsFRSx_uvWoBL7GdyY82FXKDqVcKFlv6N9MH1GKsAb6jRj5yybjM80LHtKZE"},
              subvectors: [
                { text: "",
                  signature: "dZydTzAOuKXomQ5clUywEQteb3LyzawW0jOkG8G+/N2+ES4Ltd8Y3mZ99NabQd0GBOXoO8n6SV+uVF8cd5jHgrHtqgDlA+5uZs+7pKPx0jdyRRhjbux3nlpMrXD6pqKGiTVGIHbj6hMJw3wWhNLSi1WXKnjyYEMh8dlNYqHArf41PDs44FuoF8HwkGK5e2wMH+Gf+0hV7nD8DF9M5U5lbntrhxWbPBe7mvIuZMLeqiywJMRyYIMvsSTrD/r06SEKfp4JLsnzud8M+gE4Hq8urkuNhf81j+pcCDCtCxp/eN8dzqsjweyab+jDL/4KLoi5ghOYkwc5MP5dxNiCmu/MHpSOkKicABn4svJEsHYCeeT8INng1ssJxVHbkR3ov7PodwBi7yMZcCxkq/KDXPKWo8vSWekLsXX6F96KPNTolb/Gr8+udmZsNkKv4Toi5bffjq6S597y/zBS7Sk2X51ZqhyDxpkdO76Vaxd0yBNQTFfi64u0WlS+kycM+ALKDYG5lAMVLdwdaIZsUDo3TSghsrKLW6bubQCgCkoLalJRKDNgzypKMQ0EhMDfEqASLldEsxTY1k27ZjVEeQYLZ00OrQeNedC6IqrcM5i19R0Gm/tbIFKwbQx7IX8W353TQqUAHY1T3wvEB8wY6EihgBWJU43rcK+216K/Ua2I+21r9qI=" },
                { text: "Hello World!",
                  signature: "Gqn6cx+XvLLOISfCYECHLDGhXsgUQ4flKx25ocGag12ZXDDCTHSu0hD8VBDXkiSflxgiYuTYzo2Ehb2sdfeg/auCdzIfedvGA2pnH51OrtVYlhFkuMOWtdqYOsr7yVVgKCJAN+jEZty8chxFUkZK4+ZolflkSz0oDoTx1PufDHabcE+iA4gBTyit49bGDEgbaAJdZZbth3qV3jSnoiVUp7MM2bpZrunva4XpEvhBrnsBxSJBisitVEa1UNYNl3GzgQpgGi+MvEglRIjFos31afVMNqQinmKQwwX2fnRNeQR6JamdS1cFXQ2K577oI3fKIjjSJfbsPP4dZP1v1JiqENpGjBFkTHQa4x+uisNZeJftSekdHSRI6XjfyVto9hPFVNILZ9uKfLNfbZqPKpTjublWAKTF+Ef/R4VGfRSyAso1mcrrOWO2mTKr40DVNHUts5aAngv0DP7Ig7YQphUaRDaMCrpoKI+R38xcfid8joaDJsYD7g5KfsEB4dvU6wwwl2+YcuO6r4bq5LWSH7APB02i9tPqOtWdQmEmTsncsf9Iu3XiaSQbCYLo3l27pBQY1cvv2KhJwxW/1mCoUGt39HqgaLAuWQ8a28Ku4SxIDuteWvS3koj1Nm8d25b5AgTpsXC69Fff+SY9Z0OSCKGv5OfUqjAavi3gF+zHFmsuLzA=" },
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
      spkiPubKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9Crw44P//zsyyf9RoosEyjWrNihhPdEiMkBwTUAqGdGQGsiTDqYEnRHU6OgR8Hn0SmmvUTTpIlJJzW9ahL7c9EUePNmpgZodInan2v2QakJbJNG/z/kcE8ob6xiY+ZPU7FrO5ueE7+s39KZ5/RJ/gFNIKC4xZlmeMlZJCaMHkWQIDAQAB',
      pkcsPrvKey: 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAL0KvDjg///OzLJ/1GiiwTKNas2KGE90SIyQHBNQCoZ0ZAayJMOpgSdEdTo6BHwefRKaa9RNOkiUknNb1qEvtz0RR482amBmh0idqfa/ZBqQlsk0b/P+RwTyhvrGJj5k9TsWs7m54Tv6zf0pnn9En+AU0goLjFmWZ4yVkkJoweRZAgMBAAECgYA0UDw2IU22pKvQ2b8WFbQRIUFlD8oacruA6oBad9Px0VO85p915fpvu2oVaujC0E0cUM92OMjgPP0qH0gN4v551TEMFKjHNtgBqDb/1LDZ711p+L295CgFN2O5OadNlUjwSEcrsv/qlPdHvMf+YhTGkb8QqAG1eM09JEDjGGGgAQJBAPcqfIg72BvsCTfDtCsCfThvqXkDuha9FXOM3T3L0u8BjNmSBPk2PPFWlFVbqYSS1zk9LHtTS96nrNYPms3Q6dkCQQDDzG1HPShsfquwiIgztU+mMWGX2wZFaJp43aZSQT+UzRhB/sGYanABbCnfccRUnXS4uKDvnFmRUR/BWFEzNb6BAkAXJhmHwOMaql6qpF+pb5A+yuZ6eQjivE7YBadq9D4LOH/ymKRymsvWZp955x3XVtFlgP87ha+jaNzdJ5T+FcTxAkA1EmA8gxNF9T/MZfWlLmwcfB4b7z5P6f6U7F98xDrbtovwt4D6Mz+Q4ySmcEvrM5LDzyewSwzsGrUkzy+TVeoBAkEAz/3NoZF6zxMZjp6SQaO86xbrqgCJZJKJFxixZ9f/6LYFz8nSbSN4GSWZY1a4KN6RUX/qQnVJ8IBXdgNC+ov1ww==',
      jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"vQq8OOD__87Msn_UaKLBMo1qzYoYT3RIjJAcE1AKhnRkBrIkw6mBJ0R1OjoEfB59Eppr1E06SJSSc1vWoS-3PRFHjzZqYGaHSJ2p9r9kGpCWyTRv8_5HBPKG-sYmPmT1OxazubnhO_rN_Smef0Sf4BTSCguMWZZnjJWSQmjB5Fk"},
      jwkPrvKey: {"alg":"RS1","d":"NFA8NiFNtqSr0Nm_FhW0ESFBZQ_KGnK7gOqAWnfT8dFTvOafdeX6b7tqFWrowtBNHFDPdjjI4Dz9Kh9IDeL-edUxDBSoxzbYAag2_9Sw2e9dafi9veQoBTdjuTmnTZVI8EhHK7L_6pT3R7zH_mIUxpG_EKgBtXjNPSRA4xhhoAE","dp":"FyYZh8DjGqpeqqRfqW-QPsrmenkI4rxO2AWnavQ-Czh_8pikcprL1mafeecd11bRZYD_O4Wvo2jc3SeU_hXE8Q","dq":"NRJgPIMTRfU_zGX1pS5sHHweG-8-T-n-lOxffMQ627aL8LeA-jM_kOMkpnBL6zOSw88nsEsM7Bq1JM8vk1XqAQ","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"vQq8OOD__87Msn_UaKLBMo1qzYoYT3RIjJAcE1AKhnRkBrIkw6mBJ0R1OjoEfB59Eppr1E06SJSSc1vWoS-3PRFHjzZqYGaHSJ2p9r9kGpCWyTRv8_5HBPKG-sYmPmT1OxazubnhO_rN_Smef0Sf4BTSCguMWZZnjJWSQmjB5Fk","p":"9yp8iDvYG-wJN8O0KwJ9OG-peQO6Fr0Vc4zdPcvS7wGM2ZIE-TY88VaUVVuphJLXOT0se1NL3qes1g-azdDp2Q","q":"w8xtRz0obH6rsIiIM7VPpjFhl9sGRWiaeN2mUkE_lM0YQf7BmGpwAWwp33HEVJ10uLig75xZkVEfwVhRMzW-gQ","qi":"z_3NoZF6zxMZjp6SQaO86xbrqgCJZJKJFxixZ9f_6LYFz8nSbSN4GSWZY1a4KN6RUX_qQnVJ8IBXdgNC-ov1ww"},
      subvectors: [
        { text: "",
          signature: 'Wrld8ba7rlqMQPt6YemWO872ouAbkuKR9UOxSU+IwkXvyCzPWSGPIMkakTlSd6vfCCcQ38wOQEWkIgvjAno6KhL7w57zmR76SP8N4s9ZTL94fVyGVQNb58HA9cu561dBq5FmSMa48E4eb6sKFnnJrH7P+GD+7PmkDxYH9z+KJoE=' },
        { text: "Hello World!",
          signature: 'BFQnxsM1pnhN2SAWXVQDrnTVmrmFXaDYnzbTmhHmCTgH8Q6pAQJKYKVEjy+0ndOWvkftRM2pHUK900Tn61k4DXkv9bUluiqgLkHsPUYs4vEUROz2tUnQyzBacKn5+JaR0mKKlW8GkYMpHJEsCJK37QLRBnP9BCHEzpNSkvC3ba0=' },
      ] },
    { modLen: 2048,
      spkiPubKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4Bzd5DJXjzWFiNyOuOXs6YpRQZPT4Za0APAFU+6+6CHfi6tZ64Ss80ht6pSDEI02FC+mC77BMXpU//SovXiM0bOKdQ8LaYjL0H1Wy5w9YjFgxVf7xS3bTDDzTHB1JfQlSDqiWiqmoHKKJpEnGkMEva2bEucAy+7YoDhjwPvaelPxX78A0Im1bpycSluwYKSbKESWkK3mH1cAIKj8URUuZtjsB2mEpPo8S1V0SgsXP1HPsqerJx+PN4h3FlxdQ5VzLRkIcssx7e7FLPXkIAvmkqexcto1QMgaETVAdno7wAYuzPrObEt4aoP4h/pb4t0AFjEPLFpSSj7nSHeaudu9eQIDAQAB',
      pkcsPrvKey: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDgHN3kMlePNYWI3I645ezpilFBk9PhlrQA8AVT7r7oId+Lq1nrhKzzSG3qlIMQjTYUL6YLvsExelT/9Ki9eIzRs4p1DwtpiMvQfVbLnD1iMWDFV/vFLdtMMPNMcHUl9CVIOqJaKqagcoomkScaQwS9rZsS5wDL7tigOGPA+9p6U/FfvwDQibVunJxKW7BgpJsoRJaQreYfVwAgqPxRFS5m2OwHaYSk+jxLVXRKCxc/Uc+yp6snH483iHcWXF1DlXMtGQhyyzHt7sUs9eQgC+aSp7Fy2jVAyBoRNUB2ejvABi7M+s5sS3hqg/iH+lvi3QAWMQ8sWlJKPudId5q52715AgMBAAECggEAJZoyULtxnYGpahE3kSZi3bxrbclT36Hdidq7yh1gwqoMS+7wI2gbbKZWaumIJBrNXA2ymn3jBF42LMvsE/5KAlVRgdqIW6isKcsd6QPJ+NO4HORqRecvyFTePZEQ1tFj//52hxJo6rrNGzN3kBx2iyy5vC4uIAlvJ1LOye539dYXPPLazHP6OMCTmn1ZrquPF8omWox1wZRe6IhBMEt1ZL4TkGIWTEVRDep8aSf3+ZebZPWOyrdxJKUCTA7RqTt9elE2er/D6rEjq6Bm+dZOP6N/cdvAKQ7U5MlnQKNOpbdV3HL8NnmaTgGxaFMAKMAAdpKLjAusvlRhIM2ayGikkQKBgQD+6xOAO6/WHiGRgqEUTx/MDT+uxwE8t2LnjSVNIYKVJ8dLSijrRLqixA541n7Cz/jrWVGfJmnmwDZUB4Hgc3MWzpU2SLyiuFFNnFhPntXN/kat58biWVNxw9GvRoqSRG35HqcrFcs73b9yjK+sNQY4KkHTV9KXyfKx60VI3wOT5wKBgQDhEFNpgKvmSCCcE5p6Q391uI6uIJZl19cHm0NjXpXpbA96mA6fMBylpwskV2pn9G6pA+slO7LeGpyReqp8/4IHrTxgLjH6Vr4xJQ4DpMFQyB2c42BiWBEnnN0v6t8CZKPEWmbOa7DsMTnfzNAfb0FhbKfxpH701/69w6nO97n3nwKBgQDr29sOMatuhDBw7plVLiRwau26K5zEbbUQIvMZW2Dz2ns1+SbFD7FTee0d9vAQFdbtApZXl3YyrzNVKiEL6CXbO0aplEEcmUd4dKjs+jw+PP9uVl4Y/acMQq8W6kC6NqA9+BOZ9K828+P3+51qyyC3BLok7kQGdy6bWeCgHN+1jwKBgG3gJYi9O67aCamI3ILSDxjuuCGEYUhpHl5lS3noxHFHwyrLr1/CAkpRCdx9HMKRj7DN6++qfIF4JnXTmAYcS2PqDC68fsPDs2iUuYnH1mTUvbhJPVXlvsJDD60EEkm9zkHfDI+7/Yzh32pGOFkQXK/udvM+pohsJr6IFo+nW0/rAoGBAOAgMItBWB8GTHd48fduaBUOQdQRql+dP17sqeVDrD0Zr6vGAPd/i0wriDxCIi1/NXB1wTrewIaPyFuwF18xq98uzVpocMqpICdnl31Z/6VBcGh4QKw/+3C1o9m7gO945gdlIqym01c3pyOMHRcImHEQwnWjKGMvdNGGQAueDHwE',
      jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"4Bzd5DJXjzWFiNyOuOXs6YpRQZPT4Za0APAFU-6-6CHfi6tZ64Ss80ht6pSDEI02FC-mC77BMXpU__SovXiM0bOKdQ8LaYjL0H1Wy5w9YjFgxVf7xS3bTDDzTHB1JfQlSDqiWiqmoHKKJpEnGkMEva2bEucAy-7YoDhjwPvaelPxX78A0Im1bpycSluwYKSbKESWkK3mH1cAIKj8URUuZtjsB2mEpPo8S1V0SgsXP1HPsqerJx-PN4h3FlxdQ5VzLRkIcssx7e7FLPXkIAvmkqexcto1QMgaETVAdno7wAYuzPrObEt4aoP4h_pb4t0AFjEPLFpSSj7nSHeaudu9eQ"},
      jwkPrvKey: {"alg":"RS1","d":"JZoyULtxnYGpahE3kSZi3bxrbclT36Hdidq7yh1gwqoMS-7wI2gbbKZWaumIJBrNXA2ymn3jBF42LMvsE_5KAlVRgdqIW6isKcsd6QPJ-NO4HORqRecvyFTePZEQ1tFj__52hxJo6rrNGzN3kBx2iyy5vC4uIAlvJ1LOye539dYXPPLazHP6OMCTmn1ZrquPF8omWox1wZRe6IhBMEt1ZL4TkGIWTEVRDep8aSf3-ZebZPWOyrdxJKUCTA7RqTt9elE2er_D6rEjq6Bm-dZOP6N_cdvAKQ7U5MlnQKNOpbdV3HL8NnmaTgGxaFMAKMAAdpKLjAusvlRhIM2ayGikkQ","dp":"69vbDjGrboQwcO6ZVS4kcGrtuiucxG21ECLzGVtg89p7NfkmxQ-xU3ntHfbwEBXW7QKWV5d2Mq8zVSohC-gl2ztGqZRBHJlHeHSo7Po8Pjz_blZeGP2nDEKvFupAujagPfgTmfSvNvPj9_udassgtwS6JO5EBncum1ngoBzftY8","dq":"beAliL07rtoJqYjcgtIPGO64IYRhSGkeXmVLeejEcUfDKsuvX8ICSlEJ3H0cwpGPsM3r76p8gXgmddOYBhxLY-oMLrx-w8OzaJS5icfWZNS9uEk9VeW-wkMPrQQSSb3OQd8Mj7v9jOHfakY4WRBcr-528z6miGwmvogWj6dbT-s","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"4Bzd5DJXjzWFiNyOuOXs6YpRQZPT4Za0APAFU-6-6CHfi6tZ64Ss80ht6pSDEI02FC-mC77BMXpU__SovXiM0bOKdQ8LaYjL0H1Wy5w9YjFgxVf7xS3bTDDzTHB1JfQlSDqiWiqmoHKKJpEnGkMEva2bEucAy-7YoDhjwPvaelPxX78A0Im1bpycSluwYKSbKESWkK3mH1cAIKj8URUuZtjsB2mEpPo8S1V0SgsXP1HPsqerJx-PN4h3FlxdQ5VzLRkIcssx7e7FLPXkIAvmkqexcto1QMgaETVAdno7wAYuzPrObEt4aoP4h_pb4t0AFjEPLFpSSj7nSHeaudu9eQ","p":"_usTgDuv1h4hkYKhFE8fzA0_rscBPLdi540lTSGClSfHS0oo60S6osQOeNZ-ws_461lRnyZp5sA2VAeB4HNzFs6VNki8orhRTZxYT57Vzf5GrefG4llTccPRr0aKkkRt-R6nKxXLO92_coyvrDUGOCpB01fSl8nysetFSN8Dk-c","q":"4RBTaYCr5kggnBOaekN_dbiOriCWZdfXB5tDY16V6WwPepgOnzAcpacLJFdqZ_RuqQPrJTuy3hqckXqqfP-CB608YC4x-la-MSUOA6TBUMgdnONgYlgRJ5zdL-rfAmSjxFpmzmuw7DE538zQH29BYWyn8aR-9Nf-vcOpzve5958","qi":"4CAwi0FYHwZMd3jx925oFQ5B1BGqX50_Xuyp5UOsPRmvq8YA93-LTCuIPEIiLX81cHXBOt7Aho_IW7AXXzGr3y7NWmhwyqkgJ2eXfVn_pUFwaHhArD_7cLWj2buA73jmB2UirKbTVzenI4wdFwiYcRDCdaMoYy900YZAC54MfAQ"},
      subvectors: [
        { text: "",
          signature: 'efzLMPufSRE7oPf2IIchoic43DA3OcCrblzxVogedSRbJYTI0YaFqc7mkz0tusTmCb8Nx+QgGuluVfSXkPAr6u4dt6M/Pbg1qyHctqdB9r/onWZN5nkDVX/F/Gay1woaB/XdWDLiC88Jor7ebBpvwNp78TUozsqSSNwmt1tVb0SGILU6ZgRW5+Wb2uA0BB3Hw7lFAzGnCrgVFxlbI3tIVFcn5qAGSz0LxR1XHYXp6u1qd0LdbzbY/p8V+szQJQPKGgqZqvH02AzgHJH98iN301LdmPzOuFDkasQSrCGuyXx7eHo2vRi3r90Shkk52RmI7jDU8sfvYkWAe9JptfFkUQ==' },
        { text: "Hello World!",
          signature: 'wdFeRqSlEjDbsKKOD87bI5E3r1nMqdB/ol/XnV0pT0LovM0RK3TUb1vJONETf3CNnO+6p1JwXyuF084yjIw3UixeohGu7Sthnt2I+RY7uO86EOzR+ZaxccwiNSNbPNTAD9lsXUXn9aLL8hhUtjhyMgsxVeF+0+I6X7bcUZXKLk0JMKA9MSkPmw0kalZ1cJQsGTE47kllXUk3B5KO4QSVtDiGmUY3u5sKZSihOawaT7p1atZVd36kyehyn31oYZP8oFhJ7WF5pjCdGF+n4QUJe7LhZiEYAlTY9qeYMw9xx8ptBhGHtPojfTeX8D7Ho3SD8reBzZUc2uUfz1/sG+22mw==' },
      ] },
    { modLen: 3072
      spkiPubKey: 'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEA3yFwWj1hAK9wNTerJwcoCygHRhuagC9xeeDibeRUCmRlZSUbZ/qhi8nEBmLg5mUZL5xRJV6AuGDqMpOamABo+JmEeLjGsrYsUVRcRlLK4GvVPYucIXNuHsmH7zA8hltx5rfFGuzY4EUYzUI8KAbJ4Z7AbxxxuukoNTItFpgzmUTkwl3dj9Hckv5v5npD7W5hK13rYPUrWPYsyC6ux0O+ozI2z8eSGwWjWq66xmjaUN1ZvGVvVKM5jZ9FpneYGZD+f5Nl+3OU3YE2sDqNnNoaNozJ+YFbcJ9Ck7c3fGQFi24Eq2kGGnSB12DvUy66qXcWmBwNwPV/T8ZrzKvmlEGwJRLGIEDAoKr7j+6Iw6/Bkyj/uHw7kn9ZxheX8ms65mcKRO6OxpF/4DOX0lptdYNpJS5NcrLM4XvuyJYNQC0DbBgn9SVUEk0kFKWFK6zHl8AncxTYraNLXZ1YfzAJRCUYGqr3I4sBTea0upHtncH9KYyHIpXZasYtbCl2/gYF2DrVAgMBAAE=',
      pkcsPrvKey: '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',
      jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"3yFwWj1hAK9wNTerJwcoCygHRhuagC9xeeDibeRUCmRlZSUbZ_qhi8nEBmLg5mUZL5xRJV6AuGDqMpOamABo-JmEeLjGsrYsUVRcRlLK4GvVPYucIXNuHsmH7zA8hltx5rfFGuzY4EUYzUI8KAbJ4Z7AbxxxuukoNTItFpgzmUTkwl3dj9Hckv5v5npD7W5hK13rYPUrWPYsyC6ux0O-ozI2z8eSGwWjWq66xmjaUN1ZvGVvVKM5jZ9FpneYGZD-f5Nl-3OU3YE2sDqNnNoaNozJ-YFbcJ9Ck7c3fGQFi24Eq2kGGnSB12DvUy66qXcWmBwNwPV_T8ZrzKvmlEGwJRLGIEDAoKr7j-6Iw6_Bkyj_uHw7kn9ZxheX8ms65mcKRO6OxpF_4DOX0lptdYNpJS5NcrLM4XvuyJYNQC0DbBgn9SVUEk0kFKWFK6zHl8AncxTYraNLXZ1YfzAJRCUYGqr3I4sBTea0upHtncH9KYyHIpXZasYtbCl2_gYF2DrV"},
      jwkPrvKey: {"alg":"RS1","d":"Bq4PmQQBZW3bJBy4iQCT2FGodhbZd0D0Wru6y6NsSKtcxbxop6I_N9ogfjhzlzIroNtDKqU7oUl1eXIlzKsmeVrPNnYBrNP7W6v03z4XSMSxq5gEYpP8Ffvej_CXv0X5kPirc_TnQT-QUITNHD2nyZNhG3J0jS3xwDXyV5zS3qHLX25D9cxImDX5z6KVagRF8HBtXYe5dn5YNN4A6YJDsMsODQZif2CZ1VspyErXTlhyGUvIG3aPgIfmI-esrAdFKOkRC6RdLs9CoAWpvzES5tcAo_McD8OyLRHDsQeW1ciZw9X338g3uFUMoEfPaojFrTZuI9DNd7fRYrDuvE6HuAlOcGr4ImYurhPXkqdgX_uGqTV4nnLcC_D1Z5w51c0lAzi45DLzJedTZeollx0bh6TF-CXcaeFYwKlWJpkcvz9rNLbYwbB97YHm6w5RGypvS1TksGjL41DJdHQG1h6ZJU5h4bCaKQTfV7iNinI4qqouU0viSm0Ru07FcVzw2TMB","dp":"4dmPzev30X5J8tkraCANk1n1_xUuBarhLjX1xixNBE2hGt9GruJA7Cv7McXvmOvHwiHl9D2eVoDgKPRPh3WqCoz2mLGakujelM5Gt3ncPlimieySf3ErN8NuiuyWTaZ8R2ihEZizn4l7a93FkI-xsqHDy07DMQ3of6ibFL6hFbrm-bj-DW_6C6YyQqaGaXx-IvKLkI2pzaK9kxJBV-1g46hfo9ipbgNN_gDrJ8fk7Chwg_KRkpHDbpyceZ49f7Mh","dq":"1XQxV0b4sH-VvuU-a4CEKXQnUkYlp1kAhWOI4FjqWd2obGbfj2FTUJWFrChtmvjys36RD-CCOHKh_sXdvMVYaAldm6aCx46v8Ibvb8jblwCb1eknKwmiKBEOtwzMJvJxZbR_T2iSVb1GvYeOym7ZUhJDdGF8BHulmvCk90w2BOWOucgyWeDNMNYX7wbIo0bSdA4sb8k_cTVOF_Ywx8jF_rYDdZG6Sqw3VUdTuNfHfQwXUE5AGi4Bo2LnZ1T0nERt","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"3yFwWj1hAK9wNTerJwcoCygHRhuagC9xeeDibeRUCmRlZSUbZ_qhi8nEBmLg5mUZL5xRJV6AuGDqMpOamABo-JmEeLjGsrYsUVRcRlLK4GvVPYucIXNuHsmH7zA8hltx5rfFGuzY4EUYzUI8KAbJ4Z7AbxxxuukoNTItFpgzmUTkwl3dj9Hckv5v5npD7W5hK13rYPUrWPYsyC6ux0O-ozI2z8eSGwWjWq66xmjaUN1ZvGVvVKM5jZ9FpneYGZD-f5Nl-3OU3YE2sDqNnNoaNozJ-YFbcJ9Ck7c3fGQFi24Eq2kGGnSB12DvUy66qXcWmBwNwPV_T8ZrzKvmlEGwJRLGIEDAoKr7j-6Iw6_Bkyj_uHw7kn9ZxheX8ms65mcKRO6OxpF_4DOX0lptdYNpJS5NcrLM4XvuyJYNQC0DbBgn9SVUEk0kFKWFK6zHl8AncxTYraNLXZ1YfzAJRCUYGqr3I4sBTea0upHtncH9KYyHIpXZasYtbCl2_gYF2DrV","p":"8KXTeK4RQyPFayq98J9zKvJzFlFslLmTf3QJMMa622nWFubQKDGDCb0tti1IBVdx6bTKa-fSCLIRIW-zd0EMPeDdHaOsMYss3txMqDPK15f3lill9a9S9ZF4yELmGZ305R7fW3ydciroPnhdynBLmAthiz8N3QBG6ZuyH7bWYEUcZHlAC2EfAIvWu1t3mUpwJn6DoLE_9v7TwGsrDtdLKw3ccrFex1PN8YDAfjVaY5893QJkJ2M6szaMmP6V2l5h","q":"7V2HdUddFsjFIYiqPoUDb4_4CQ8NBB3MNOPU8a19ImPAZhfHElj7E_99EZjX2RLULXngItOTosTg_vYTovhJRtU1PvjddE1VkrthnuIgDDctnb1T7UF6k1QaZKkOVnGOaT2IrR_uD8QlG6QEiyWPOyfuIe3NJJy3AWmt2-z_VN79dL4nRJssOOrqErvDJOFuhbZtaSGACNjfZZbFZep4qLHTcJde_Kc1hHLe92SQY_T8W3gcfzq9cBNv_NtO1Oj1","qi":"rB6PdO61kGpTE0MRtUIKJl2jflj53dX3xMCYgX5CLKJs9YexKYCT490t-m5fYai6Oud-kuQN12W-JM_t42oIu035S4xg0hmrtZVEqsmrZYOR-zDtu3QY437UMgLBYRM2XZQLpLB9RbapmU7Nte9F1OPKtiYJqfFIrTGe75w5TGplV0_K_5PJ5Na_dNyzZxl7Z8PoH-uGl6QWLifeYwQ9n29PEAF5CACJ4Bb9_cMoJ-70i-fENvQuX1LW5KsCPsAC"},
      subvectors: [
        { text: "",
          signature: 'QXiVBWA9y8joOzA/erxr3yThLMQITfFdUrhx3Wp/P804b1YoROrc3WFnSvywwmP41p+f9Ov2NfE0rL2Ar4NGBkf2dST7N1hOAHpyiw0GaQb+jVjNHG3v7C5bIUZ4Q11yi39sm7Zg5jZDKkB/CH/g3Nrj0XrkJc86ivtqgg2WXQKL5T39AoFYqtaSwOVv0sEIexw3iXGPNsqKXWQEvsuEdJsw5ZP20OhGQ+RZnJ6zPadx6FNqyMrn24J++DaAPCgz7fCPjIYMSV3jIfNWm68m9N6F162syAFavt6bdedDFgU5GR5hfpE2HGwC773tCHeClDMYxQp1ZZp2lKcPD7KtENJ8o+C40UTv/pKngeJz3iInL9R3hIfzVHC3KI0BW8eVRuawfNGh4tvnSw/DpdipykmhFQ5xmxVw7qZ5q0v7Rf+Sl2/k2DuALc0Y9jBITsNOoJWQOmJoX0mXllS01VSXVxGNMguJWumBlNcEfqYO6qb8Y1RbWWLZsunrVFBO5JXm' },
        { text: "Hello World!",
          signature: 'w5FLdI5bY7tjgrdqU/q4r585wenx76hGqmpqTfmiMKojIuS6spDQDOdV4JuJhBBCEq8Riscw4Jd3ngOagwW8lvvmkRcVyu7jv/DI6yV+/EtxN2r0nQT969dixPHkGQmCvFWenFTdZ5scey5studbJ+qur9OLrE/Hh1t2aHeECOhm/shIGVepn026ly2P1eAxnxDz6F1Gcs8epgsJQ2/9ql9rWWOrjCXXPhhoyKWtvMpDInIESpSu1W0llWJl7TtHBJZsuJotalZ82S2ijc/l5figEPmoM9q1WNEpK1sJFN7NPpp8WFMT60bo0yc2LLHt5D+wy4TklYmXA7uEa8wHm1HxblLEv4YswDRa2NYlmXImGFJ68nhYqKJlNfZEjMgHTY/2xG+ZOaM5SRLq2tfHNXrdt11wLJLU4OOGIsB5FUL84PyV3WfQ2WBsyVc1nHtjfKe1BgBN3mDYec4G/z0YKproIE3/r1Vw6p360Rvn5IJsNd6QoLxp83o9GGzmlpTN' },
      ] },
    { modLen: 4096,
      spkiPubKey: 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAr8JV9r7hQgofgxHGFpL/CUhz1QCynLR1aKqwcpEbtVs5eXfZTVSeE/ASc1qhmFbIQ9MGCui77lntDKuWwaAxRwP5bXVHVvGl1swbsM1YSzSm4rwud9wmeKizoMcvLO4nTMSwmJEFN0rQvmpnnFf+eXM0HEzEr9+qZqPbv9k8r7TCLUJZXo/52ntRavEAYcGA4UCcnrSPQeyCkmNLNYGR7bfRjBy/Ok4SwGSW81gKmzt9Y68Ptsp+xkLKslUffQe3QaMTe5E31ycSJyS2ywJv8TP80nuQtQrsgj5NmU7GHufTFd6KAnY3xBozXhUBWYUqjXvrSBdFYi5iVu4SsY31wivha1wGX/uOlm4lV7lBVbKyh8Tuvq5sid7snRk5y7ERTlywtJR85o++qevDi/2FNxOibnJoFHAWlxKVtn8yshZFc4Kmy5R84tFptoFeda+zCSYlwtHQBuYOoTm6F+ESMDRK3JuEr07cMZ7QD+VR4LRDEGJCqrtDccB11JOQu32Ds06odB8fsY9ikCbaQW91nvQcQ1CfiFTG7vYRiLM/4rkClBvmKfG0apluctQ1FZZgKV8LQF3FG1644GJlcuwWXUA5j8fdtvgLlKybpuNKN9E9THZgsFRSx/uvWoBL7GdyY82FXKDqVcKFlv6N9MH1GKsAb6jRj5yybjM80LHtKZECAwEAAQ==',
      pkcsPrvKey: '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',
      jwkPubKey: {"alg":"RS1","e":"AQAB","ext":true,"key_ops":["verify"],"kty":"RSA","n":"r8JV9r7hQgofgxHGFpL_CUhz1QCynLR1aKqwcpEbtVs5eXfZTVSeE_ASc1qhmFbIQ9MGCui77lntDKuWwaAxRwP5bXVHVvGl1swbsM1YSzSm4rwud9wmeKizoMcvLO4nTMSwmJEFN0rQvmpnnFf-eXM0HEzEr9-qZqPbv9k8r7TCLUJZXo_52ntRavEAYcGA4UCcnrSPQeyCkmNLNYGR7bfRjBy_Ok4SwGSW81gKmzt9Y68Ptsp-xkLKslUffQe3QaMTe5E31ycSJyS2ywJv8TP80nuQtQrsgj5NmU7GHufTFd6KAnY3xBozXhUBWYUqjXvrSBdFYi5iVu4SsY31wivha1wGX_uOlm4lV7lBVbKyh8Tuvq5sid7snRk5y7ERTlywtJR85o--qevDi_2FNxOibnJoFHAWlxKVtn8yshZFc4Kmy5R84tFptoFeda-zCSYlwtHQBuYOoTm6F-ESMDRK3JuEr07cMZ7QD-VR4LRDEGJCqrtDccB11JOQu32Ds06odB8fsY9ikCbaQW91nvQcQ1CfiFTG7vYRiLM_4rkClBvmKfG0apluctQ1FZZgKV8LQF3FG1644GJlcuwWXUA5j8fdtvgLlKybpuNKN9E9THZgsFRSx_uvWoBL7GdyY82FXKDqVcKFlv6N9MH1GKsAb6jRj5yybjM80LHtKZE"},
      jwkPrvKey: {"alg":"RS1","d":"qDWzlB0G9O8_TW-7R2uTzkybHyY1yyginfOOP3eFL0KJdSkwvYPYbnh7EA-TTHrx24eg5tvq0Kkb595owBMSVkcFdq6hgiJvd22Mqt88O22-so0rY-c8oonCsIMxMS0US7KK2NkiRtLBiRvI4aaNk6qgGt2V-ER1jxoPfELqg7bZh_tSEOB2XZVcTJ8uoGBTekEeI_3mhU9Xf8ar-h9xjDM6x3_TvHdwFtWuamK-c-axkK_AuE6AmjreR2KUalLyHk12nfJToQRxqSjIEO7aN9xrgP5ldf9obxY1qh3sGzP_n5SGPOjrYjE5LDeqPQTnvtT0TuCGtPpzf4MGPQwCQSa8LJtZsPprrwkxFDzaBaK7QkaEw4-8V-gy4ODSdXHj_h3Ok8DzoLPBqzJHeYHYgmyrEF_3cprk_QOTj0jkGYVd1UILEDwg3rmAxEC4RIzdpb6g1A4K14LcC4nGpLAIR4PypTy4eo1GKUv4BS5kz8Pv1xX2vH3CfgGwwkv4yd6t5amg26OU2y4bBuI3ZTWELU3Zc4r1IsXhsKvbjbJ2e3-el7S7NMUQB1iAbr4zHsMSLb-S4_5DCvUn7beooIcgfg7q_pCi31VI9q-n6NAJy0chbPvjqKamfXPb0T9GX2J4NVUJS6TnqnKVMsyeThPle87jwjzGD7K9SEfL3bPQ1Gk","dp":"jlhFpwTfo6iZaKv4Holu78DhvzWvNE3tdAgwohy3RSxm1EZ3JzMMLNJ9s_oiEK702k2egNM5mwhR7OKE1ozrsXw7HZNYT4t-kuWewZebZ5KcoqtHQ0O5YEvFoyvZWvRZNZpuIusYmvSt-LEcEzfw9e3bdOLAbTtgOOO-C5ZjV03CF9tZEK1e2YBQsnZhBxX-qkTAZ8V8cMR-xLCSVNohx1o98yc70d-WpHDg_k8Kh27XmrJM7HAkcNX8LMoyjzoYDCPqPi5B-EhtxE7b96O_V7GCewbFAev5rJtRD8UiQpOowEXN-tfbjznv8npYRu1oxvw7EExVjUJPWZBKsGgLsQ","dq":"s2Mc53YhS1jlfwZRRPlcP3q2qVIFqR7Bp4s2sGaZoRW4i5shRo4Ny6UzK4l5j52EHOZFWN-98c7G4757MNYSn621EQ2BuNktufcLlXzcJLwLbB78voJjg3n86dV974YOeA0wnAMqdD-YgdSBroj0baJ7f3VIlIjFYnmoM8eKr3bDKyOd0NwumgwepvjFXC-l5_TA-C7inBMezuGqQKndxGMqf3IxpJWPuZJ9VdS30vPiQ9vl34UsGyuuxGMIvA9yc8-JtsHYfuIH3FMiYa0VxbfbhxsJcr2mLAMsoU2ef6A2I2PBQetx3XMo030QFa8o8PeE_KaLBHKbNLo9Q6qeHw","e":"AQAB","ext":true,"key_ops":["sign"],"kty":"RSA","n":"r8JV9r7hQgofgxHGFpL_CUhz1QCynLR1aKqwcpEbtVs5eXfZTVSeE_ASc1qhmFbIQ9MGCui77lntDKuWwaAxRwP5bXVHVvGl1swbsM1YSzSm4rwud9wmeKizoMcvLO4nTMSwmJEFN0rQvmpnnFf-eXM0HEzEr9-qZqPbv9k8r7TCLUJZXo_52ntRavEAYcGA4UCcnrSPQeyCkmNLNYGR7bfRjBy_Ok4SwGSW81gKmzt9Y68Ptsp-xkLKslUffQe3QaMTe5E31ycSJyS2ywJv8TP80nuQtQrsgj5NmU7GHufTFd6KAnY3xBozXhUBWYUqjXvrSBdFYi5iVu4SsY31wivha1wGX_uOlm4lV7lBVbKyh8Tuvq5sid7snRk5y7ERTlywtJR85o--qevDi_2FNxOibnJoFHAWlxKVtn8yshZFc4Kmy5R84tFptoFeda-zCSYlwtHQBuYOoTm6F-ESMDRK3JuEr07cMZ7QD-VR4LRDEGJCqrtDccB11JOQu32Ds06odB8fsY9ikCbaQW91nvQcQ1CfiFTG7vYRiLM_4rkClBvmKfG0apluctQ1FZZgKV8LQF3FG1644GJlcuwWXUA5j8fdtvgLlKybpuNKN9E9THZgsFRSx_uvWoBL7GdyY82FXKDqVcKFlv6N9MH1GKsAb6jRj5yybjM80LHtKZE","p":"3uwbNKyAd9plmuzFlQdf1HFzJ3D9kLHz-RXOcFkHTbBNhgcE7bXUP2qz1221lLtfV0X8278rsR9A4EQJKHu7R6VxKHaQ-Zy9e2ainpnxm16G6II9ESWdEeTskJMv8_JroPuRxeq7q1GizdT2e74ORvRP4qApNOCdUOuihbqAAqZBH4zNnhA-rxlEF1aYL1Frt2U45RIVkkjRg-L5If2xBYF55CLvqUCBOUF29z1498lgz4_g3fgs1YkoZEQef2quwBwhSpYMRlcM8umi9S7Hi6DTsGJFDqOG-jTwEJRMMj9leYG6BWtDudrmL-zhtut-JIoFQ6FKM4gtMcTPT1jM6w","q":"ydayRE3U0gqhiUnFzBsPu9Gq8Bajknn-Pkg0DbfivreSaQO3vBoXOOYM9_2YqLJQ2oieHQ5lwLkNqGUDAfPbwdHmIAipZYacSz9BoA60TUQp9wSs_yyfkSmr4uFIJA6itMkaoFKV5Vk1zm_RP_Ae1GRD9NcGXh9B5p5dyde-PstfKojbqwIM1apX0YPgLxEgxbhEg7qEb8h-e0Qx0LNh7YS2lTvDvzaMdDuuKkNmwEQGB2brFw6IanckNho-WDXBCGqhmXYAB5IVGRHKO_SNhCUnFLLqzTO_S1DHqV_H8R8TmIxYrrLVrwnVP19C6xbcjeSFk25GgFomeLi1GmRUcw","qi":"ehgMMBDFy5JTubQOVRbI5RzE0r67h2LNuApM-zzn4SSGBKNoW1fUBV8Xec3Ry-VPrQolskS1bNQd2Ka6sGkhKxX6RqxzTi-hBksQCtet6MnXoeylu5h6lcBP6sQb-W3T74G-1ZB1O40p3J8DNxureoy86apQ6zPToUDbuexe8dzLbfxsFDqvAbaUmugBAB3p-D1XrWdtv91AwCmkbxY0hWUAUaSgs11xhs7By_WI-5-sbyMSsr4hRUzV8MKzrQhBo8x7bUherqQKc4Rz2iPxpv2xb-FQSyNYf_vd0XFWItc-7hxL4CR2ZYvXUch67ZzcUX2heLP0TJSXlJ7AP_hMew"},
      subvectors: [
        { text: "",
          signature: 'dZydTzAOuKXomQ5clUywEQteb3LyzawW0jOkG8G+/N2+ES4Ltd8Y3mZ99NabQd0GBOXoO8n6SV+uVF8cd5jHgrHtqgDlA+5uZs+7pKPx0jdyRRhjbux3nlpMrXD6pqKGiTVGIHbj6hMJw3wWhNLSi1WXKnjyYEMh8dlNYqHArf41PDs44FuoF8HwkGK5e2wMH+Gf+0hV7nD8DF9M5U5lbntrhxWbPBe7mvIuZMLeqiywJMRyYIMvsSTrD/r06SEKfp4JLsnzud8M+gE4Hq8urkuNhf81j+pcCDCtCxp/eN8dzqsjweyab+jDL/4KLoi5ghOYkwc5MP5dxNiCmu/MHpSOkKicABn4svJEsHYCeeT8INng1ssJxVHbkR3ov7PodwBi7yMZcCxkq/KDXPKWo8vSWekLsXX6F96KPNTolb/Gr8+udmZsNkKv4Toi5bffjq6S597y/zBS7Sk2X51ZqhyDxpkdO76Vaxd0yBNQTFfi64u0WlS+kycM+ALKDYG5lAMVLdwdaIZsUDo3TSghsrKLW6bubQCgCkoLalJRKDNgzypKMQ0EhMDfEqASLldEsxTY1k27ZjVEeQYLZ00OrQeNedC6IqrcM5i19R0Gm/tbIFKwbQx7IX8W353TQqUAHY1T3wvEB8wY6EihgBWJU43rcK+216K/Ua2I+21r9qI=' },
        { text: "Hello World!",
          signature: 'Gqn6cx+XvLLOISfCYECHLDGhXsgUQ4flKx25ocGag12ZXDDCTHSu0hD8VBDXkiSflxgiYuTYzo2Ehb2sdfeg/auCdzIfedvGA2pnH51OrtVYlhFkuMOWtdqYOsr7yVVgKCJAN+jEZty8chxFUkZK4+ZolflkSz0oDoTx1PufDHabcE+iA4gBTyit49bGDEgbaAJdZZbth3qV3jSnoiVUp7MM2bpZrunva4XpEvhBrnsBxSJBisitVEa1UNYNl3GzgQpgGi+MvEglRIjFos31afVMNqQinmKQwwX2fnRNeQR6JamdS1cFXQ2K577oI3fKIjjSJfbsPP4dZP1v1JiqENpGjBFkTHQa4x+uisNZeJftSekdHSRI6XjfyVto9hPFVNILZ9uKfLNfbZqPKpTjublWAKTF+Ef/R4VGfRSyAso1mcrrOWO2mTKr40DVNHUts5aAngv0DP7Ig7YQphUaRDaMCrpoKI+R38xcfid8joaDJsYD7g5KfsEB4dvU6wwwl2+YcuO6r4bq5LWSH7APB02i9tPqOtWdQmEmTsncsf9Iu3XiaSQbCYLo3l27pBQY1cvv2KhJwxW/1mCoUGt39HqgaLAuWQ8a28Ku4SxIDuteWvS3koj1Nm8d25b5AgTpsXC69Fff+SY9Z0OSCKGv5OfUqjAavi3gF+zHFmsuLzA=' },
      ] },
];

*/
