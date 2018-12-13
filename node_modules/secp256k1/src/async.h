#ifndef _SECP256K1_NODE_ASYNC_
# define _SECP256K1_NODE_ASYNC_

#include <node.h>
#include <nan.h>


class AsyncWorker : public Nan::AsyncWorker {
  public:
    AsyncWorker(Nan::Callback *callback)
      : Nan::AsyncWorker(callback), errtype_(Error) {};

    enum ErrorType {
      Error,
      TypeError,
      RangeError
    };

    void SetError(ErrorType errtype, const char* msg) {
      errtype_ = errtype;
      SetErrorMessage(msg);
    }

    void HandleErrorCallback() {
      Nan::HandleScope scope;

      v8::Local<v8::Value> err;
      switch (errtype_) {
        case TypeError:
          err = v8::Exception::TypeError(Nan::New<v8::String>(ErrorMessage()).ToLocalChecked());
          break;
        case RangeError:
          err = v8::Exception::RangeError(Nan::New<v8::String>(ErrorMessage()).ToLocalChecked());
          break;
        default:
          err = v8::Exception::Error(Nan::New<v8::String>(ErrorMessage()).ToLocalChecked());
          break;
      }

      v8::Local<v8::Value> argv[] = {err};
      callback->Call(1, argv);
    }

  protected:
    ErrorType errtype_;
};

#endif
