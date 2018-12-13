#include <memory>
#include <node.h>
#include <nan.h>
#include <secp256k1.h>

#include "messages.h"
#include "util.h"

extern secp256k1_context* secp256k1ctx;

NAN_METHOD(publicKeyCreate) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> seckey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(seckey_buffer, EC_PRIVKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(seckey_buffer, 32, EC_PRIVKEY_LENGTH_INVALID);
  const unsigned char* seckey = (const unsigned char*) node::Buffer::Data(seckey_buffer);

  secp256k1_pubkey pubkey;
  if (secp256k1_ec_pubkey_create(secp256k1ctx, &pubkey, seckey) == 0) {
    return Nan::ThrowError(EC_PUBKEY_CREATE_FAIL);
  }

  unsigned char output[33];
  size_t outputlen = 33;
  secp256k1_ec_pubkey_serialize(secp256k1ctx, &output[0], &outputlen, &pubkey, SECP256K1_EC_COMPRESSED);

  info.GetReturnValue().Set(COPY_BUFFER(&output[0], outputlen));
}

NAN_METHOD(publicKeyConvert) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> pubkey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(pubkey_buffer, EC_PUBKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH2(pubkey_buffer, 33, 65, EC_PUBKEY_LENGTH_INVALID);
  const unsigned char* input = (unsigned char*) node::Buffer::Data(pubkey_buffer);
  size_t inputlen = node::Buffer::Length(pubkey_buffer);

  unsigned int flags = SECP256K1_EC_COMPRESSED;
  v8::Local<v8::Value> compressed = info[1];
  if (!compressed->IsUndefined()) {
    CHECK_TYPE_BOOLEAN(compressed, COMPRESSED_TYPE_INVALID);
    if (!compressed->BooleanValue()) {
      flags = SECP256K1_EC_UNCOMPRESSED;
    }
  }

  secp256k1_pubkey pubkey;
  if (secp256k1_ec_pubkey_parse(secp256k1ctx, &pubkey, input, inputlen) == 0) {
    return Nan::ThrowError(EC_PUBKEY_PARSE_FAIL);
  }

  unsigned char output[65];
  size_t outputlen = 65;
  secp256k1_ec_pubkey_serialize(secp256k1ctx, &output[0], &outputlen, &pubkey, flags);

  info.GetReturnValue().Set(COPY_BUFFER(&output[0], outputlen));
}

NAN_METHOD(publicKeyVerify) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> pubkey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(pubkey_buffer, EC_PUBKEY_TYPE_INVALID);
  const unsigned char* input = (unsigned char*) node::Buffer::Data(pubkey_buffer);
  size_t inputlen = node::Buffer::Length(pubkey_buffer);

  secp256k1_pubkey pubkey;
  int result = secp256k1_ec_pubkey_parse(secp256k1ctx, &pubkey, input, inputlen);

  info.GetReturnValue().Set(Nan::New<v8::Boolean>(result));
}

