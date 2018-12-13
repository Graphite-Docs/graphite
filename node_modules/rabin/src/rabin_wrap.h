#ifndef RABIN_WRAP_H
#define RABIN_WRAP_H

#include <nan.h>
#include "rabin.h"

using namespace v8;

class RabinWrap : public Nan::ObjectWrap {
public:
  struct rabin_t handle;

  static void Init ();
  static Local<Value> NewInstance ();
  RabinWrap ();
  ~RabinWrap ();

private:
  static NAN_METHOD(New);
  static NAN_METHOD(Configure);
  static NAN_METHOD(Fingerprint);
};

#endif
