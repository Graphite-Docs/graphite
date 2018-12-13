
declare namespace codec {
  interface CodecEncoder {
    encode: (val: any) => any;
    decode: (val: any) => any;
    buffer: boolean
    type: string
  }

  interface CodecOptions {
    keyEncoding?: string | CodecEncoder
    valueEncoding?: string | CodecEncoder
  }

  interface Codec {
    encodeKey(key: any, opts?: codec.CodecOptions, batchOpts?: codec.CodecOptions): any;
    encodeValue(value: any, opts?: codec.CodecOptions, batchOpts?: codec.CodecOptions): any;
    decodeKey(key: any, opts?: codec.CodecOptions): any;
    decodeValue(value: any, opts?: codec.CodecOptions): any;
    encodeBatch(ops: any, opts?: codec.CodecOptions): any;
    encodeLtgt(ltgt: any): any;
    createStreamDecoder(opts: codec.CodecOptions): any;
    keyAsBuffer(opts?: codec.CodecOptions): any;
    valueAsBuffer(opts?: codec.CodecOptions): any;
  }

  interface CodecConstructor {
    new(options?: CodecOptions): Codec;
    (options?: CodecOptions): Codec;
  }
}

declare const codec: codec.CodecConstructor;

export = codec;