NAN_METHOD(publicKeyTweakAdd) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> pubkey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(pubkey_buffer, EC_PUBKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH2(pubkey_buffer, 33, 65, EC_PUBKEY_LENGTH_INVALID);
  const unsigned char* input = (unsigned char*) node::Buffer::Data(pubkey_buffer);
  size_t inputlen = node::Buffer::Length(pubkey_buffer);

  v8::Local<v8::Object> tweak_buffer = info[1].As<v8::Object>();
  CHECK_TYPE_BUFFER(tweak_buffer, TWEAK_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(tweak_buffer, 32, TWEAK_LENGTH_INVALID);
  const unsigned char* tweak = (const unsigned char *) node::Buffer::Data(tweak_buffer);

  secp256k1_pubkey pubkey;
  if (secp256k1_ec_pubkey_parse(secp256k1ctx, &pubkey, input, inputlen) == 0) {
    return Nan::ThrowError(EC_PUBKEY_PARSE_FAIL);
  }

  if (secp256k1_ec_pubkey_tweak_add(secp256k1ctx, &pubkey, tweak) == 0) {
    return Nan::ThrowError(EC_PUBKEY_TWEAK_ADD_FAIL);
  }

  unsigned char output[33];
  size_t outputlen = 33;
  secp256k1_ec_pubkey_serialize(secp256k1ctx, &output[0], &outputlen, &pubkey, SECP256K1_EC_COMPRESSED);

  info.GetReturnValue().Set(COPY_BUFFER(&output[0], outputlen));
}

NAN_METHOD(publicKeyTweakMul) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> pubkey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(pubkey_buffer, EC_PUBKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH2(pubkey_buffer, 33, 65, EC_PUBKEY_LENGTH_INVALID);
  const unsigned char* input = (unsigned char*) node::Buffer::Data(pubkey_buffer);
  size_t inputlen = node::Buffer::Length(pubkey_buffer);

  v8::Local<v8::Object> tweak_buffer = info[1].As<v8::Object>();
  CHECK_TYPE_BUFFER(tweak_buffer, TWEAK_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(tweak_buffer, 32, TWEAK_LENGTH_INVALID);
  const unsigned char* tweak = (const unsigned char *) node::Buffer::Data(tweak_buffer);

  secp256k1_pubkey pubkey;
  if (secp256k1_ec_pubkey_parse(secp256k1ctx, &pubkey, input, inputlen) == 0) {
    return Nan::ThrowError(EC_PUBKEY_PARSE_FAIL);
  }

  if (secp256k1_ec_pubkey_tweak_mul(secp256k1ctx, &pubkey, tweak) == 0) {
    return Nan::ThrowError(EC_PUBKEY_TWEAK_MUL_FAIL);
  }

  unsigned char output[33];
  size_t outputlen = 33;
  secp256k1_ec_pubkey_serialize(secp256k1ctx, &output[0], &outputlen, &pubkey, SECP256K1_EC_COMPRESSED);

  info.GetReturnValue().Set(COPY_BUFFER(&output[0], outputlen));
}

NAN_METHOD(publicKeyCombine) {
  Nan::HandleScope scope;

  v8::Local<v8::Array> buffers = info[0].As<v8::Array>();
  CHECK_TYPE_ARRAY(buffers, EC_PUBKEYS_TYPE_INVALID);
  CHECK_LENGTH_GT_ZERO(buffers, EC_PUBKEYS_LENGTH_INVALID);

  // vector instead new for public_keys?
  std::unique_ptr<secp256k1_pubkey[]> public_keys(new secp256k1_pubkey[buffers->Length()]);
  std::unique_ptr<secp256k1_pubkey*[]> ins(new secp256k1_pubkey*[buffers->Length()]);
  for (unsigned int i = 0; i < buffers->Length(); ++i) {
    v8::Local<v8::Object> pubkey_buffer = v8::Local<v8::Object>::Cast(buffers->Get(i));
    CHECK_TYPE_BUFFER(pubkey_buffer, EC_PUBKEY_TYPE_INVALID);
    CHECK_BUFFER_LENGTH2(pubkey_buffer, 33, 65, EC_PUBKEY_LENGTH_INVALID);

    const unsigned char* input = (unsigned char*) node::Buffer::Data(pubkey_buffer);
    size_t inputlen = node::Buffer::Length(pubkey_buffer);
    if (secp256k1_ec_pubkey_parse(secp256k1ctx, &public_keys[i], input, inputlen) == 0) {
      return Nan::ThrowError(EC_PUBKEY_PARSE_FAIL);
    }

    ins[i] = &public_keys[i];
  }

  secp256k1_pubkey pubkey;
  if (secp256k1_ec_pubkey_combine(secp256k1ctx, &pubkey, ins.get(), buffers->Length()) == 0) {
    return Nan::ThrowError(EC_PUBKEY_COMBINE_FAIL);
  }

  unsigned char output[33];
  size_t outputlen = 33;
  secp256k1_ec_pubkey_serialize(secp256k1ctx, &output[0], &outputlen, &pubkey, SECP256K1_EC_COMPRESSED);

  info.GetReturnValue().Set(COPY_BUFFER(&output[0], outputlen));
}
