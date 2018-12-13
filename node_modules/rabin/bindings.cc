#include <stdlib.h>
#include <nan.h>
#include "src/rabin_wrap.h"

using namespace v8;

NAN_METHOD(Rabin) {
  info.GetReturnValue().Set(RabinWrap::NewInstance());
}

NAN_MODULE_INIT(InitAll) {
  RabinWrap::Init();
  Nan::Set(target, Nan::New<String>("rabin").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Rabin)).ToLocalChecked());
}

NODE_MODULE(rabin, InitAll)
