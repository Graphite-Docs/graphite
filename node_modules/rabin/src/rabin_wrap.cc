#include <stdlib.h>
#include "rabin_wrap.h"

static Nan::Persistent<FunctionTemplate> rabin_constructor;

void get_fingerprints(rabin_t *hasher, Local<Array> bufs, Local<Array> lengths) {
  int count = bufs->Length();
  int chunk_idx = 0;

  for (int i = 0; i < count; i++) {
    uint8_t *buf = (uint8_t*) node::Buffer::Data(bufs->Get(i));
    int len = node::Buffer::Length(bufs->Get(i));
    uint8_t *ptr = &buf[0];

    while (1) {
      int remaining = rabin_next_chunk(hasher, ptr, len);
      if (remaining < 0) {
        break;
      }

      len -= remaining;
      ptr += remaining;

      lengths->Set(chunk_idx++, Nan::New<Number>(hasher->chunk_length));
    }
  }
}

RabinWrap::RabinWrap () {

}

RabinWrap::~RabinWrap () {

}

NAN_METHOD(RabinWrap::New) {
  RabinWrap* obj = new RabinWrap();
  obj->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(RabinWrap::Configure) {
  RabinWrap *self = Nan::ObjectWrap::Unwrap<RabinWrap>(info.This());

  if (!info[0]->IsNumber()) return Nan::ThrowError("first arg must be a number");
  if (!info[1]->IsNumber()) return Nan::ThrowError("second arg must be a number");
  if (!info[2]->IsNumber()) return Nan::ThrowError("third arg must be a number");

  struct rabin_t *handle = &(self->handle);

  handle->average_bits = info[0]->Uint32Value();
  handle->minsize = info[1]->Uint32Value();
  handle->maxsize = info[2]->Uint32Value();

  // Open a pull request if you need these to be configurable
  handle->mask = ((1<<handle->average_bits)-1);
  handle->polynomial = 0x3DA3358B4DC173LL;
  handle->polynomial_degree = 53;
  handle->polynomial_shift = (handle->polynomial_degree-8);

  rabin_init(handle);
}

NAN_METHOD(RabinWrap::Fingerprint) {
  RabinWrap *self = Nan::ObjectWrap::Unwrap<RabinWrap>(info.This());

  if (!info[0]->IsArray()) return Nan::ThrowError("source must be an array");
  Local<Array> src = info[0].As<Array>();

  if (!info[1]->IsArray()) return Nan::ThrowError("dest must be an array");
  Local<Array> dest = info[1].As<Array>();

  get_fingerprints(&(self->handle), src, dest);
}

void RabinWrap::Init () {
  Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(RabinWrap::New);
  rabin_constructor.Reset(tpl);
  tpl->SetClassName(Nan::New("RabinWrap").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  Nan::SetPrototypeMethod(tpl, "configure", RabinWrap::Configure);
  Nan::SetPrototypeMethod(tpl, "fingerprint", RabinWrap::Fingerprint);
}

Local<Value> RabinWrap::NewInstance () {
  Nan::EscapableHandleScope scope;

  Local<FunctionTemplate> constructorHandle = Nan::New<FunctionTemplate>(rabin_constructor);
  Local<Function> function = Nan::GetFunction(constructorHandle).ToLocalChecked();
  Local<Object> instance = Nan::NewInstance(function, 0, NULL).ToLocalChecked();

  return scope.Escape(instance);
}
