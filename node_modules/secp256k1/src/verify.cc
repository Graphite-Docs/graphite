#include <node.h>
#include <nan.h>
#include <secp256k1.h>

#include "async.h"
#include "messages.h"
#include "util.h"


extern secp256k1_context* secp256k1ctx;

class VerifyWorker : public AsyncWorker {
  public:
    VerifyWorker(const v8::Local<v8::Object>& msg32_buffer, const v8::Local<v8::Object>& sig_buffer, const v8::Local<v8::Object>& pubkey_buffer, Nan::Callback *callback)
      : AsyncWorker(callback) {
        CHECK_TYPE_BUFFER_ASYNC(msg32_buffer, MSG32_TYPE_INVALID);
        CHECK_BUFFER_LENGTH_ASYNC(msg32_buffer, 32, MSG32_LENGTH_INVALID);
        msg32 = (const unsigned char*) node::Buffer::Data(msg32_buffer);

        CHECK_TYPE_BUFFER_ASYNC(sig_buffer, ECDSA_SIGNATURE_TYPE_INVALID);
        CHECK_BUFFER_LENGTH_ASYNC(sig_buffer, 64, ECDSA_SIGNATURE_LENGTH_INVALID);
        sig_input = (unsigned char*) node::Buffer::Data(sig_buffer);

        CHECK_TYPE_BUFFER_ASYNC(pubkey_buffer, EC_PUBKEY_TYPE_INVALID);
        CHECK_BUFFER_LENGTH2_ASYNC(pubkey_buffer, 33, 65, EC_PUBKEY_LENGTH_INVALID);
        pubkey_input = (unsigned char*) node::Buffer::Data(pubkey_buffer);
        pubkey_inputlen = node::Buffer::Length(pubkey_buffer);
      }

    void Execute () {
      if (ErrorMessage() != NULL) {
        return;
      }

      secp256k1_ecdsa_signature sig;
      if (secp256k1_ecdsa_signature_parse_compact(secp256k1ctx, &sig, sig_input) == 0) {
        return SetError(AsyncWorker::Error, ECDSA_SIGNATURE_PARSE_FAIL);
      }

      secp256k1_pubkey pubkey;
      if (secp256k1_ec_pubkey_parse(secp256k1ctx, &pubkey, pubkey_input, pubkey_inputlen) == 0) {
        return SetError(AsyncWorker::Error, EC_PUBKEY_PARSE_FAIL);
      }

      result = secp256k1_ecdsa_verify(secp256k1ctx, &sig, msg32, &pubkey);
    }

    void HandleOKCallback () {
      Nan::HandleScope scope;

      v8::Local<v8::Value> argv[] = {Nan::Null(), Nan::New<v8::Boolean>(result)};
      callback->Call(2, argv);
    }

  protected:
    const unsigned char* msg32;
    const unsigned char* sig_input;
    const unsigned char* pubkey_input;
    size_t pubkey_inputlen;
    int result;
};


NAN_METHOD(verify) {
  Nan::HandleScope scope;

  v8::Local<v8::Function> callback = info[3].As<v8::Function>();
  CHECK_TYPE_FUNCTION(callback, CALLBACK_TYPE_INVALID);

  VerifyWorker* worker = new VerifyWorker(
    info[0].As<v8::Object>(),
    info[1].As<v8::Object>(),
    info[2].As<v8::Object>(),
    new Nan::Callback(callback));

  Nan::AsyncQueueWorker(worker);
}

NAN_METHOD(verifySync) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> msg32_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(msg32_buffer, MSG32_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(msg32_buffer, 32, MSG32_LENGTH_INVALID);
  const unsigned char* msg32 = (const unsigned char*) node::Buffer::Data(msg32_buffer);

  v8::Local<v8::Object> sig_buffer = info[1].As<v8::Object>();
  CHECK_TYPE_BUFFER(sig_buffer, ECDSA_SIGNATURE_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(sig_buffer, 64, ECDSA_SIGNATURE_LENGTH_INVALID);
  const unsigned char* sig_input = (unsigned char*) node::Buffer::Data(sig_buffer);

  v8::Local<v8::Object> pubkey_buffer = info[2].As<v8::Object>();
  CHECK_TYPE_BUFFER(pubkey_buffer, EC_PUBKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH2(pubkey_buffer, 33, 65, EC_PUBKEY_LENGTH_INVALID);
  const unsigned char* pubkey_input = (unsigned char*) node::Buffer::Data(pubkey_buffer);
  size_t pubkey_inputlen = node::Buffer::Length(pubkey_buffer);

  secp256k1_ecdsa_signature sig;
  if (secp256k1_ecdsa_signature_parse_compact(secp256k1ctx, &sig, sig_input) == 0) {
    return Nan::ThrowError(ECDSA_SIGNATURE_PARSE_FAIL);
  }

  secp256k1_pubkey pubkey;
  if (secp256k1_ec_pubkey_parse(secp256k1ctx, &pubkey, pubkey_input, pubkey_inputlen) == 0) {
    return Nan::ThrowError(EC_PUBKEY_PARSE_FAIL);
  }

  int result = secp256k1_ecdsa_verify(secp256k1ctx, &sig, msg32, &pubkey);

  info.GetReturnValue().Set(Nan::New<v8::Boolean>(result));
}
