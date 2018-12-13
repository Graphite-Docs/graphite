#include <node.h>
#include <nan.h>
#include <secp256k1.h>
#include <secp256k1_recovery.h>

#include "async.h"
#include "messages.h"
#include "util.h"


extern secp256k1_context* secp256k1ctx;

class RecoverWorker : public AsyncWorker {
  public:
    RecoverWorker(const v8::Local<v8::Object>& msg32_buffer, const v8::Local<v8::Object>& sig_buffer, const v8::Local<v8::Object>& recid_number, Nan::Callback *callback)
      : AsyncWorker(callback) {
        CHECK_TYPE_BUFFER_ASYNC(msg32_buffer, MSG32_TYPE_INVALID);
        CHECK_BUFFER_LENGTH_ASYNC(msg32_buffer, 32, MSG32_LENGTH_INVALID);
        msg32 = (const unsigned char*) node::Buffer::Data(msg32_buffer);

        CHECK_TYPE_BUFFER_ASYNC(sig_buffer, ECDSA_SIGNATURE_TYPE_INVALID);
        CHECK_BUFFER_LENGTH_ASYNC(sig_buffer, 64, ECDSA_SIGNATURE_LENGTH_INVALID);
        sig_input = (unsigned char*) node::Buffer::Data(sig_buffer);

        CHECK_TYPE_NUMBER_ASYNC(recid_number, ECDSA_SIGNATURE_RECOVERY_ID_TYPE_INVALID);
        CHECK_NUMBER_IN_INTERVAL_ASYNC(recid_number, -1, 4, ECDSA_SIGNATURE_RECOVERY_ID_VALUE_INVALID);
        recid = recid_number->IntegerValue();
    }

    void Execute () {
      if (ErrorMessage() != NULL) {
        return;
      }

      secp256k1_ecdsa_recoverable_signature sig;
      if (secp256k1_ecdsa_recoverable_signature_parse_compact(secp256k1ctx, &sig, sig_input, recid) == 0) {
        return SetError(AsyncWorker::Error, ECDSA_SIGNATURE_PARSE_FAIL);
      }

      secp256k1_pubkey pubkey;
      if (secp256k1_ecdsa_recover(secp256k1ctx, &pubkey, &sig, msg32) == 0) {
        return SetError(AsyncWorker::Error, ECDSA_RECOVER_FAIL);
      }

      size_t outputlen = 33;
      secp256k1_ec_pubkey_serialize(secp256k1ctx, &output[0], &outputlen, &pubkey, SECP256K1_EC_COMPRESSED);
    }

    void HandleOKCallback () {
      Nan::HandleScope scope;

      v8::Local<v8::Value> argv[] = {Nan::Null(), COPY_BUFFER(&output[0], 33)};
      callback->Call(2, argv);
    }

  protected:
    const unsigned char* msg32;
    const unsigned char* sig_input;
    int recid;
    unsigned char output[33];
};

NAN_METHOD(recover) {
  Nan::HandleScope scope;

  v8::Local<v8::Function> callback = info[3].As<v8::Function>();
  CHECK_TYPE_FUNCTION(callback, CALLBACK_TYPE_INVALID);

  RecoverWorker* worker = new RecoverWorker(
    info[0].As<v8::Object>(),
    info[1].As<v8::Object>(),
    info[2].As<v8::Object>(),
    new Nan::Callback(callback));

  Nan::AsyncQueueWorker(worker);
}

NAN_METHOD(recoverSync) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> msg32_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(msg32_buffer, MSG32_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(msg32_buffer, 32, MSG32_LENGTH_INVALID);
  const unsigned char* msg32 = (const unsigned char*) node::Buffer::Data(msg32_buffer);

  v8::Local<v8::Object> sig_buffer = info[1].As<v8::Object>();
  CHECK_TYPE_BUFFER(sig_buffer, ECDSA_SIGNATURE_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(sig_buffer, 64, ECDSA_SIGNATURE_LENGTH_INVALID);
  const unsigned char* input = (unsigned char*) node::Buffer::Data(sig_buffer);

  v8::Local<v8::Object> recid_number = info[2].As<v8::Object>();
  CHECK_TYPE_NUMBER(recid_number, ECDSA_SIGNATURE_RECOVERY_ID_TYPE_INVALID);
  CHECK_NUMBER_IN_INTERVAL(recid_number, -1, 4, ECDSA_SIGNATURE_RECOVERY_ID_VALUE_INVALID);
  int recid = recid_number->IntegerValue();

  secp256k1_ecdsa_recoverable_signature sig;
  if (secp256k1_ecdsa_recoverable_signature_parse_compact(secp256k1ctx, &sig, input, recid) == 0) {
    return Nan::ThrowError(ECDSA_SIGNATURE_PARSE_FAIL);
  }

  secp256k1_pubkey pubkey;
  if (secp256k1_ecdsa_recover(secp256k1ctx, &pubkey, &sig, msg32) == 0) {
    return Nan::ThrowError(ECDSA_RECOVER_FAIL);
  }

  unsigned char output[33];
  size_t outputlen = 33;
  secp256k1_ec_pubkey_serialize(secp256k1ctx, &output[0], &outputlen, &pubkey, SECP256K1_EC_COMPRESSED);
  info.GetReturnValue().Set(COPY_BUFFER(&output[0], 33));
}
