function s2b ( s ) {
    var b = new Uint8Array(s.length);
    for ( var i = 0; i < s.length; i++ ) b[i] = s.charCodeAt(i);
    return b;
}

function b2s ( b ) {
    if ( b instanceof ArrayBuffer ) b = new Uint8Array(b);
    return String.fromCharCode.apply( String, b );
}

function x2b ( s ) {
    if ( s.length % 2 ) s = '0'+s;
    var b = new Uint8Array(s.length/2);
    for ( var i = 0; i < s.length; i += 2 ) {
        b[i>>1] = parseInt( s.substr(i,2), 16 );
    }
    return b;
}

function b2x ( ab ) {
    var b = new Uint8Array(ab), s = '';
    for ( var i = 0; i < b.length; i++ ) {
        var h = b[i].toString(16);
        if ( h.length < 2 ) s += '0';
        s += h;
    }
    return s;
}

function extend ( o, x ) {
    var r = {};
    for ( var k in o ) r[k] = o[k];
    for ( var k in x ) r[k] = x[k];
    return r;
}

function normalizeAlg ( a ) {
    if ( typeof a === 'string' ) a = { name: a };
    if ( typeof a.hash === 'string' ) a.hash = { name: a.hash };
    var r = {};
    for ( var p in a ) r[p] = a[p];
    r.name = r.name.toUpperCase().replace('V','v');
    if ( r.hash ) r.hash = { name: r.hash.name.toUpperCase() };
    if ( r.publicExponent ) r.publicExponent = new Uint8Array(r.publicExponent);
    return r;
};

var oid2str = { 'KoZIhvcNAQEB': '1.2.840.113549.1.1.1' },
    str2oid = { '1.2.840.113549.1.1.1': 'KoZIhvcNAQEB' };

function b2der ( buf, ctx ) {
    if ( buf instanceof ArrayBuffer ) buf = new Uint8Array(buf);
    if ( !ctx ) ctx = { pos: 0, end: buf.length };

    if ( ctx.end - ctx.pos < 2 || ctx.end > buf.length ) throw new RangeError("Malformed DER");

    var tag = buf[ctx.pos++],
        len = buf[ctx.pos++];

    if ( len >= 0x80 ) {
        len &= 0x7f;
        if ( ctx.end - ctx.pos < len ) throw new RangeError("Malformed DER");
        for ( var xlen = 0; len--; ) xlen <<= 8, xlen |= buf[ctx.pos++];
        len = xlen;
    }

    if ( ctx.end - ctx.pos < len ) throw new RangeError("Malformed DER");

    var rv;

    switch ( tag ) {
        case 0x02: // Universal Primitive INTEGER
            rv = buf.subarray( ctx.pos, ctx.pos += len );
            break;
        case 0x03: // Universal Primitive BIT STRING
            if ( buf[ctx.pos++] ) throw new Error( "Unsupported bit string" );
            len--;
        case 0x04: // Universal Primitive OCTET STRING
            rv = new Uint8Array( buf.subarray( ctx.pos, ctx.pos += len ) ).buffer;
            break;
        case 0x05: // Universal Primitive NULL
            rv = null;
            break;
        case 0x06: // Universal Primitive OBJECT IDENTIFIER
            var oid = btoa( b2s( buf.subarray( ctx.pos, ctx.pos += len ) ) );
            if ( !( oid in oid2str ) ) throw new Error( "Unsupported OBJECT ID " + oid );
            rv = oid2str[oid];
            break;
        case 0x30: // Universal Constructed SEQUENCE
            rv = [];
            for ( var end = ctx.pos + len; ctx.pos < end; ) rv.push( b2der( buf, ctx ) );
            break;
        default:
            throw new Error( "Unsupported DER tag 0x" + tag.toString(16) );
    }

    return rv;
}

