module.exports = function decodeAsm (stdlib, foreign, buffer) {
  'use asm'

  // -- Imports

  var heap = new stdlib.Uint8Array(buffer)
  // var log = foreign.log
  var pushInt = foreign.pushInt
  var pushInt32 = foreign.pushInt32
  var pushInt32Neg = foreign.pushInt32Neg
  var pushInt64 = foreign.pushInt64
  var pushInt64Neg = foreign.pushInt64Neg
  var pushFloat = foreign.pushFloat
  var pushFloatSingle = foreign.pushFloatSingle
  var pushFloatDouble = foreign.pushFloatDouble
  var pushTrue = foreign.pushTrue
  var pushFalse = foreign.pushFalse
  var pushUndefined = foreign.pushUndefined
  var pushNull = foreign.pushNull
  var pushInfinity = foreign.pushInfinity
  var pushInfinityNeg = foreign.pushInfinityNeg
  var pushNaN = foreign.pushNaN
  var pushNaNNeg = foreign.pushNaNNeg

  var pushArrayStart = foreign.pushArrayStart
  var pushArrayStartFixed = foreign.pushArrayStartFixed
  var pushArrayStartFixed32 = foreign.pushArrayStartFixed32
  var pushArrayStartFixed64 = foreign.pushArrayStartFixed64
  var pushObjectStart = foreign.pushObjectStart
  var pushObjectStartFixed = foreign.pushObjectStartFixed
  var pushObjectStartFixed32 = foreign.pushObjectStartFixed32
  var pushObjectStartFixed64 = foreign.pushObjectStartFixed64

  var pushByteString = foreign.pushByteString
  var pushByteStringStart = foreign.pushByteStringStart
  var pushUtf8String = foreign.pushUtf8String
  var pushUtf8StringStart = foreign.pushUtf8StringStart

  var pushSimpleUnassigned = foreign.pushSimpleUnassigned

  var pushTagStart = foreign.pushTagStart
  var pushTagStart4 = foreign.pushTagStart4
  var pushTagStart8 = foreign.pushTagStart8
  var pushTagUnassigned = foreign.pushTagUnassigned

  var pushBreak = foreign.pushBreak

  var pow = stdlib.Math.pow

  // -- Constants


  // -- Mutable Variables

  var offset = 0
  var inputLength = 0
  var code = 0

  // Decode a cbor string represented as Uint8Array
  // which is allocated on the heap from 0 to inputLength
  //
  // input - Int
  //
  // Returns Code - Int,
  // Success = 0
  // Error > 0
  function parse (input) {
    input = input | 0

    offset = 0
    inputLength = input

    while ((offset | 0) < (inputLength | 0)) {
      code = jumpTable[heap[offset] & 255](heap[offset] | 0) | 0

      if ((code | 0) > 0) {
        break
      }
    }

    return code | 0
  }

  // -- Helper Function

  function checkOffset (n) {
    n = n | 0

    if ((((offset | 0) + (n | 0)) | 0) < (inputLength | 0)) {
      return 0
    }

    return 1
  }

  function readUInt16 (n) {
    n = n | 0

    return (
      (heap[n | 0] << 8) | heap[(n + 1) | 0]
    ) | 0
  }

  function readUInt32 (n) {
    n = n | 0

    return (
      (heap[n | 0] << 24) | (heap[(n + 1) | 0] << 16) | (heap[(n + 2) | 0] << 8) | heap[(n + 3) | 0]
    ) | 0
  }

  // -- Initial Byte Handlers

  function INT_P (octet) {
    octet = octet | 0

    pushInt(octet | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function UINT_P_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushInt(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2) | 0

    return 0
  }

  function UINT_P_16 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushInt(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3) | 0

    return 0
  }

  function UINT_P_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushInt32(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function UINT_P_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushInt64(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function INT_N (octet) {
    octet = octet | 0

    pushInt((-1 - ((octet - 32) | 0)) | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function UINT_N_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushInt(
      (-1 - (heap[(offset + 1) | 0] | 0)) | 0
    )

    offset = (offset + 2) | 0

    return 0
  }

  function UINT_N_16 (octet) {
    octet = octet | 0

    var val = 0

    if (checkOffset(2) | 0) {
      return 1
    }

    val = readUInt16((offset + 1) | 0) | 0
    pushInt((-1 - (val | 0)) | 0)

    offset = (offset + 3) | 0

    return 0
  }

  function UINT_N_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushInt32Neg(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function UINT_N_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushInt64Neg(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function BYTE_STRING (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var step = 0

    step = (octet - 64) | 0
    if (checkOffset(step | 0) | 0) {
      return 1
    }

    start = (offset + 1) | 0
    end = (((offset + 1) | 0) + (step | 0)) | 0

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_8 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(1) | 0) {
      return 1
    }

    length = heap[(offset + 1) | 0] | 0
    start = (offset + 2) | 0
    end = (((offset + 2) | 0) + (length | 0)) | 0

    if (checkOffset((length + 1) | 0) | 0) {
      return 1
    }

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_16 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(2) | 0) {
      return 1
    }

    length = readUInt16((offset + 1) | 0) | 0
    start = (offset + 3) | 0
    end = (((offset + 3) | 0) + (length | 0)) | 0


    if (checkOffset((length + 2) | 0) | 0) {
      return 1
    }

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_32 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(4) | 0) {
      return 1
    }

    length = readUInt32((offset + 1) | 0) | 0
    start = (offset + 5) | 0
    end = (((offset + 5) | 0) + (length | 0)) | 0


    if (checkOffset((length + 4) | 0) | 0) {
      return 1
    }

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_64 (octet) {
    // NOT IMPLEMENTED
    octet = octet | 0

    return 1
  }

  function BYTE_STRING_BREAK (octet) {
    octet = octet | 0

    pushByteStringStart()

    offset = (offset + 1) | 0

    return 0
  }

  function UTF8_STRING (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var step = 0

    step = (octet - 96) | 0

    if (checkOffset(step | 0) | 0) {
      return 1
    }

    start = (offset + 1) | 0
    end = (((offset + 1) | 0) + (step | 0)) | 0

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_8 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(1) | 0) {
      return 1
    }

    length = heap[(offset + 1) | 0] | 0
    start = (offset + 2) | 0
    end = (((offset + 2) | 0) + (length | 0)) | 0

    if (checkOffset((length + 1) | 0) | 0) {
      return 1
    }

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_16 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(2) | 0) {
      return 1
    }

    length = readUInt16((offset + 1) | 0) | 0
    start = (offset + 3) | 0
    end = (((offset + 3) | 0) + (length | 0)) | 0

    if (checkOffset((length + 2) | 0) | 0) {
      return 1
    }

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_32 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(4) | 0) {
      return 1
    }

    length = readUInt32((offset + 1) | 0) | 0
    start = (offset + 5) | 0
    end = (((offset + 5) | 0) + (length | 0)) | 0

    if (checkOffset((length + 4) | 0) | 0) {
      return 1
    }

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_64 (octet) {
    // NOT IMPLEMENTED
    octet = octet | 0

    return 1
  }

  function UTF8_STRING_BREAK (octet) {
    octet = octet | 0

    pushUtf8StringStart()

    offset = (offset + 1) | 0

    return 0
  }

  function ARRAY (octet) {
    octet = octet | 0

    pushArrayStartFixed((octet - 128) | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function ARRAY_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushArrayStartFixed(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2) | 0

    return 0
  }

  function ARRAY_16 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushArrayStartFixed(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3) | 0

    return 0
  }

  function ARRAY_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushArrayStartFixed32(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function ARRAY_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushArrayStartFixed64(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function ARRAY_BREAK (octet) {
    octet = octet | 0

    pushArrayStart()

    offset = (offset + 1) | 0

    return 0
  }

  function MAP (octet) {
    octet = octet | 0

    var step = 0

    step = (octet - 160) | 0

    if (checkOffset(step | 0) | 0) {
      return 1
    }

    pushObjectStartFixed(step | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function MAP_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushObjectStartFixed(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2) | 0

    return 0
  }

  function MAP_16 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushObjectStartFixed(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3) | 0

    return 0
  }

  function MAP_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushObjectStartFixed32(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function MAP_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushObjectStartFixed64(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function MAP_BREAK (octet) {
    octet = octet | 0

    pushObjectStart()

    offset = (offset + 1) | 0

    return 0
  }

  function TAG_KNOWN (octet) {
    octet = octet | 0

    pushTagStart((octet - 192| 0) | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BIGNUM_POS (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BIGNUM_NEG (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_FRAC (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BIGNUM_FLOAT (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_UNASSIGNED (octet) {
    octet = octet | 0

    pushTagStart((octet - 192| 0) | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BASE64_URL (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BASE64 (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BASE16 (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_MORE_1 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushTagStart(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2 | 0)

    return 0
  }

  function TAG_MORE_2 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushTagStart(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3 | 0)

    return 0
  }

  function TAG_MORE_4 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushTagStart4(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5 | 0)

    return 0
  }

  function TAG_MORE_8 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushTagStart8(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9 | 0)

    return 0
  }

  function SIMPLE_UNASSIGNED (octet) {
    octet = octet | 0

    pushSimpleUnassigned(((octet | 0) - 224) | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_FALSE (octet) {
    octet = octet | 0

    pushFalse()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_TRUE (octet) {
    octet = octet | 0

    pushTrue()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_NULL (octet) {
    octet = octet | 0

    pushNull()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_UNDEFINED (octet) {
    octet = octet | 0

    pushUndefined()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_BYTE (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushSimpleUnassigned(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2)  | 0

    return 0
  }

  function SIMPLE_FLOAT_HALF (octet) {
    octet = octet | 0

    var f = 0
    var g = 0
    var sign = 1.0
    var exp = 0.0
    var mant = 0.0
    var r = 0.0
    if (checkOffset(2) | 0) {
      return 1
    }

    f = heap[(offset + 1) | 0] | 0
    g = heap[(offset + 2) | 0] | 0

    if ((f | 0) & 0x80) {
      sign = -1.0
    }

    exp = +(((f | 0) & 0x7C) >> 2)
    mant = +((((f | 0) & 0x03) << 8) | g)

    if (+exp == 0.0) {
      pushFloat(+(
        (+sign) * +5.9604644775390625e-8 * (+mant)
      ))
    } else if (+exp == 31.0) {
      if (+sign == 1.0) {
        if (+mant > 0.0) {
          pushNaN()
        } else {
          pushInfinity()
        }
      } else {
        if (+mant > 0.0) {
          pushNaNNeg()
        } else {
          pushInfinityNeg()
        }
      }
    } else {
      pushFloat(+(
        +sign * pow(+2, +(+exp - 25.0)) * +(1024.0 + mant)
      ))
    }

    offset = (offset + 3) | 0

    return 0
  }

  function SIMPLE_FLOAT_SINGLE (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushFloatSingle(
      heap[(offset + 1) | 0] | 0,
      heap[(offset + 2) | 0] | 0,
      heap[(offset + 3) | 0] | 0,
      heap[(offset + 4) | 0] | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function SIMPLE_FLOAT_DOUBLE (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushFloatDouble(
      heap[(offset + 1) | 0] | 0,
      heap[(offset + 2) | 0] | 0,
      heap[(offset + 3) | 0] | 0,
      heap[(offset + 4) | 0] | 0,
      heap[(offset + 5) | 0] | 0,
      heap[(offset + 6) | 0] | 0,
      heap[(offset + 7) | 0] | 0,
      heap[(offset + 8) | 0] | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function ERROR (octet) {
    octet = octet | 0

    return 1
  }

  function BREAK (octet) {
    octet = octet | 0

    pushBreak()

    offset = (offset + 1) | 0

    return 0
  }

  // -- Jump Table

  var jumpTable = [
    // Integer 0x00..0x17 (0..23)
    INT_P, // 0x00
    INT_P, // 0x01
    INT_P, // 0x02
    INT_P, // 0x03
    INT_P, // 0x04
    INT_P, // 0x05
    INT_P, // 0x06
    INT_P, // 0x07
    INT_P, // 0x08
    INT_P, // 0x09
    INT_P, // 0x0A
    INT_P, // 0x0B
    INT_P, // 0x0C
    INT_P, // 0x0D
    INT_P, // 0x0E
    INT_P, // 0x0F
    INT_P, // 0x10
    INT_P, // 0x11
    INT_P, // 0x12
    INT_P, // 0x13
    INT_P, // 0x14
    INT_P, // 0x15
    INT_P, // 0x16
    INT_P, // 0x17
    // Unsigned integer (one-byte uint8_t follows)
    UINT_P_8, // 0x18
    // Unsigned integer (two-byte uint16_t follows)
    UINT_P_16, // 0x19
    // Unsigned integer (four-byte uint32_t follows)
    UINT_P_32, // 0x1a
    // Unsigned integer (eight-byte uint64_t follows)
    UINT_P_64, // 0x1b
    ERROR, // 0x1c
    ERROR, // 0x1d
    ERROR, // 0x1e
    ERROR, // 0x1f
    // Negative integer -1-0x00..-1-0x17 (-1..-24)
    INT_N, // 0x20
    INT_N, // 0x21
    INT_N, // 0x22
    INT_N, // 0x23
    INT_N, // 0x24
    INT_N, // 0x25
    INT_N, // 0x26
    INT_N, // 0x27
    INT_N, // 0x28
    INT_N, // 0x29
    INT_N, // 0x2A
    INT_N, // 0x2B
    INT_N, // 0x2C
    INT_N, // 0x2D
    INT_N, // 0x2E
    INT_N, // 0x2F
    INT_N, // 0x30
    INT_N, // 0x31
    INT_N, // 0x32
    INT_N, // 0x33
    INT_N, // 0x34
    INT_N, // 0x35
    INT_N, // 0x36
    INT_N, // 0x37
    // Negative integer -1-n (one-byte uint8_t for n follows)
    UINT_N_8, // 0x38
    // Negative integer -1-n (two-byte uint16_t for n follows)
    UINT_N_16, // 0x39
    // Negative integer -1-n (four-byte uint32_t for nfollows)
    UINT_N_32, // 0x3a
    // Negative integer -1-n (eight-byte uint64_t for n follows)
    UINT_N_64, // 0x3b
    ERROR, // 0x3c
    ERROR, // 0x3d
    ERROR, // 0x3e
    ERROR, // 0x3f
    // byte string (0x00..0x17 bytes follow)
    BYTE_STRING, // 0x40
    BYTE_STRING, // 0x41
    BYTE_STRING, // 0x42
    BYTE_STRING, // 0x43
    BYTE_STRING, // 0x44
    BYTE_STRING, // 0x45
    BYTE_STRING, // 0x46
    BYTE_STRING, // 0x47
    BYTE_STRING, // 0x48
    BYTE_STRING, // 0x49
    BYTE_STRING, // 0x4A
    BYTE_STRING, // 0x4B
    BYTE_STRING, // 0x4C
    BYTE_STRING, // 0x4D
    BYTE_STRING, // 0x4E
    BYTE_STRING, // 0x4F
    BYTE_STRING, // 0x50
    BYTE_STRING, // 0x51
    BYTE_STRING, // 0x52
    BYTE_STRING, // 0x53
    BYTE_STRING, // 0x54
    BYTE_STRING, // 0x55
    BYTE_STRING, // 0x56
    BYTE_STRING, // 0x57
    // byte string (one-byte uint8_t for n, and then n bytes follow)
    BYTE_STRING_8, // 0x58
    // byte string (two-byte uint16_t for n, and then n bytes follow)
    BYTE_STRING_16, // 0x59
    // byte string (four-byte uint32_t for n, and then n bytes follow)
    BYTE_STRING_32, // 0x5a
    // byte string (eight-byte uint64_t for n, and then n bytes follow)
    BYTE_STRING_64, // 0x5b
    ERROR, // 0x5c
    ERROR, // 0x5d
    ERROR, // 0x5e
    // byte string, byte strings follow, terminated by "break"
    BYTE_STRING_BREAK, // 0x5f
    // UTF-8 string (0x00..0x17 bytes follow)
    UTF8_STRING, // 0x60
    UTF8_STRING, // 0x61
    UTF8_STRING, // 0x62
    UTF8_STRING, // 0x63
    UTF8_STRING, // 0x64
    UTF8_STRING, // 0x65
    UTF8_STRING, // 0x66
    UTF8_STRING, // 0x67
    UTF8_STRING, // 0x68
    UTF8_STRING, // 0x69
    UTF8_STRING, // 0x6A
    UTF8_STRING, // 0x6B
    UTF8_STRING, // 0x6C
    UTF8_STRING, // 0x6D
    UTF8_STRING, // 0x6E
    UTF8_STRING, // 0x6F
    UTF8_STRING, // 0x70
    UTF8_STRING, // 0x71
    UTF8_STRING, // 0x72
    UTF8_STRING, // 0x73
    UTF8_STRING, // 0x74
    UTF8_STRING, // 0x75
    UTF8_STRING, // 0x76
    UTF8_STRING, // 0x77
    // UTF-8 string (one-byte uint8_t for n, and then n bytes follow)
    UTF8_STRING_8, // 0x78
    // UTF-8 string (two-byte uint16_t for n, and then n bytes follow)
    UTF8_STRING_16, // 0x79
    // UTF-8 string (four-byte uint32_t for n, and then n bytes follow)
    UTF8_STRING_32, // 0x7a
    // UTF-8 string (eight-byte uint64_t for n, and then n bytes follow)
    UTF8_STRING_64, // 0x7b
    // UTF-8 string, UTF-8 strings follow, terminated by "break"
    ERROR, // 0x7c
    ERROR, // 0x7d
    ERROR, // 0x7e
    UTF8_STRING_BREAK, // 0x7f
    // array (0x00..0x17 data items follow)
    ARRAY, // 0x80
    ARRAY, // 0x81
    ARRAY, // 0x82
    ARRAY, // 0x83
    ARRAY, // 0x84
    ARRAY, // 0x85
    ARRAY, // 0x86
    ARRAY, // 0x87
    ARRAY, // 0x88
    ARRAY, // 0x89
    ARRAY, // 0x8A
    ARRAY, // 0x8B
    ARRAY, // 0x8C
    ARRAY, // 0x8D
    ARRAY, // 0x8E
    ARRAY, // 0x8F
    ARRAY, // 0x90
    ARRAY, // 0x91
    ARRAY, // 0x92
    ARRAY, // 0x93
    ARRAY, // 0x94
    ARRAY, // 0x95
    ARRAY, // 0x96
    ARRAY, // 0x97
    // array (one-byte uint8_t fo, and then n data items follow)
    ARRAY_8, // 0x98
    // array (two-byte uint16_t for n, and then n data items follow)
    ARRAY_16, // 0x99
    // array (four-byte uint32_t for n, and then n data items follow)
    ARRAY_32, // 0x9a
    // array (eight-byte uint64_t for n, and then n data items follow)
    ARRAY_64, // 0x9b
    // array, data items follow, terminated by "break"
    ERROR, // 0x9c
    ERROR, // 0x9d
    ERROR, // 0x9e
    ARRAY_BREAK, // 0x9f
    // map (0x00..0x17 pairs of data items follow)
    MAP, // 0xa0
    MAP, // 0xa1
    MAP, // 0xa2
    MAP, // 0xa3
    MAP, // 0xa4
    MAP, // 0xa5
    MAP, // 0xa6
    MAP, // 0xa7
    MAP, // 0xa8
    MAP, // 0xa9
    MAP, // 0xaA
    MAP, // 0xaB
    MAP, // 0xaC
    MAP, // 0xaD
    MAP, // 0xaE
    MAP, // 0xaF
    MAP, // 0xb0
    MAP, // 0xb1
    MAP, // 0xb2
    MAP, // 0xb3
    MAP, // 0xb4
    MAP, // 0xb5
    MAP, // 0xb6
    MAP, // 0xb7
    // map (one-byte uint8_t for n, and then n pairs of data items follow)
    MAP_8, // 0xb8
    // map (two-byte uint16_t for n, and then n pairs of data items follow)
    MAP_16, // 0xb9
    // map (four-byte uint32_t for n, and then n pairs of data items follow)
    MAP_32, // 0xba
    // map (eight-byte uint64_t for n, and then n pairs of data items follow)
    MAP_64, // 0xbb
    ERROR, // 0xbc
    ERROR, // 0xbd
    ERROR, // 0xbe
    // map, pairs of data items follow, terminated by "break"
    MAP_BREAK, // 0xbf
    // Text-based date/time (data item follows; see Section 2.4.1)
    TAG_KNOWN, // 0xc0
    // Epoch-based date/time (data item follows; see Section 2.4.1)
    TAG_KNOWN, // 0xc1
    // Positive bignum (data item "byte string" follows)
    TAG_KNOWN, // 0xc2
    // Negative bignum (data item "byte string" follows)
    TAG_KNOWN, // 0xc3
    // Decimal Fraction (data item "array" follows; see Section 2.4.3)
    TAG_KNOWN, // 0xc4
    // Bigfloat (data item "array" follows; see Section 2.4.3)
    TAG_KNOWN, // 0xc5
    // (tagged item)
    TAG_UNASSIGNED, // 0xc6
    TAG_UNASSIGNED, // 0xc7
    TAG_UNASSIGNED, // 0xc8
    TAG_UNASSIGNED, // 0xc9
    TAG_UNASSIGNED, // 0xca
    TAG_UNASSIGNED, // 0xcb
    TAG_UNASSIGNED, // 0xcc
    TAG_UNASSIGNED, // 0xcd
    TAG_UNASSIGNED, // 0xce
    TAG_UNASSIGNED, // 0xcf
    TAG_UNASSIGNED, // 0xd0
    TAG_UNASSIGNED, // 0xd1
    TAG_UNASSIGNED, // 0xd2
    TAG_UNASSIGNED, // 0xd3
    TAG_UNASSIGNED, // 0xd4
    // Expected Conversion (data item follows; see Section 2.4.4.2)
    TAG_UNASSIGNED, // 0xd5
    TAG_UNASSIGNED, // 0xd6
    TAG_UNASSIGNED, // 0xd7
    // (more tagged items, 1/2/4/8 bytes and then a data item follow)
    TAG_MORE_1, // 0xd8
    TAG_MORE_2, // 0xd9
    TAG_MORE_4, // 0xda
    TAG_MORE_8, // 0xdb
    ERROR, // 0xdc
    ERROR, // 0xdd
    ERROR, // 0xde
    ERROR, // 0xdf
    // (simple value)
    SIMPLE_UNASSIGNED, // 0xe0
    SIMPLE_UNASSIGNED, // 0xe1
    SIMPLE_UNASSIGNED, // 0xe2
    SIMPLE_UNASSIGNED, // 0xe3
    SIMPLE_UNASSIGNED, // 0xe4
    SIMPLE_UNASSIGNED, // 0xe5
    SIMPLE_UNASSIGNED, // 0xe6
    SIMPLE_UNASSIGNED, // 0xe7
    SIMPLE_UNASSIGNED, // 0xe8
    SIMPLE_UNASSIGNED, // 0xe9
    SIMPLE_UNASSIGNED, // 0xea
    SIMPLE_UNASSIGNED, // 0xeb
    SIMPLE_UNASSIGNED, // 0xec
    SIMPLE_UNASSIGNED, // 0xed
    SIMPLE_UNASSIGNED, // 0xee
    SIMPLE_UNASSIGNED, // 0xef
    SIMPLE_UNASSIGNED, // 0xf0
    SIMPLE_UNASSIGNED, // 0xf1
    SIMPLE_UNASSIGNED, // 0xf2
    SIMPLE_UNASSIGNED, // 0xf3
    // False
    SIMPLE_FALSE, // 0xf4
    // True
    SIMPLE_TRUE, // 0xf5
    // Null
    SIMPLE_NULL, // 0xf6
    // Undefined
    SIMPLE_UNDEFINED, // 0xf7
    // (simple value, one byte follows)
    SIMPLE_BYTE, // 0xf8
    // Half-Precision Float (two-byte IEEE 754)
    SIMPLE_FLOAT_HALF, // 0xf9
    // Single-Precision Float (four-byte IEEE 754)
    SIMPLE_FLOAT_SINGLE, // 0xfa
    // Double-Precision Float (eight-byte IEEE 754)
    SIMPLE_FLOAT_DOUBLE, // 0xfb
    ERROR, // 0xfc
    ERROR, // 0xfd
    ERROR, // 0xfe
    // "break" stop code
    BREAK // 0xff
  ]

  // --

  return {
    parse: parse
  }
}
