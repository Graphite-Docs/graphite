#include <node.h>
#include <nan.h>
#include <secp256k1.h>
#include <secp256k1_ecdh.h>

#include "async.h"
#include "messages.h"
#include "util.h"


extern secp256k1_context* secp256k1ctx;

class ECDHWorker : public AsyncWorker {
  public:
    ECDHWorker(const v8::Local<v8::Object>& pubkey_buffer, const v8::Local<v8::Object>& seckey_buffer, Nan::Callback *callback)
      : AsyncWorker(callback) {
        CHECK_TYPE_BUFFER_ASYNC(pubkey_buffer, EC_PUBKEY_TYPE_INVALID);
        CHECK_BUFFER_LENGTH2_ASYNC(pubkey_buffer, 33, 65, EC_PUBKEY_LENGTH_INVALID);
        pubkey_input = (unsigned char*) node::Buffer::Data(pubkey_buffer);
        pubkey_inputlen = node::Buffer::Length(pubkey_buffer);

        CHECK_TYPE_BUFFER_ASYNC(seckey_buffer, EC_PRIVKEY_TYPE_INVALID);
        CHECK_BUFFER_LENGTH_ASYNC(seckey_buffer, 32, EC_PRIVKEY_LENGTH_INVALID);
        seckey = (const unsigned char*) node::Buffer::Data(seckey_buffer);
      }

    void Execute () {
      if (ErrorMessage() != NULL) {
        return;
      }

      secp256k1_pubkey pubkey;
      if (secp256k1_ec_pubkey_parse(secp256k1ctx, &pubkey, pubkey_input, pubkey_inputlen) == 0) {
        return SetError(AsyncWorker::Error, EC_PUBKEY_PARSE_FAIL);
      }

      if (secp256k1_ecdh(secp256k1ctx, &output[0], &pubkey, seckey) == 0) {
        return SetError(AsyncWorker::Error, ECDH_FAIL);
      }
    }

    void HandleOKCallback() {
      Nan::HandleScope scope;

      v8::Local<v8::Value> argv[] = {Nan::Null(), COPY_BUFFER(&output[0], 32)};
      callback->Call(2, argv);
    }

  protected:
    const unsigned char* pubkey_input;
    size_t pubkey_inputlen;
    const unsigned char* seckey;
    unsigned char output[32];
};

NAN_METHOD(ecdh) {
  Nan::HandleScope scope;

  v8::Local<v8::Function> callback = info[2].As<v8::Function>();
  CHECK_TYPE_FUNCTION(callback, CALLBACK_TYPE_INVALID);

  ECDHWorker* worker = new ECDHWorker(
    info[0].As<v8::Object>(),
    info[1].As<v8::Object>(),
    new Nan::Callback(callback));

  Nan::AsyncQueueWorker(worker);
}

NAN_METHOD(ecdhSync) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> pubkey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(pubkey_buffer, EC_PUBKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH2(pubkey_buffer, 33, 65, EC_PUBKEY_LENGTH_INVALID);
  const unsigned char* pubkey_input = (unsigned char*) node::Buffer::Data(pubkey_buffer);
  size_t pubkey_inputlen = node::Buffer::Length(pubkey_buffer);

  v8::Local<v8::Object> seckey_buffer = info[1].As<v8::Object>();
  CHECK_TYPE_BUFFER(seckey_buffer, EC_PRIVKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(seckey_buffer, 32, EC_PRIVKEY_LENGTH_INVALID);
  const unsigned char* seckey = (const unsigned char*) node::Buffer::Data(seckey_buffer);

  secp256k1_pubkey pubkey;
  if (secp256k1_ec_pubkey_parse(secp256k1ctx, &pubkey, pubkey_input, pubkey_inputlen) == 0) {
    return Nan::ThrowError(EC_PUBKEY_PARSE_FAIL);
  }

  unsigned char output[32];
  if (secp256k1_ecdh(secp256k1ctx, &output[0], &pubkey, seckey) == 0) {
    return Nan::ThrowError(ECDH_FAIL);
  }

  info.GetReturnValue().Set(COPY_BUFFER(&output[0], 32));
}
