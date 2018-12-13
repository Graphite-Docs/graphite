/* Based on org.bouncycastle.crypto.engines.TwofishEngine
 * 
 * FROM here: https://github.com/mitchellrj/KeePassJS/blob/master/bouncycastle/twofish.js 
 *
 * originally licensed under these terms:
 *
 * Copyright (c) 2000 - 2012 The Legion Of The Bouncy Castle
 * (http://www.bouncycastle.org)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/*global CryptoJS:true */
(function () {
    'use strict';

    // Shortcuts
    var C = CryptoJS,
        C_lib = C.lib,
        BlockCipher = C_lib.BlockCipher,
        C_algo = C.algo,
        P = [
            [ // p0
            0xA9, 0x67, 0xB3, 0xE8,
            0x04, 0xFD, 0xA3, 0x76,
            0x9A, 0x92, 0x80, 0x78,
            0xE4, 0xDD, 0xD1, 0x38,
            0x0D, 0xC6, 0x35, 0x98,
            0x18, 0xF7, 0xEC, 0x6C,
            0x43, 0x75, 0x37, 0x26,
            0xFA, 0x13, 0x94, 0x48,
            0xF2, 0xD0, 0x8B, 0x30,
            0x84, 0x54, 0xDF, 0x23,
            0x19, 0x5B, 0x3D, 0x59,
            0xF3, 0xAE, 0xA2, 0x82,
            0x63, 0x01, 0x83, 0x2E,
            0xD9, 0x51, 0x9B, 0x7C,
            0xA6, 0xEB, 0xA5, 0xBE,
            0x16, 0x0C, 0xE3, 0x61,
            0xC0, 0x8C, 0x3A, 0xF5,
            0x73, 0x2C, 0x25, 0x0B,
            0xBB, 0x4E, 0x89, 0x6B,
            0x53, 0x6A, 0xB4, 0xF1,
            0xE1, 0xE6, 0xBD, 0x45,
            0xE2, 0xF4, 0xB6, 0x66,
            0xCC, 0x95, 0x03, 0x56,
            0xD4, 0x1C, 0x1E, 0xD7,
            0xFB, 0xC3, 0x8E, 0xB5,
            0xE9, 0xCF, 0xBF, 0xBA,
            0xEA, 0x77, 0x39, 0xAF,
            0x33, 0xC9, 0x62, 0x71,
            0x81, 0x79, 0x09, 0xAD,
            0x24, 0xCD, 0xF9, 0xD8,
            0xE5, 0xC5, 0xB9, 0x4D,
            0x44, 0x08, 0x86, 0xE7,
            0xA1, 0x1D, 0xAA, 0xED,
            0x06, 0x70, 0xB2, 0xD2,
            0x41, 0x7B, 0xA0, 0x11,
            0x31, 0xC2, 0x27, 0x90,
            0x20, 0xF6, 0x60, 0xFF,
            0x96, 0x5C, 0xB1, 0xAB,
            0x9E, 0x9C, 0x52, 0x1B,
            0x5F, 0x93, 0x0A, 0xEF,
            0x91, 0x85, 0x49, 0xEE,
            0x2D, 0x4F, 0x8F, 0x3B,
            0x47, 0x87, 0x6D, 0x46,
            0xD6, 0x3E, 0x69, 0x64,
            0x2A, 0xCE, 0xCB, 0x2F,
            0xFC, 0x97, 0x05, 0x7A,
            0xAC, 0x7F, 0xD5, 0x1A,
            0x4B, 0x0E, 0xA7, 0x5A,
            0x28, 0x14, 0x3F, 0x29,
            0x88, 0x3C, 0x4C, 0x02,
            0xB8, 0xDA, 0xB0, 0x17,
            0x55, 0x1F, 0x8A, 0x7D,
            0x57, 0xC7, 0x8D, 0x74,
            0xB7, 0xC4, 0x9F, 0x72,
            0x7E, 0x15, 0x22, 0x12,
            0x58, 0x07, 0x99, 0x34,
            0x6E, 0x50, 0xDE, 0x68,
            0x65, 0xBC, 0xDB, 0xF8,
            0xC8, 0xA8, 0x2B, 0x40,
            0xDC, 0xFE, 0x32, 0xA4,
            0xCA, 0x10, 0x21, 0xF0,
            0xD3, 0x5D, 0x0F, 0x00,
            0x6F, 0x9D, 0x36, 0x42,
            0x4A, 0x5E, 0xC1, 0xE0],
            [ // p1
            0x75, 0xF3, 0xC6, 0xF4,
            0xDB, 0x7B, 0xFB, 0xC8,
            0x4A, 0xD3, 0xE6, 0x6B,
            0x45, 0x7D, 0xE8, 0x4B,
            0xD6, 0x32, 0xD8, 0xFD,
            0x37, 0x71, 0xF1, 0xE1,
            0x30, 0x0F, 0xF8, 0x1B,
            0x87, 0xFA, 0x06, 0x3F,
            0x5E, 0xBA, 0xAE, 0x5B,
            0x8A, 0x00, 0xBC, 0x9D,
            0x6D, 0xC1, 0xB1, 0x0E,
            0x80, 0x5D, 0xD2, 0xD5,
            0xA0, 0x84, 0x07, 0x14,
            0xB5, 0x90, 0x2C, 0xA3,
            0xB2, 0x73, 0x4C, 0x54,
            0x92, 0x74, 0x36, 0x51,
            0x38, 0xB0, 0xBD, 0x5A,
            0xFC, 0x60, 0x62, 0x96,
            0x6C, 0x42, 0xF7, 0x10,
            0x7C, 0x28, 0x27, 0x8C,
            0x13, 0x95, 0x9C, 0xC7,
            0x24, 0x46, 0x3B, 0x70,
            0xCA, 0xE3, 0x85, 0xCB,
            0x11, 0xD0, 0x93, 0xB8,
            0xA6, 0x83, 0x20, 0xFF,
            0x9F, 0x77, 0xC3, 0xCC,
            0x03, 0x6F, 0x08, 0xBF,
            0x40, 0xE7, 0x2B, 0xE2,
            0x79, 0x0C, 0xAA, 0x82,
            0x41, 0x3A, 0xEA, 0xB9,
            0xE4, 0x9A, 0xA4, 0x97,
            0x7E, 0xDA, 0x7A, 0x17,
            0x66, 0x94, 0xA1, 0x1D,
            0x3D, 0xF0, 0xDE, 0xB3,
            0x0B, 0x72, 0xA7, 0x1C,
            0xEF, 0xD1, 0x53, 0x3E,
            0x8F, 0x33, 0x26, 0x5F,
            0xEC, 0x76, 0x2A, 0x49,
            0x81, 0x88, 0xEE, 0x21,
            0xC4, 0x1A, 0xEB, 0xD9,
            0xC5, 0x39, 0x99, 0xCD,
            0xAD, 0x31, 0x8B, 0x01,
            0x18, 0x23, 0xDD, 0x1F,
            0x4E, 0x2D, 0xF9, 0x48,
            0x4F, 0xF2, 0x65, 0x8E,
            0x78, 0x5C, 0x58, 0x19,
            0x8D, 0xE5, 0x98, 0x57,
            0x67, 0x7F, 0x05, 0x64,
            0xAF, 0x63, 0xB6, 0xFE,
            0xF5, 0xB7, 0x3C, 0xA5,
            0xCE, 0xE9, 0x68, 0x44,
            0xE0, 0x4D, 0x43, 0x69,
            0x29, 0x2E, 0xAC, 0x15,
            0x59, 0xA8, 0x0A, 0x9E,
            0x6E, 0x47, 0xDF, 0x34,
            0x35, 0x6A, 0xCF, 0xDC,
            0x22, 0xC9, 0xC0, 0x9B,
            0x89, 0xD4, 0xED, 0xAB,
            0x12, 0xA2, 0x0D, 0x52,
            0xBB, 0x02, 0x2F, 0xA9,
            0xD7, 0x61, 0x1E, 0xB4,
            0x50, 0x04, 0xF6, 0xC2,
            0x16, 0x25, 0x86, 0x56,
            0x55, 0x09, 0xBE, 0x91]
        ],
        P_00 = 1,
        P_01 = 0,
        P_02 = 0,
        P_03 = 1,
        P_04 = 1,
        P_10 = 0,
        P_11 = 0,
        P_12 = 1,
        P_13 = 1,
        P_14 = 0,
        P_20 = 1,
        P_21 = 1,
        P_22 = 0,
        P_23 = 0,
        P_24 = 0,
        P_30 = 0,
        P_31 = 1,
        P_32 = 1,
        P_33 = 0,
        P_34 = 1,

        /* Primitive polynomial for GF(256) */
        GF256_FDBK = 0x169,
        GF256_FDBK_2 = GF256_FDBK / 2,
        GF256_FDBK_4 = GF256_FDBK / 4,

        RS_GF_FDBK = 0x14D,
        SK_STEP = 0x02020202,
        SK_BUMP = 0x01010101,
        SK_ROTL = 9, // field generator
        gMDS0 = [],
        gMDS1 = [],
        gMDS2 = [],
        gMDS3 = [],
        gSubKeys = [],
        gSBox = [],
        k64Cnt = 0,
        getByte = function (x, n) {
	    return (x >>> (n * 8)) & 0xFF;
        },
        switchEndianness = function (word) {
            return ((word & 0xff) << 24) | (((word >> 8) & 0xff) << 16) | (((word >> 16) & 0xff) << 8) | ((word >> 24) & 0xff);
        },
        LFSR1 = function (x) {
            return (x >> 1) ^ (((x & 0x01) !== 0) ? GF256_FDBK_2 : 0);
        },
        LFSR2 = function (x) {
            return (x >> 2) ^ (((x & 0x02) !== 0) ? GF256_FDBK_2 : 0) ^ (((x & 0x01) !== 0) ? GF256_FDBK_4 : 0);
        },
        Mx_X = function (x) {
            return x ^ LFSR2(x);
        }, // 5B
        Mx_Y = function (x) {
            return x ^ LFSR1(x) ^ LFSR2(x);
        }, // EF
        RS_rem = function (x) {
            var b = (x >>> 24) & 0xff,
                g2 = ((b << 1) ^ ((b & 0x80) !== 0 ? RS_GF_FDBK : 0)) & 0xff,
                g3 = ((b >>> 1) ^ ((b & 0x01) !== 0 ? (RS_GF_FDBK >>> 1) : 0)) ^ g2;
            return ((x << 8) ^ (g3 << 24) ^ (g2 << 16) ^ (g3 << 8) ^ b);
        },
        RS_MDS_Encode = function (k0, k1) {
            var r = k1,
                i;
            for (i = 0; i < 4; i += 1) // shift 1 byte at a time
            {
                r = RS_rem(r);
            }
            r ^= k0;
            for (i = 0; i < 4; i += 1) {
                r = RS_rem(r);
            }

            return r;
        },
        F32 = function (x, k32) {
            var b0 = getByte(x, 0),
                b1 = getByte(x, 1),
                b2 = getByte(x, 2),
                b3 = getByte(x, 3),
                k0 = k32[0],
                k1 = k32[1],
                k2 = k32[2],
                k3 = k32[3],
                result = 0;

            switch (k64Cnt & 3) {
            case 1:
                result = gMDS0[(P[P_01][b0] & 0xff) ^ getByte(k0, 0)] ^ gMDS1[(P[P_11][b1] & 0xff) ^ getByte(k0, 1)] ^ gMDS2[(P[P_21][b2] & 0xff) ^ getByte(k0, 2)] ^ gMDS3[(P[P_31][b3] & 0xff) ^ getByte(k0, 3)];
                break;
            case 0:
                /* 256 bits of key */
                b0 = (P[P_04][b0] & 0xff) ^ getByte(k3, 0);
                b1 = (P[P_14][b1] & 0xff) ^ getByte(k3, 1);
                b2 = (P[P_24][b2] & 0xff) ^ getByte(k3, 2);
                b3 = (P[P_34][b3] & 0xff) ^ getByte(k3, 3);
            case 3:
                b0 = (P[P_03][b0] & 0xff) ^ getByte(k2, 0);
                b1 = (P[P_13][b1] & 0xff) ^ getByte(k2, 1);
                b2 = (P[P_23][b2] & 0xff) ^ getByte(k2, 2);
                b3 = (P[P_33][b3] & 0xff) ^ getByte(k2, 3);
            case 2:
                result = gMDS0[(P[P_01][(P[P_02][b0] & 0xff) ^ getByte(k1, 0)] & 0xff) ^ getByte(k0, 0)] ^ gMDS1[(P[P_11][(P[P_12][b1] & 0xff) ^ getByte(k1, 1)] & 0xff) ^ getByte(k0, 1)] ^ gMDS2[(P[P_21][(P[P_22][b2] & 0xff) ^ getByte(k1, 2)] & 0xff) ^ getByte(k0, 2)] ^ gMDS3[(P[P_31][(P[P_32][b3] & 0xff) ^ getByte(k1, 3)] & 0xff) ^ getByte(k0, 3)];
                break;
            }
            return result;
        },
        Fe32_0 = function (x) {
            return gSBox[0x000 + 2 * (x & 0xff)] ^ gSBox[0x001 + 2 * ((x >>> 8) & 0xff)] ^ gSBox[0x200 + 2 * ((x >>> 16) & 0xff)] ^ gSBox[0x201 + 2 * ((x >>> 24) & 0xff)];
        },
        Fe32_3 = function (x) {
            return gSBox[0x000 + 2 * ((x >>> 24) & 0xff)] ^ gSBox[0x001 + 2 * (x & 0xff)] ^ gSBox[0x200 + 2 * ((x >>> 8) & 0xff)] ^ gSBox[0x201 + 2 * ((x >>> 16) & 0xff)];
        },
        TwoFish = C_algo.TwoFish = BlockCipher.extend({
            _doReset: function () {
                var k32e = [],
                    k32o = [],
                    sBoxKeys = [],
                    i, p, q, A, B, k0, k1, k2, k3,
                    b0, b1, b2, b3, m1 = [],
                    mX = [],
                    mY = [],
                    j;
                k64Cnt = this._key.words.length / 2;

                // calculate the MDS matrix

                for (i = 0; i < 256; i += 1) {
                    j = P[0][i] & 0xff;
                    m1[0] = j;
                    mX[0] = Mx_X(j) & 0xff;
                    mY[0] = Mx_Y(j) & 0xff;

                    j = P[1][i] & 0xff;
                    m1[1] = j;
                    mX[1] = Mx_X(j) & 0xff;
                    mY[1] = Mx_Y(j) & 0xff;

                    gMDS0[i] = m1[P_00] | mX[P_00] << 8 | mY[P_00] << 16 | mY[P_00] << 24;

                    gMDS1[i] = mY[P_10] | mY[P_10] << 8 | mX[P_10] << 16 | m1[P_10] << 24;

                    gMDS2[i] = mX[P_20] | mY[P_20] << 8 | m1[P_20] << 16 | mY[P_20] << 24;

                    gMDS3[i] = mX[P_30] | m1[P_30] << 8 | mY[P_30] << 16 | mX[P_30] << 24;
                }

                if (k64Cnt < 1) {
                    throw "Key size less than 64 bits";
                }

                if (k64Cnt > 4) {
                    throw "Key size larger than 256 bits";
                }

                /*
                 * k64Cnt is the number of 8 byte blocks (64 chunks)
                 * that are in the input key.  The input key is a
                 * maximum of 32 bytes (256 bits), so the range
                 * for k64Cnt is 1..4
                 */
                for (i = 0; i < k64Cnt; i++) {
                    p = i * 2;

                    // to BE
                    k32e[i] = switchEndianness(this._key.words[p]);
                    k32o[i] = switchEndianness(this._key.words[p + 1]);

                    sBoxKeys[k64Cnt - 1 - i] = RS_MDS_Encode(k32e[i], k32o[i]);
                }

                for (i = 0; i < 40 / 2; i++) {
                    q = i * SK_STEP;
                    A = F32(q, k32e);
                    B = F32(q + SK_BUMP, k32o);
                    B = B << 8 | B >>> 24;
                    A += B;
                    gSubKeys[i * 2] = A;
                    A += B;
                    gSubKeys[i * 2 + 1] = A << SK_ROTL | A >>> (32 - SK_ROTL);
                }

                /*
                 * fully expand the table for speed
                 */
                k0 = sBoxKeys[0];
                k1 = sBoxKeys[1];
                k2 = sBoxKeys[2];
                k3 = sBoxKeys[3];
                gSBox = [];
                for (i = 0; i < 256; i++) {
                    b0 = b1 = b2 = b3 = i;
                    switch (k64Cnt & 3) {
                    case 1:
                        gSBox[i * 2] = gMDS0[(P[P_01][b0] & 0xff) ^ getByte(k0, 0)];
                        gSBox[i * 2 + 1] = gMDS1[(P[P_11][b1] & 0xff) ^ getByte(k0, 1)];
                        gSBox[i * 2 + 0x200] = gMDS2[(P[P_21][b2] & 0xff) ^ getByte(k0, 2)];
                        gSBox[i * 2 + 0x201] = gMDS3[(P[P_31][b3] & 0xff) ^ getByte(k0, 3)];
                        break;
                    case 0:
                        /* 256 bits of key */
                        b0 = (P[P_04][b0] & 0xff) ^ getByte(k3, 0);
                        b1 = (P[P_14][b1] & 0xff) ^ getByte(k3, 1);
                        b2 = (P[P_24][b2] & 0xff) ^ getByte(k3, 2);
                        b3 = (P[P_34][b3] & 0xff) ^ getByte(k3, 3);
                    case 3:
                        b0 = (P[P_03][b0] & 0xff) ^ getByte(k2, 0);
                        b1 = (P[P_13][b1] & 0xff) ^ getByte(k2, 1);
                        b2 = (P[P_23][b2] & 0xff) ^ getByte(k2, 2);
                        b3 = (P[P_33][b3] & 0xff) ^ getByte(k2, 3);
                    case 2:
                        gSBox[i * 2] = gMDS0[(P[P_01]
                        [(P[P_02][b0] & 0xff) ^ getByte(k1, 0)] & 0xff) ^ getByte(k0, 0)];
                        gSBox[i * 2 + 1] = gMDS1[(P[P_11]
                        [(P[P_12][b1] & 0xff) ^ getByte(k1, 1)] & 0xff) ^ getByte(k0, 1)];
                        gSBox[i * 2 + 0x200] = gMDS2[(P[P_21]
                        [(P[P_22][b2] & 0xff) ^ getByte(k1, 2)] & 0xff) ^ getByte(k0, 2)];
                        gSBox[i * 2 + 0x201] = gMDS3[(P[P_31]
                        [(P[P_32][b3] & 0xff) ^ getByte(k1, 3)] & 0xff) ^ getByte(k0, 3)];
                        break;
                    }
                }
                return;
            },
            decryptBlock: function (M, offset) {
                var x2 = switchEndianness(M[offset]) ^ gSubKeys[4],
                    x3 = switchEndianness(M[offset + 1]) ^ gSubKeys[5],
                    x0 = switchEndianness(M[offset + 2]) ^ gSubKeys[6],
                    x1 = switchEndianness(M[offset + 3]) ^ gSubKeys[7],
                    k = 8 + 2 * 16 - 1,
                    t0, t1, r;
                for (r = 0; r < 16; r += 2) {
                    t0 = Fe32_0(x2);
                    t1 = Fe32_3(x3);
                    x1 ^= t0 + 2 * t1 + gSubKeys[k--];
                    x0 = (x0 << 1 | x0 >>> 31) ^ (t0 + t1 + gSubKeys[k--]);
                    x1 = x1 >>> 1 | x1 << 31;

                    t0 = Fe32_0(x0);
                    t1 = Fe32_3(x1);
                    x3 ^= t0 + 2 * t1 + gSubKeys[k--];
                    x2 = (x2 << 1 | x2 >>> 31) ^ (t0 + t1 + gSubKeys[k--]);
                    x3 = x3 >>> 1 | x3 << 31;
                }

                M[offset] = switchEndianness(x0 ^ gSubKeys[0]);
                M[offset + 1] = switchEndianness(x1 ^ gSubKeys[1]);
                M[offset + 2] = switchEndianness(x2 ^ gSubKeys[2]);
                M[offset + 3] = switchEndianness(x3 ^ gSubKeys[3]);
            },
            encryptBlock: function (M, offset) {
                var x0 = switchEndianness(M[offset]) ^ gSubKeys[0],
                    x1 = switchEndianness(M[offset + 1]) ^ gSubKeys[1],
                    x2 = switchEndianness(M[offset + 2]) ^ gSubKeys[2],
                    x3 = switchEndianness(M[offset + 3]) ^ gSubKeys[3],
                    k = 8,
                    t0, t1, r;
                for (r = 0; r < 16; r += 2) {
                    t0 = Fe32_0(x0);
                    t1 = Fe32_3(x1);
                    x2 ^= t0 + t1 + gSubKeys[k++];
                    x2 = x2 >>> 1 | x2 << 31;
                    x3 = (x3 << 1 | x3 >>> 31) ^ (t0 + 2 * t1 + gSubKeys[k++]);

                    t0 = Fe32_0(x2);
                    t1 = Fe32_3(x3);
                    x0 ^= t0 + t1 + gSubKeys[k++];
                    x0 = x0 >>> 1 | x0 << 31;
                    x1 = (x1 << 1 | x1 >>> 31) ^ (t0 + 2 * t1 + gSubKeys[k++]);
                }

                M[offset] = switchEndianness(x2 ^ gSubKeys[4]);
                M[offset + 1] = switchEndianness(x3 ^ gSubKeys[5]);
                M[offset + 2] = switchEndianness(x0 ^ gSubKeys[6]);
                M[offset + 3] = switchEndianness(x1 ^ gSubKeys[7]);
            }
        });

    /**
     * Shortcut functions to the cipher's object interface.
     *
     * @example
     *
     *     var ciphertext = CryptoJS.TwoFish.encrypt(message, key, cfg);
     *     var plaintext  = CryptoJS.TwoFish.decrypt(ciphertext, key, cfg);
     */
    C.TwoFish = BlockCipher._createHelper(TwoFish);

}());
