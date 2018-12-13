describe( 'General support of Web Cryptography API', function () {
    it( 'window.crypto', function () {
        expect(typeof Crypto).not.toBe('undefined');
        expect(window.crypto).toEqual(jasmine.any(Crypto));
        expect(window.crypto.getRandomValues).toEqual(jasmine.any(Function));
        expect(window.crypto.getRandomValues(new Uint8Array(10))).toEqual(jasmine.any(Uint8Array));
    });

    it( 'window.crypto.subtle', function () {
        expect(typeof CryptoKey).not.toBe('undefined');
        expect(typeof SubtleCrypto).not.toBe('undefined');
        expect(window.crypto.subtle).toEqual(jasmine.any(SubtleCrypto));
        expect(window.crypto.subtle.generateKey).toEqual(jasmine.any(Function));
        expect(window.crypto.subtle.importKey).toEqual(jasmine.any(Function));
        expect(window.crypto.subtle.exportKey).toEqual(jasmine.any(Function));
        expect(window.crypto.subtle.wrapKey).toEqual(jasmine.any(Function));
        expect(window.crypto.subtle.unwrapKey).toEqual(jasmine.any(Function));
        expect(window.crypto.subtle.encrypt).toEqual(jasmine.any(Function));
        expect(window.crypto.subtle.decrypt).toEqual(jasmine.any(Function));
        expect(window.crypto.subtle.sign).toEqual(jasmine.any(Function));
        expect(window.crypto.subtle.verify).toEqual(jasmine.any(Function));
    });
});
