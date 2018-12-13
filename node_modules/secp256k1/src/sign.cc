#include <node.h>
#include <nan.h>
#include <secp256k1.h>
#include <secp256k1_recovery.h>

#include "async.h"
#include "messages.h"
#include "util.h"


extern secp256k1_context* secp256k1ctx;

class SignWorker : public AsyncWorker {
  public:
    SignWorker(const v8::Local<v8::Object>& msg32_buffer, const v8::Local<v8::Object>& seckey_buffer, Nan::Callback *callback)
      : AsyncWorker(callback) {
        CHECK_TYPE_BUFFER_ASYNC(msg32_buffer, MSG32_TYPE_INVALID);
        CHECK_BUFFER_LENGTH_ASYNC(msg32_buffer, 32, MSG32_LENGTH_INVALID);
        msg32 = (const unsigned char*) node::Buffer::Data(msg32_buffer);

        CHECK_TYPE_BUFFER_ASYNC(seckey_buffer, EC_PRIVKEY_TYPE_INVALID);
        CHECK_BUFFER_LENGTH_ASYNC(seckey_buffer, 32, EC_PRIVKEY_LENGTH_INVALID);
        seckey = (const unsigned char*) node::Buffer::Data(seckey_buffer);
      }

    void Execute () {
      if (ErrorMessage() != NULL) {
        return;
      }

      secp256k1_ecdsa_recoverable_signature sig;
      if (secp256k1_ecdsa_sign_recoverable(secp256k1ctx, &sig, msg32, seckey, NULL, NULL) == 0) {
        return SetError(AsyncWorker::Error, ECDSA_SIGN_FAIL);
      }

      secp256k1_ecdsa_recoverable_signature_serialize_compact(secp256k1ctx, &output[0], &recid, &sig);
    }

    void HandleOKCallback () {
      Nan::HandleScope scope;

      v8::Local<v8::Object> obj = Nan::New<v8::Object>();
      obj->Set(Nan::New<v8::String>("signature").ToLocalChecked(), COPY_BUFFER(&output[0], 64));
      obj->Set(Nan::New<v8::String>("recovery").ToLocalChecked(), Nan::New<v8::Number>(recid));

      v8::Local<v8::Value> argv[] = {Nan::Null(), obj};
      callback->Call(2, argv);
    }

  protected:
    const unsigned char* msg32;
    const unsigned char* seckey;
    unsigned char output[64];
    int recid;
};

NAN_METHOD(sign) {
  Nan::HandleScope scope;

  v8::Local<v8::Function> callback = info[2].As<v8::Function>();
  CHECK_TYPE_FUNCTION(callback, CALLBACK_TYPE_INVALID);

  SignWorker* worker = new SignWorker(
    info[0].As<v8::Object>(),
    info[1].As<v8::Object>(),
    new Nan::Callback(callback));

  Nan::AsyncQueueWorker(worker);
}

NAN_METHOD(signSync) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> msg32_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(msg32_buffer, MSG32_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(msg32_buffer, 32, MSG32_LENGTH_INVALID);
  const unsigned char* msg32 = (const unsigned char*) node::Buffer::Data(msg32_buffer);

  v8::Local<v8::Object> seckey_buffer = info[1].As<v8::Object>();
  CHECK_TYPE_BUFFER(seckey_buffer, EC_PRIVKEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(seckey_buffer, 32, EC_PRIVKEY_LENGTH_INVALID);
  const unsigned char* seckey = (const unsigned char*) node::Buffer::Data(seckey_buffer);

  secp256k1_ecdsa_recoverable_signature sig;
  if (secp256k1_ecdsa_sign_recoverable(secp256k1ctx, &sig, msg32, seckey, NULL, NULL) == 0) {
    return Nan::ThrowError(ECDSA_SIGN_FAIL);
  }

  unsigned char output[64];
  int recid;
  secp256k1_ecdsa_recoverable_signature_serialize_compact(secp256k1ctx, &output[0], &recid, &sig);

  v8::Local<v8::Object> obj = Nan::New<v8::Object>();
  obj->Set(Nan::New<v8::String>("signature").ToLocalChecked(), COPY_BUFFER(&output[0], 64));
  obj->Set(Nan::New<v8::String>("recovery").ToLocalChecked(), Nan::New<v8::Number>(recid));
  info.GetReturnValue().Set(obj);
}