function der2b ( val, buf ) {
    if ( !buf ) buf = [];

    var tag = 0, len = 0,
        pos = buf.length + 2;

    buf.push( 0, 0 ); // placeholder

    if ( val instanceof Uint8Array ) {  // Universal Primitive INTEGER
        tag = 0x02, len = val.length;
        for ( var i = 0; i < len; i++ ) buf.push( val[i] );
    }
    else if ( val instanceof ArrayBuffer ) { // Universal Primitive OCTET STRING
        tag = 0x04, len = val.byteLength, val = new Uint8Array(val);
        for ( var i = 0; i < len; i++ ) buf.push( val[i] );
    }
    else if ( val === null ) { // Universal Primitive NULL
        tag = 0x05, len = 0;
    }
    else if ( typeof val === 'string' && val in str2oid ) { // Universal Primitive OBJECT IDENTIFIER
        var oid = s2b( atob( str2oid[val] ) );
        tag = 0x06, len = oid.length;
        for ( var i = 0; i < len; i++ ) buf.push( oid[i] );
    }
    else if ( val instanceof Array ) { // Universal Constructed SEQUENCE
        for ( var i = 0; i < val.length; i++ ) der2b( val[i], buf );
        tag = 0x30, len = buf.length - pos;
    }
    else if ( typeof val === 'object' && val.tag === 0x03 && val.value instanceof ArrayBuffer ) { // Tag hint
        val = new Uint8Array(val.value), tag = 0x03, len = val.byteLength + 1;
        buf.push(0); for ( var i = 0; i < len; i++ ) buf.push( val[i] );
    }
    else {
        throw new Error( "Unsupported DER value " + val );
    }

    if ( len >= 0x80 ) {
        var xlen = len, len = 4;
        buf.splice( pos, 0, (xlen >> 24) & 0xff, (xlen >> 16) & 0xff, (xlen >> 8) & 0xff, xlen & 0xff );
        while ( len > 1 && !(xlen >> 24) ) xlen <<= 8, len--;
        if ( len < 4 ) buf.splice( pos, 4 - len );
        len |= 0x80;
    }

    buf.splice( pos - 2, 2, tag, len );

    return buf;
}

