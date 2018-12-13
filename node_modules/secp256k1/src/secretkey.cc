#include <node.h>
#include <nan.h>
#include <secp256k1.h>
#include <lax_der_privatekey_parsing.h>

#include "messages.h"
#include "util.h"


extern secp256k1_context* secp256k1ctx;

NAN_METHOD(secretKeyVerify) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> seckey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(seckey_buffer, EC_PRIVKEY_TYPE_INVALID);
  const unsigned char* seckey = (const unsigned char*) node::Buffer::Data(seckey_buffer);

  if (node::Buffer::Length(seckey_buffer) != 32) {
    return info.GetReturnValue().Set(Nan::New<v8::Boolean>(false));
  }

  int result = secp256k1_ec_seckey_verify(secp256k1ctx, seckey);

  info.GetReturnValue().Set(Nan::New<v8::Boolean>(result));
}

NAN_METHOD(secretKeyExport) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> seckey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(seckey_buffer, EC_PRIVKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(seckey_buffer, 32, EC_PRIVKEY_LENGTH_INVALID);
  const unsigned char* seckey = (const unsigned char*) node::Buffer::Data(seckey_buffer);

  int compressed = 1;
  v8::Local<v8::Value> compressed_value = info[1];
  if (!compressed_value->IsUndefined()) {
    CHECK_TYPE_BOOLEAN(compressed_value, COMPRESSED_TYPE_INVALID);
    if (!compressed_value->BooleanValue()) {
      compressed = 0;
    }
  }

  unsigned char privkey[279];
  size_t privkeylen;
  if (ec_privkey_export_der(secp256k1ctx, &privkey[0], &privkeylen, seckey, compressed) == 0) {
    return Nan::ThrowError(EC_PRIVKEY_EXPORT_DER_FAIL);
  }

  info.GetReturnValue().Set(COPY_BUFFER(privkey, privkeylen));
}

NAN_METHOD(secretKeyImport) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> privkey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(privkey_buffer, EC_PRIVKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH_GT_ZERO(privkey_buffer, EC_PRIVKEY_LENGTH_INVALID);
  const unsigned char* privkey = (const unsigned char*) node::Buffer::Data(privkey_buffer);
  size_t privkeylen = node::Buffer::Length(privkey_buffer);

  unsigned char seckey[32];
  if (ec_privkey_import_der(secp256k1ctx, &seckey[0], privkey, privkeylen) == 0) {
    return Nan::ThrowError(EC_PRIVKEY_IMPORT_DER_FAIL);
  }

  info.GetReturnValue().Set(COPY_BUFFER(seckey, 32));
}

NAN_METHOD(secretKeyTweakAdd) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> seckey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(seckey_buffer, EC_PRIVKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(seckey_buffer, 32, EC_PRIVKEY_LENGTH_INVALID);
  unsigned char seckey[32];
  memcpy(&seckey[0], node::Buffer::Data(seckey_buffer), 32);

  v8::Local<v8::Object> tweak_buffer = info[1].As<v8::Object>();
  CHECK_TYPE_BUFFER(tweak_buffer, TWEAK_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(tweak_buffer, 32, TWEAK_LENGTH_INVALID);
  const unsigned char* tweak = (unsigned char *) node::Buffer::Data(tweak_buffer);

  if (secp256k1_ec_privkey_tweak_add(secp256k1ctx, &seckey[0], tweak) == 0) {
    return Nan::ThrowError(EC_PRIVKEY_TWEAK_ADD_FAIL);
  }

  info.GetReturnValue().Set(COPY_BUFFER(&seckey[0], 32));
}

NAN_METHOD(secretKeyTweakMul) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> seckey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(seckey_buffer, EC_PRIVKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(seckey_buffer, 32, EC_PRIVKEY_LENGTH_INVALID);
  unsigned char seckey[32];
  memcpy(&seckey[0], node::Buffer::Data(seckey_buffer), 32);

  v8::Local<v8::Object> tweak_buffer = info[1].As<v8::Object>();
  CHECK_TYPE_BUFFER(tweak_buffer, TWEAK_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(tweak_buffer, 32, TWEAK_LENGTH_INVALID);
  const unsigned char* tweak = (unsigned char *) node::Buffer::Data(tweak_buffer);

  if (secp256k1_ec_privkey_tweak_mul(secp256k1ctx, &seckey[0], tweak) == 0) {
    return Nan::ThrowError(EC_PRIVKEY_TWEAK_MUL_FAIL);
  }

  info.GetReturnValue().Set(COPY_BUFFER(&seckey[0], 32));
}