describe( 'Util', function () {
    it( 's2b', function () {
        expect( s2b('') ).toEqual( new Uint8Array() );
        expect( s2b('a') ).toEqual( new Uint8Array([97]) );
        expect( s2b( unescape( encodeURIComponent("\uD83D\uDE80") ) ) ).toEqual( new Uint8Array([0xF0,0x9F,0x9A,0x80]) ); // Unicode ROCKET
    });

    it( 'b2s', function () {
        expect( b2s( new Uint8Array() ) ).toBe('');
        expect( b2s( new Uint8Array([97]) ) ).toBe('a');
        expect( decodeURIComponent( escape( b2s( new Uint8Array([0xF0,0x9F,0x9A,0x80]) ) ) ) ).toBe("\uD83D\uDE80"); // Unicode ROCKET
    });

    it( 'x2b', function () {
        expect( x2b('') ).toEqual( new Uint8Array() );
        expect( x2b('0') ).toEqual( new Uint8Array(1) );
        expect( x2b('10203') ).toEqual( new Uint8Array([1,2,3]) );
    });

    it( 'b2x', function () {
        expect( b2x( new ArrayBuffer() ) ).toBe( '' );
        expect( b2x( new Uint8Array(1) ) ).toBe( '00' );
        expect( b2x( new Uint8Array([1,2,3]) ) ).toBe( '010203' );
    });

    it( 'normalizeAlg', function () {
        expect( normalizeAlg('sha-1') ).toEqual( { name: 'SHA-1' } );
        expect( normalizeAlg('Sha-256') ).toEqual( { name: 'SHA-256' } );
        expect( normalizeAlg( { name: 'hmac', hash: 'sha-1' } ) ).toEqual( { name: 'HMAC', hash: { name: 'SHA-1' } } );
        expect( normalizeAlg( { name: 'hmac', hash: 'sha-1', length: 160 } ) ).toEqual( { name: 'HMAC', hash: { name: 'SHA-1' }, length: 160 } );
    });

    it( 'b2der', function () {
        var buf = s2b( atob('MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBANhqanvyA6bx1ILuWA8H3f/oV1ghZOd3WsIyFjli8bDrdPqAjIqQJL0uvU6spB/QPsj44y5pXswAXdekus6Jibe1N+/0swA/5lDpQro7PTTOWc3Gv5WSm1F8GJrmoR8raaNzHG/D+iv1Rm/0Pr0unUKUUKwWRc6X4VclhwiihuL5AgMBAAECgYEAseb41h7ipbASU/d+aAy9kAr9EjORcT2KXC00W8RcjmVgajSWU6meqe3sLOp6mLRliGwgxRxVkzmR6x09e19Q1zIM8qyHVL1hkVVcWcvPS0wd5Dc0FhpaXBeSiRu1Vkzk+jMCA60IBzobWvvuEqglOitqBEaLPJwTM/E6N2ddggECQQD4tYSi7goCW1b05o3O99oYN2584Ns3H3a92AawUgAyi9HkW7MeJdtvE5gQ+GVxP/iUIxpjgjksoA3p+0xEXJ+ZAkEA3sKL5BQB3ChOV7QJ8WIqButQ4qPO/0lg4MuJxqYDS9/2EhyFHOldKdbcmuFh8hJ+aQpcDChfvG+ngb+kTAv6YQJBAOSrAChNdCZ2lJzW3ctNVtitHojytJsZ8rLZzEyRGF1g8LplFWrCo96cxVPVDm/xwTtyivCy6p59Ck33H0g7YQECQEE/QrJfmdvegnP17COj2SOFsX9w86Sa3aF6fLSO09BZnT3Y1LSPNhaXNK647XN2L0idHDEDcmdDXREIDRupNoECQFCv/0EUecHxPXjRVg86aSUsvbCCkhuKoJCY7GpB7xJdza96oeAFmLUGrkMHeqKHzg3CWTxkLEkDyNnR36yMilA=') );
        var rv = b2der( buf, { pos: 0, end: buf.byteLength } );
        expect(rv).toEqual( [ new Uint8Array(1), [ '1.2.840.113549.1.1.1', null ], jasmine.any(ArrayBuffer) ] );
        rv = b2der( rv[2], { pos: 0, end: rv[2].byteLength } );
        expect(rv).toEqual( [ new Uint8Array(1), jasmine.any(Uint8Array), new Uint8Array([1,0,1]), jasmine.any(Uint8Array), jasmine.any(Uint8Array), jasmine.any(Uint8Array), jasmine.any(Uint8Array), jasmine.any(Uint8Array), jasmine.any(Uint8Array) ] );
        // version
        expect(            rv[0]     ).toEqual(new Uint8Array(1));
        // N
        expect( btoa( b2s( rv[1] ) ) ).toEqual('ANhqanvyA6bx1ILuWA8H3f/oV1ghZOd3WsIyFjli8bDrdPqAjIqQJL0uvU6spB/QPsj44y5pXswAXdekus6Jibe1N+/0swA/5lDpQro7PTTOWc3Gv5WSm1F8GJrmoR8raaNzHG/D+iv1Rm/0Pr0unUKUUKwWRc6X4VclhwiihuL5');
        // E
        expect(            rv[2]     ).toEqual(new Uint8Array([1,0,1]));
        // D
        expect( btoa( b2s( rv[3] ) ) ).toEqual('ALHm+NYe4qWwElP3fmgMvZAK/RIzkXE9ilwtNFvEXI5lYGo0llOpnqnt7Czqepi0ZYhsIMUcVZM5kesdPXtfUNcyDPKsh1S9YZFVXFnLz0tMHeQ3NBYaWlwXkokbtVZM5PozAgOtCAc6G1r77hKoJToragRGizycEzPxOjdnXYIB');
        // P
        expect( btoa( b2s( rv[4] ) ) ).toEqual('APi1hKLuCgJbVvTmjc732hg3bnzg2zcfdr3YBrBSADKL0eRbsx4l228TmBD4ZXE/+JQjGmOCOSygDen7TERcn5k=');
        // Q
        expect( btoa( b2s( rv[5] ) ) ).toEqual('AN7Ci+QUAdwoTle0CfFiKgbrUOKjzv9JYODLicamA0vf9hIchRzpXSnW3JrhYfISfmkKXAwoX7xvp4G/pEwL+mE=');
        // dP
        expect( btoa( b2s( rv[6] ) ) ).toEqual('AOSrAChNdCZ2lJzW3ctNVtitHojytJsZ8rLZzEyRGF1g8LplFWrCo96cxVPVDm/xwTtyivCy6p59Ck33H0g7YQE=');
        // dQ
        expect( btoa( b2s( rv[7] ) ) ).toEqual('QT9Csl+Z296Cc/XsI6PZI4Wxf3DzpJrdoXp8tI7T0FmdPdjUtI82Fpc0rrjtc3YvSJ0cMQNyZ0NdEQgNG6k2gQ==');
        // Qi
        expect( btoa( b2s( rv[8] ) ) ).toEqual('UK//QRR5wfE9eNFWDzppJSy9sIKSG4qgkJjsakHvEl3Nr3qh4AWYtQauQwd6oofODcJZPGQsSQPI2dHfrIyKUA==');
    });

    it( 'der2b', function () {
        var rv;
        der2b( [ new Uint8Array(1), s2b(atob('ANhqanvyA6bx1ILuWA8H3f/oV1ghZOd3WsIyFjli8bDrdPqAjIqQJL0uvU6spB/QPsj44y5pXswAXdekus6Jibe1N+/0swA/5lDpQro7PTTOWc3Gv5WSm1F8GJrmoR8raaNzHG/D+iv1Rm/0Pr0unUKUUKwWRc6X4VclhwiihuL5')),
                                    s2b(atob('AQAB')),
                                    s2b(atob('ALHm+NYe4qWwElP3fmgMvZAK/RIzkXE9ilwtNFvEXI5lYGo0llOpnqnt7Czqepi0ZYhsIMUcVZM5kesdPXtfUNcyDPKsh1S9YZFVXFnLz0tMHeQ3NBYaWlwXkokbtVZM5PozAgOtCAc6G1r77hKoJToragRGizycEzPxOjdnXYIB')),
                                    s2b(atob('APi1hKLuCgJbVvTmjc732hg3bnzg2zcfdr3YBrBSADKL0eRbsx4l228TmBD4ZXE/+JQjGmOCOSygDen7TERcn5k=')),
                                    s2b(atob('AN7Ci+QUAdwoTle0CfFiKgbrUOKjzv9JYODLicamA0vf9hIchRzpXSnW3JrhYfISfmkKXAwoX7xvp4G/pEwL+mE=')),
                                    s2b(atob('AOSrAChNdCZ2lJzW3ctNVtitHojytJsZ8rLZzEyRGF1g8LplFWrCo96cxVPVDm/xwTtyivCy6p59Ck33H0g7YQE=')),
                                    s2b(atob('QT9Csl+Z296Cc/XsI6PZI4Wxf3DzpJrdoXp8tI7T0FmdPdjUtI82Fpc0rrjtc3YvSJ0cMQNyZ0NdEQgNG6k2gQ==')),
                                    s2b(atob('UK//QRR5wfE9eNFWDzppJSy9sIKSG4qgkJjsakHvEl3Nr3qh4AWYtQauQwd6oofODcJZPGQsSQPI2dHfrIyKUA==')) ], rv = [] );
        der2b( [ new Uint8Array(1), [ '1.2.840.113549.1.1.1', null ], new Uint8Array(rv).buffer ], rv = [] );
        expect( btoa( b2s( new Uint8Array(rv) ) ) ).toEqual('MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBANhqanvyA6bx1ILuWA8H3f/oV1ghZOd3WsIyFjli8bDrdPqAjIqQJL0uvU6spB/QPsj44y5pXswAXdekus6Jibe1N+/0swA/5lDpQro7PTTOWc3Gv5WSm1F8GJrmoR8raaNzHG/D+iv1Rm/0Pr0unUKUUKwWRc6X4VclhwiihuL5AgMBAAECgYEAseb41h7ipbASU/d+aAy9kAr9EjORcT2KXC00W8RcjmVgajSWU6meqe3sLOp6mLRliGwgxRxVkzmR6x09e19Q1zIM8qyHVL1hkVVcWcvPS0wd5Dc0FhpaXBeSiRu1Vkzk+jMCA60IBzobWvvuEqglOitqBEaLPJwTM/E6N2ddggECQQD4tYSi7goCW1b05o3O99oYN2584Ns3H3a92AawUgAyi9HkW7MeJdtvE5gQ+GVxP/iUIxpjgjksoA3p+0xEXJ+ZAkEA3sKL5BQB3ChOV7QJ8WIqButQ4qPO/0lg4MuJxqYDS9/2EhyFHOldKdbcmuFh8hJ+aQpcDChfvG+ngb+kTAv6YQJBAOSrAChNdCZ2lJzW3ctNVtitHojytJsZ8rLZzEyRGF1g8LplFWrCo96cxVPVDm/xwTtyivCy6p59Ck33H0g7YQECQEE/QrJfmdvegnP17COj2SOFsX9w86Sa3aF6fLSO09BZnT3Y1LSPNhaXNK647XN2L0idHDEDcmdDXREIDRupNoECQFCv/0EUecHxPXjRVg86aSUsvbCCkhuKoJCY7GpB7xJdza96oeAFmLUGrkMHeqKHzg3CWTxkLEkDyNnR36yMilA=');
    });
});
